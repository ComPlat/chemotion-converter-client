import React, {useState} from "react";
import PropTypes from "prop-types";
import {Alert, Button, Card, Form, Table} from "react-bootstrap";
import {additionalInfo} from "../../../../utils/identifierUtils";
import {getInputColumns} from "../../../../utils/profileUtils";

const TYPE_MAPPING = {
  header_value: "File regexp value",
  metadata_value: "Metadata value",
  column: "Table column",
  value: "Scalar value"
};

const profileShape = PropTypes.shape({
  data: PropTypes.shape({
    units: PropTypes.arrayOf(PropTypes.shape({
      base_unit: PropTypes.string,
      conversion_factor: PropTypes.string,
      found: PropTypes.string
    }))
  }),
  units: PropTypes.arrayOf(PropTypes.shape({
    rowIndex: PropTypes.number,
    base_unit: PropTypes.string,
    conversion_factor: PropTypes.string,
    found: PropTypes.string,
    outputTableIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    inputColumn: PropTypes.shape({
      tableIndex: PropTypes.number,
      columnIndex: PropTypes.number
    }),
    axis: PropTypes.string,
    unitMode: PropTypes.string
  })),
  tables: PropTypes.arrayOf(PropTypes.shape({
    header: PropTypes.object,
    table: PropTypes.object
  }))
});

function UnitAssignmentToggle({isOpen, onToggle}) {
  return (
    <Button
      variant={isOpen ? "outline-info" : "outline-success"}
      size="sm"
      onClick={onToggle}
      aria-expanded={isOpen}
    >
      <b>{isOpen ? "-" : "+"}</b>
    </Button>
  );
}

UnitAssignmentToggle.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired
};

function DeleteAssignmentButton({onClick}) {
  return (
    <Button
      variant="outline-danger"
      size="sm"
      type="button"
      onClick={onClick}
      aria-label="Delete SI unit assignment"
      title="Delete SI unit assignment"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M6.5 1h3l.5 1H13a.5.5 0 0 1 0 1h-.5l-.6 9.1A2 2 0 0 1 9.9 14H6.1a2 2 0 0 1-1.99-1.9L3.5 3H3a.5.5 0 0 1 0-1h3zM4.5 3l.6 9.03a1 1 0 0 0 1 .97h3.8a1 1 0 0 0 1-.97L11.5 3zm2 2a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5m3 0a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5a.5.5 0 0 1 .5-.5" />
      </svg>
    </Button>
  );
}

DeleteAssignmentButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

const defaultRowConfig = {
  outputTableIndex: "",
  inputColumn: "",
  axis: "X",
  unitMode: "Found"
};

const serializeColumnValue = (column) => {
  if (column === null || column === undefined) {
    return "";
  }

  return String(column.tableIndex) + ":" + String(column.columnIndex);
};

const deserializeColumnValue = (value) => {
  if (value === "") {
    return null;
  }

  const parts = value.split(":");
  const tableIndex = Number.parseInt(parts[0], 10);
  const columnIndex = Number.parseInt(parts[1], 10);

  if (Number.isNaN(tableIndex) || Number.isNaN(columnIndex)) {
    return null;
  }

  return {
    tableIndex,
    columnIndex
  };
};

const updateAutomatedOperationDescription = (tableData, operationsKey) => {
  const descriptionKey = operationsKey + "Description";
  const description = tableData[descriptionKey] || ["", ""];
  const operations = tableData[operationsKey];

  if (operations && operations.length > 0) {
    description[0] = operations.map((operation) => (
      operation.operator + " [" + (TYPE_MAPPING[operation.type] || "??") + additionalInfo(operation) + "]"
    )).join(" ");
  } else {
    description[0] = "";
  }

  tableData[descriptionKey] = description;
};

const findStoredUnitConfig = (storedUnits, unit, unitIndex) => {
  if (Array.isArray(storedUnits) === false) {
    return null;
  }

  return storedUnits.find((entry) => (
    entry.rowIndex === unitIndex
    && entry.found === unit.found
    && entry.base_unit === unit.base_unit
    && entry.conversion_factor === unit.conversion_factor
  )) || null;
};

const toRowConfig = (storedConfig) => {
  if (storedConfig === null) {
    return defaultRowConfig;
  }

  return {
    outputTableIndex: storedConfig.outputTableIndex === null || storedConfig.outputTableIndex === undefined
      ? ""
      : String(storedConfig.outputTableIndex),
    inputColumn: serializeColumnValue(storedConfig.inputColumn),
    axis: storedConfig.axis === "Y" ? "Y" : "X",
    unitMode: storedConfig.unitMode === "Base" ? "Base" : "Found"
  };
};

const persistUnitConfig = (profileValue, unit, unitIndex, config) => {
  const nextUnits = Array.isArray(profileValue.units) ? [...profileValue.units] : [];
  const existingIndex = nextUnits.findIndex((entry) => (
    entry.rowIndex === unitIndex
    && entry.found === unit.found
    && entry.base_unit === unit.base_unit
    && entry.conversion_factor === unit.conversion_factor
  ));
  const parsedOutputTableIndex = Number.parseInt(config.outputTableIndex, 10);

  const persistedConfig = {
    rowIndex: unitIndex,
    found: unit.found,
    base_unit: unit.base_unit,
    conversion_factor: unit.conversion_factor,
    outputTableIndex: Number.isNaN(parsedOutputTableIndex) ? "" : parsedOutputTableIndex,
    inputColumn: deserializeColumnValue(config.inputColumn),
    axis: config.axis,
    unitMode: config.unitMode
  };

  if (existingIndex === -1) {
    nextUnits.push(persistedConfig);
  } else {
    nextUnits[existingIndex] = persistedConfig;
  }

  return nextUnits;
};

const removeStoredUnitConfig = (profileValue, unit, unitIndex) => {
  const nextUnits = Array.isArray(profileValue.units) ? [...profileValue.units] : [];

  return nextUnits.filter((entry) => !(
    entry.rowIndex === unitIndex
    && entry.found === unit.found
    && entry.base_unit === unit.base_unit
    && entry.conversion_factor === unit.conversion_factor
  ));
};

export default function SIunits({profile, setProfile}) {
  const units = profile?.data?.units ?? [];
  const storedUnits = profile?.units ?? [];
  const inputColumns = getInputColumns(profile);
  const outputTables = profile?.tables ?? [];
  const [openRows, setOpenRows] = useState({});
  const [rowConfigs, setRowConfigs] = useState({});
  const [feedback, setFeedback] = useState(null);

  const toggleRow = (rowId, isOpen) => {
    setOpenRows((current) => ({
      ...current,
      [rowId]: isOpen ? false : true
    }));
  };

  const getRowConfig = (rowId, unit, unitIndex) => {
    if (rowConfigs[rowId]) {
      return rowConfigs[rowId];
    }

    return toRowConfig(findStoredUnitConfig(storedUnits, unit, unitIndex));
  };

  const updateRowConfig = (rowId, unit, unitIndex, key, value) => {
    const nextConfig = {
      ...getRowConfig(rowId, unit, unitIndex),
      [key]: value
    };

    setRowConfigs((current) => ({
      ...current,
      [rowId]: nextConfig
    }));

    setProfile({
      ...profile,
      units: persistUnitConfig(profile, unit, unitIndex, nextConfig)
    });
    setFeedback(null);
  };

  const deleteUnitAssignment = (unit, unitIndex, rowId) => {
    setRowConfigs((current) => {
      const nextConfigs = {...current};
      delete nextConfigs[rowId];
      return nextConfigs;
    });

    setOpenRows((current) => ({
      ...current,
      [rowId]: false
    }));

    setProfile({
      ...profile,
      units: removeStoredUnitConfig(profile, unit, unitIndex)
    });

    setFeedback(null);
  };

  const applyUnitAssignment = (unit, unitIndex, rowId) => {
    const config = getRowConfig(rowId, unit, unitIndex);
    const targetTableIndex = Number.parseInt(config.outputTableIndex, 10);

    if (Number.isNaN(targetTableIndex)) {
      setFeedback({
        rowId,
        variant: "danger",
        message: "Please enter an output table index."
      });
      return;
    }

    if (targetTableIndex < 0 || targetTableIndex >= outputTables.length) {
      setFeedback({
        rowId,
        variant: "danger",
        message: "Output table #" + targetTableIndex + " does not exist."
      });
      return;
    }

    const selectedColumn = deserializeColumnValue(config.inputColumn);
    if (selectedColumn === null) {
      setFeedback({
        rowId,
        variant: "danger",
        message: "Please select an input column."
      });
      return;
    }

    const axisConfig = config.axis === "X"
      ? {columnKey: "xColumn", operationsKey: "xOperations", unitsKey: "XUNITS"}
      : {columnKey: "yColumn", operationsKey: "yOperations", unitsKey: "YUNITS"};

    const nextProfile = {
      ...profile,
      tables: [...outputTables],
      units: persistUnitConfig(profile, unit, unitIndex, config)
    };
    const currentTable = outputTables[targetTableIndex] || {};
    const nextTable = {
      ...currentTable,
      header: {...(currentTable.header || {})},
      table: {...(currentTable.table || {})}
    };
    nextProfile.tables[targetTableIndex] = nextTable;

    nextTable.table[axisConfig.columnKey] = selectedColumn;
    nextTable.header[axisConfig.unitsKey] = config.unitMode === "Base" ? unit.base_unit : unit.found;

    const filteredOperations = Array.isArray(nextTable.table[axisConfig.operationsKey])
      ? nextTable.table[axisConfig.operationsKey].filter((operation) => (operation.source === "siUnits" ? false : true))
      : [];

    if (config.unitMode === "Base") {
      filteredOperations.push({
        type: "value",
        operator: "*",
        value: unit.conversion_factor,
        source: "siUnits"
      });
    }

    if (filteredOperations.length === 0) {
      delete nextTable.table[axisConfig.operationsKey];
    } else {
      nextTable.table[axisConfig.operationsKey] = filteredOperations;
    }

    updateAutomatedOperationDescription(nextTable.table, axisConfig.operationsKey);
    setProfile(nextProfile);
    setFeedback({
      rowId,
      variant: "success",
      message: "Output table #" + targetTableIndex + " updated."
    });
  };

  return (
    <Card className="mt-3">
      <Card.Header>SI Units</Card.Header>
      <Card.Body>
        {units.length === 0 ? (
          <small className="text-muted">
            No SI unit mappings found in <code>profile.data.units</code>.
          </small>
        ) : (
          <Table striped bordered hover size="sm" responsive>
            <thead>
              <tr>
                <th>Found</th>
                <th>Conversion</th>
                <th>Base</th>
                <th className="text-center" style={{width: "1%"}}></th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit, index) => {
                const rowId = (unit.found || "unit") + "-" + index;
                const hasStoredConfig = findStoredUnitConfig(storedUnits, unit, index) !== null;
                const isOpen = openRows[rowId] === undefined ? hasStoredConfig : Boolean(openRows[rowId]);
                const rowConfig = getRowConfig(rowId, unit, index);

                return (
                  <React.Fragment key={rowId}>
                    <tr>
                      <td>{unit.found}</td>
                      <td>{unit.conversion_factor}</td>
                      <td>{unit.base_unit}</td>
                      <td className="text-center align-middle">
                        <UnitAssignmentToggle
                          isOpen={isOpen}
                          onToggle={() => toggleRow(rowId, isOpen)}
                        />
                      </td>
                    </tr>
                    {isOpen && (
                      <>
                        <tr>
                          <td className="align-top bg-light">
                            <Form.Group className="mb-0">
                              <Form.Label className="small text-muted mb-1">
                                Assign to Output Table # using Input Column
                              </Form.Label>
                              <div className="d-flex gap-2 align-items-start">
                                <Form.Control
                                  type="number"
                                  min="0"
                                  size="sm"
                                  placeholder="0"
                                  value={rowConfig.outputTableIndex}
                                  onChange={(event) => updateRowConfig(rowId, unit, index, "outputTableIndex", event.target.value)}
                                />
                                <Form.Select
                                  size="sm"
                                  value={rowConfig.inputColumn}
                                  onChange={(event) => updateRowConfig(rowId, unit, index, "inputColumn", event.target.value)}
                                >
                                  <option value="">Select input column</option>
                                  {inputColumns.map((column) => (
                                    <option key={serializeColumnValue(column.value)} value={serializeColumnValue(column.value)}>
                                      {column.label}
                                    </option>
                                  ))}
                                </Form.Select>
                              </div>
                            </Form.Group>
                          </td>
                          <td className="align-top bg-light">
                            <Form.Group className="mb-0">
                              <Form.Label className="small text-muted mb-1">For</Form.Label>
                              <Form.Select
                                size="sm"
                                value={rowConfig.axis}
                                onChange={(event) => updateRowConfig(rowId, unit, index, "axis", event.target.value)}
                              >
                                <option value="X">X</option>
                                <option value="Y">Y</option>
                              </Form.Select>
                            </Form.Group>
                          </td>
                          <td className="align-top bg-light">
                            <Form.Group className="mb-0">
                              <Form.Label className="small text-muted mb-1">As</Form.Label>
                              <Form.Select
                                size="sm"
                                value={rowConfig.unitMode}
                                onChange={(event) => updateRowConfig(rowId, unit, index, "unitMode", event.target.value)}
                              >
                                <option value="Found">Found</option>
                                <option value="Base">Base</option>
                              </Form.Select>
                            </Form.Group>
                          </td>
                          <td className="align-top bg-light text-center">
                            <div className="d-flex flex-column align-items-center gap-2">
                              <DeleteAssignmentButton onClick={() => deleteUnitAssignment(unit, index, rowId)} />
                              <Button
                                variant="secondary"
                                size="sm"
                                type="button"
                                onClick={() => applyUnitAssignment(unit, index, rowId)}
                              >
                                Do
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {feedback?.rowId === rowId && (
                          <tr>
                            <td colSpan={4} className="bg-light border-top-0">
                              <Alert variant={feedback.variant} className="mb-0 py-2">
                                {feedback.message}
                              </Alert>
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
}

SIunits.propTypes = {
  profile: profileShape.isRequired,
  setProfile: PropTypes.func.isRequired
};

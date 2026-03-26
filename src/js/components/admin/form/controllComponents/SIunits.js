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
  tables: PropTypes.arrayOf(PropTypes.shape({
    header: PropTypes.object,
    table: PropTypes.object
  }))
});

function UnitAssignmentToggle({isOpen, onToggle}) {
  return (
    <Button
      variant={isOpen ? "outline-danger" : "outline-success"}
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

export default function SIunits({profile, setProfile}) {
  const units = profile?.data?.units ?? [];
  const inputColumns = getInputColumns(profile);
  const outputTables = profile?.tables ?? [];
  const [openRows, setOpenRows] = useState({});
  const [rowConfigs, setRowConfigs] = useState({});
  const [feedback, setFeedback] = useState(null);

  const toggleRow = (rowId) => {
    setOpenRows((current) => ({
      ...current,
      [rowId]: current[rowId] ? false : true
    }));
  };

  const getRowConfig = (rowId) => rowConfigs[rowId] || defaultRowConfig;

  const updateRowConfig = (rowId, key, value) => {
    setRowConfigs((current) => ({
      ...current,
      [rowId]: {
        ...(current[rowId] || defaultRowConfig),
        [key]: value
      }
    }));
    setFeedback(null);
  };

  const applyUnitAssignment = (unit, rowId) => {
    const config = getRowConfig(rowId);
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
      tables: [...outputTables]
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
      ? nextTable.table[axisConfig.operationsKey].filter((operation) => operation.source !== "siUnits")
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
                const isOpen = Boolean(openRows[rowId]);
                const rowConfig = getRowConfig(rowId);

                return (
                  <React.Fragment key={rowId}>
                    <tr>
                      <td>{unit.found}</td>
                      <td>{unit.conversion_factor}</td>
                      <td>{unit.base_unit}</td>
                      <td className="text-center align-middle">
                        <UnitAssignmentToggle
                          isOpen={isOpen}
                          onToggle={() => toggleRow(rowId)}
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
                                  onChange={(event) => updateRowConfig(rowId, "outputTableIndex", event.target.value)}
                                />
                                <Form.Select
                                  size="sm"
                                  value={rowConfig.inputColumn}
                                  onChange={(event) => updateRowConfig(rowId, "inputColumn", event.target.value)}
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
                                onChange={(event) => updateRowConfig(rowId, "axis", event.target.value)}
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
                                onChange={(event) => updateRowConfig(rowId, "unitMode", event.target.value)}
                              >
                                <option value="Found">Found</option>
                                <option value="Base">Base</option>
                              </Form.Select>
                            </Form.Group>
                          </td>
                          <td className="align-bottom bg-light text-center">
                            <Button
                              variant="secondary"
                              size="sm"
                              type="button"
                              onClick={() => applyUnitAssignment(unit, rowId)}
                            >
                              Do
                            </Button>
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

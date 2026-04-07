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

const SI_DESCRIPTION_PREFIX = "[SI Units]";

const profileShape = PropTypes.shape({
  data: PropTypes.shape({
    units: PropTypes.arrayOf(PropTypes.shape({
      base_unit: PropTypes.string,
      conversion_factor: PropTypes.string,
      found: PropTypes.string,
      uuid: PropTypes.string
    }))
  }),
  units: PropTypes.arrayOf(PropTypes.shape({
    assignmentId: PropTypes.string,
    rowIndex: PropTypes.number,
    base_unit: PropTypes.string,
    conversion_factor: PropTypes.string,
    found: PropTypes.string,
    uuid: PropTypes.string,
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

const defaultAssignmentContextShape = PropTypes.shape({
  outputTableIndex: PropTypes.number,
  axis: PropTypes.oneOf(["X", "Y"])
});

function UnitAssignmentToggle({isOpen, onToggle}) {
  return (
    <Button
      variant={isOpen ? "outline-info" : "outline-success"}
      size="sm"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={isOpen ? "Hide SI unit assignment" : "Show SI unit assignment"}
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

function AddAssignmentButton({onClick}) {
  return (
    <Button
      variant="outline-success"
      size="sm"
      type="button"
      onClick={onClick}
      aria-label="Add SI unit assignment"
      title="Add SI unit assignment"
    >
      <b>+</b>
    </Button>
  );
}

AddAssignmentButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

const defaultAssignmentConfig = {
  assignmentId: "",
  outputTableIndex: "",
  inputColumn: "",
  axis: "X",
  unitMode: "Found"
};

const createAssignmentId = () => (
  "assignment-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8)
);

const createAssignmentConfig = (assignmentId = createAssignmentId(), overrides = {}) => ({
  ...defaultAssignmentConfig,
  ...overrides,
  assignmentId
});

const getAssignmentDefaultsFromContext = (defaultAssignmentContext) => {
  const defaults = {};

  if (Number.isInteger(defaultAssignmentContext?.outputTableIndex) && defaultAssignmentContext.outputTableIndex >= 0) {
    defaults.outputTableIndex = String(defaultAssignmentContext.outputTableIndex);
  }

  if (defaultAssignmentContext?.axis === "X" || defaultAssignmentContext?.axis === "Y") {
    defaults.axis = defaultAssignmentContext.axis;
  }

  return defaults;
};

const hasUuid = (value) => typeof value === "string" && value.trim() !== "";

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

const unitHasUuidCollision = (allUnits, unit) => {
  if (hasUuid(unit?.uuid) === false) {
    return false;
  }

  return allUnits.filter((candidate) => candidate.uuid === unit.uuid).length > 1;
};

const isSameUnitEntry = (entry, unit, unitIndex, allUnits) => {
  if (hasUuid(unit?.uuid) && hasUuid(entry?.uuid)) {
    if (entry.uuid !== unit.uuid) {
      return false;
    }

    if (unitHasUuidCollision(allUnits, unit)) {
      return entry.rowIndex === unitIndex;
    }

    return true;
  }

  return entry.rowIndex === unitIndex;
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

const buildSiUnitsDescription = (unit, config, targetTableIndex) => {
  const axisLabel = config.axis === "X" ? "X values" : "Y values";

  if (config.unitMode === "Base") {
    return `${SI_DESCRIPTION_PREFIX} For Output Table #${targetTableIndex} ${axisLabel}, the found unit "${unit.found}" from the SI Units table is converted to the base unit "${unit.base_unit}" using conversion factor ${unit.conversion_factor}.`;
  }

  return `${SI_DESCRIPTION_PREFIX} For Output Table #${targetTableIndex} ${axisLabel}, the found unit "${unit.found}" from the SI Units table is used directly as the output unit without conversion.`;
};

const buildSiUnitsAutoText = (unit, config, targetTableIndex) => {
  const axisLabel = config.axis === "X" ? "X values" : "Y values";

  if (config.unitMode === "Base") {
    return `${SI_DESCRIPTION_PREFIX} Output Table #${targetTableIndex} ${axisLabel} are configured from the SI Units table.`;
  }

  return `${SI_DESCRIPTION_PREFIX} Output Table #${targetTableIndex} ${axisLabel} use the found unit "${unit.found}" from the SI Units table.`;
};

const mergeSiUnitsDescription = (currentDescription, nextDescription) => {
  const cleanedDescription = (currentDescription || "")
    .split("\n")
    .filter((line) => line.trim().startsWith(SI_DESCRIPTION_PREFIX) === false)
    .join("\n")
    .trim();

  if (cleanedDescription === "") {
    return nextDescription;
  }

  return cleanedDescription + "\n" + nextDescription;
};

const normalizeStoredUnits = (storedUnits) => {
  if (Array.isArray(storedUnits) === false) {
    return [];
  }

  const counters = {};

  return storedUnits.map((entry) => {
    if (entry.assignmentId) {
      return entry;
    }

    const key = [
      entry.rowIndex,
      entry.found,
      entry.base_unit,
      entry.conversion_factor
    ].join("|");
    const index = counters[key] || 0;
    counters[key] = index + 1;

    return {
      ...entry,
      assignmentId: `legacy-${key}-${index}`
    };
  });
};

const normalizeStoredAssignment = (entry) => ({
  assignmentId: entry.assignmentId,
  outputTableIndex: entry.outputTableIndex === null || entry.outputTableIndex === undefined
    ? ""
    : String(entry.outputTableIndex),
  inputColumn: serializeColumnValue(entry.inputColumn),
  axis: entry.axis === "Y" ? "Y" : "X",
  unitMode: entry.unitMode === "Base" ? "Base" : "Found"
});

const getStoredAssignments = (storedUnits, allUnits, unit, unitIndex) => {
  return storedUnits
    .filter((entry) => isSameUnitEntry(entry, unit, unitIndex, allUnits))
    .map((entry) => normalizeStoredAssignment(entry));
};

const toPersistedAssignment = (unit, unitIndex, assignment) => {
  const parsedOutputTableIndex = Number.parseInt(assignment.outputTableIndex, 10);
  const persistedAssignment = {
    assignmentId: assignment.assignmentId,
    rowIndex: unitIndex,
    found: unit.found,
    base_unit: unit.base_unit,
    conversion_factor: unit.conversion_factor,
    outputTableIndex: Number.isNaN(parsedOutputTableIndex) ? "" : parsedOutputTableIndex,
    inputColumn: deserializeColumnValue(assignment.inputColumn),
    axis: assignment.axis,
    unitMode: assignment.unitMode
  };

  if (hasUuid(unit?.uuid)) {
    persistedAssignment.uuid = unit.uuid;
  }

  return persistedAssignment;
};

const replaceStoredAssignments = (profileValue, allUnits, unit, unitIndex, assignments) => {
  const normalizedUnits = normalizeStoredUnits(profileValue.units);
  const remainingUnits = normalizedUnits.filter((entry) => isSameUnitEntry(entry, unit, unitIndex, allUnits) === false);
  const persistedAssignments = assignments.map((assignment) => toPersistedAssignment(unit, unitIndex, assignment));

  return remainingUnits.concat(persistedAssignments);
};

export default function SIunits({profile, setProfile, defaultAssignmentContext}) {
  const units = profile?.data?.units ?? [];
  const storedUnits = normalizeStoredUnits(profile?.units ?? []);
  const inputColumns = getInputColumns(profile);
  const outputTables = profile?.tables ?? [];
  const [openRows, setOpenRows] = useState({});
  const [rowAssignments, setRowAssignments] = useState({});
  const [feedback, setFeedback] = useState(null);

  const toggleRow = (rowId, isOpen) => {
    setOpenRows((current) => ({
      ...current,
      [rowId]: isOpen ? false : true
    }));
  };

  const getAssignments = (rowId, unit, unitIndex) => {
    if (rowAssignments[rowId]) {
      return rowAssignments[rowId];
    }

    const storedAssignments = getStoredAssignments(storedUnits, units, unit, unitIndex);
    if (storedAssignments.length > 0) {
      return storedAssignments;
    }

    return [createAssignmentConfig(
      `draft-${unitIndex}-0`,
      getAssignmentDefaultsFromContext(defaultAssignmentContext)
    )];
  };

  const setAssignmentsForRow = (rowId, assignments) => {
    setRowAssignments((current) => ({
      ...current,
      [rowId]: assignments
    }));
  };

  const persistAssignmentsForRow = (unit, unitIndex, assignments) => {
    return replaceStoredAssignments(profile, units, unit, unitIndex, assignments);
  };

  const updateAssignmentConfig = (rowId, unit, unitIndex, assignmentId, key, value) => {
    const nextAssignments = getAssignments(rowId, unit, unitIndex).map((assignment) => {
      if (assignment.assignmentId !== assignmentId) {
        return assignment;
      }

      return {
        ...assignment,
        [key]: value
      };
    });

    setAssignmentsForRow(rowId, nextAssignments);
    setProfile({
      ...profile,
      units: persistAssignmentsForRow(unit, unitIndex, nextAssignments)
    });
    setFeedback(null);
  };

  const addAssignment = (rowId, unit, unitIndex) => {
    const nextAssignments = [
      ...getAssignments(rowId, unit, unitIndex),
      createAssignmentConfig(undefined, getAssignmentDefaultsFromContext(defaultAssignmentContext))
    ];

    setAssignmentsForRow(rowId, nextAssignments);
    setOpenRows((current) => ({
      ...current,
      [rowId]: true
    }));
    setProfile({
      ...profile,
      units: persistAssignmentsForRow(unit, unitIndex, nextAssignments)
    });
    setFeedback(null);
  };

  const deleteAssignment = (rowId, unit, unitIndex, assignmentId) => {
    const remainingAssignments = getAssignments(rowId, unit, unitIndex)
      .filter((assignment) => assignment.assignmentId !== assignmentId);

    if (remainingAssignments.length === 0) {
      setRowAssignments((current) => {
        const nextAssignments = {...current};
        delete nextAssignments[rowId];
        return nextAssignments;
      });
      setOpenRows((current) => ({
        ...current,
        [rowId]: false
      }));
    } else {
      setAssignmentsForRow(rowId, remainingAssignments);
    }

    setProfile({
      ...profile,
      units: persistAssignmentsForRow(unit, unitIndex, remainingAssignments)
    });
    setFeedback(null);
  };

  const applyAssignment = (rowId, unit, unitIndex, assignmentId) => {
    const assignments = getAssignments(rowId, unit, unitIndex);
    const assignmentConfig = assignments.find((assignment) => assignment.assignmentId === assignmentId);
    const targetTableIndex = Number.parseInt(assignmentConfig.outputTableIndex, 10);

    if (Number.isNaN(targetTableIndex)) {
      setFeedback({
        rowId,
        assignmentId,
        variant: "danger",
        message: "Please enter an output table index."
      });
      return;
    }

    if (targetTableIndex < 0 || targetTableIndex >= outputTables.length) {
      setFeedback({
        rowId,
        assignmentId,
        variant: "danger",
        message: "Output table #" + targetTableIndex + " does not exist."
      });
      return;
    }

    const selectedColumn = deserializeColumnValue(assignmentConfig.inputColumn);
    if (selectedColumn === null) {
      setFeedback({
        rowId,
        assignmentId,
        variant: "danger",
        message: "Please select an input column."
      });
      return;
    }

    const axisConfig = assignmentConfig.axis === "X"
      ? {columnKey: "xColumn", operationsKey: "xOperations", unitsKey: "XUNITS"}
      : {columnKey: "yColumn", operationsKey: "yOperations", unitsKey: "YUNITS"};

    const nextProfile = {
      ...profile,
      tables: [...outputTables],
      units: persistAssignmentsForRow(unit, unitIndex, assignments)
    };
    const currentTable = outputTables[targetTableIndex] || {};
    const nextTable = {
      ...currentTable,
      header: {...(currentTable.header || {})},
      table: {...(currentTable.table || {})}
    };
    nextProfile.tables[targetTableIndex] = nextTable;

    nextTable.table[axisConfig.columnKey] = selectedColumn;
    nextTable.header[axisConfig.unitsKey] = assignmentConfig.unitMode === "Base" ? unit.base_unit : unit.found;

    const filteredOperations = Array.isArray(nextTable.table[axisConfig.operationsKey])
      ? nextTable.table[axisConfig.operationsKey].filter((operation) => (operation.source === "siUnits" ? false : true))
      : [];

    if (assignmentConfig.unitMode === "Base") {
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

    const descriptionKey = axisConfig.operationsKey + "Description";
    const description = nextTable.table[descriptionKey] || ["", ""];
    description[1] = mergeSiUnitsDescription(
      description[1],
      buildSiUnitsDescription(unit, assignmentConfig, targetTableIndex)
    );
    if (description[0] === "") {
      description[0] = buildSiUnitsAutoText(unit, assignmentConfig, targetTableIndex);
    }
    nextTable.table[descriptionKey] = description;

    setProfile(nextProfile);
    setFeedback({
      rowId,
      assignmentId,
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
              {units.map((unit, unitIndex) => {
                const rowId = (unit.found || "unit") + "-" + unitIndex;
                const assignments = getAssignments(rowId, unit, unitIndex);
                const hasStoredAssignments = getStoredAssignments(storedUnits, units, unit, unitIndex).length > 0;
                const isOpen = openRows[rowId] === undefined ? hasStoredAssignments : Boolean(openRows[rowId]);

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
                    {isOpen && assignments.map((assignment) => (
                      <React.Fragment key={assignment.assignmentId}>
                        <tr>
                          <td className="align-top bg-light">
                            <Form.Group className="mb-0">
                              <Form.Label className="small text-muted mb-1">
                                Assign to Output Table # using Input Column
                              </Form.Label>
                              <div className="d-flex gap-2 align-items-start">
                                <DeleteAssignmentButton onClick={() => deleteAssignment(
                                  rowId,
                                  unit,
                                  unitIndex,
                                  assignment.assignmentId
                                )} />
                                <Form.Control
                                  type="number"
                                  min="0"
                                  size="sm"
                                  placeholder="0"
                                  value={assignment.outputTableIndex}
                                  onChange={(event) => updateAssignmentConfig(
                                    rowId,
                                    unit,
                                    unitIndex,
                                    assignment.assignmentId,
                                    "outputTableIndex",
                                    event.target.value
                                  )}
                                />
                                <Form.Select
                                  size="sm"
                                  value={assignment.inputColumn}
                                  onChange={(event) => updateAssignmentConfig(
                                    rowId,
                                    unit,
                                    unitIndex,
                                    assignment.assignmentId,
                                    "inputColumn",
                                    event.target.value
                                  )}
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
                                value={assignment.axis}
                                onChange={(event) => updateAssignmentConfig(
                                  rowId,
                                  unit,
                                  unitIndex,
                                  assignment.assignmentId,
                                  "axis",
                                  event.target.value
                                )}
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
                                value={assignment.unitMode}
                                onChange={(event) => updateAssignmentConfig(
                                  rowId,
                                  unit,
                                  unitIndex,
                                  assignment.assignmentId,
                                  "unitMode",
                                  event.target.value
                                )}
                              >
                                <option value="Found">Found</option>
                                <option value="Base">Base</option>
                              </Form.Select>
                            </Form.Group>
                          </td>
                          <td className="align-top bg-light text-center">
                            <div className="d-flex flex-column align-items-center gap-2">
                              <AddAssignmentButton onClick={() => addAssignment(rowId, unit, unitIndex)} />
                              <Button
                                variant="secondary"
                                size="sm"
                                type="button"
                                onClick={() => applyAssignment(
                                  rowId,
                                  unit,
                                  unitIndex,
                                  assignment.assignmentId
                                )}
                              >
                                Do
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {feedback?.rowId === rowId && feedback?.assignmentId === assignment.assignmentId && (
                          <tr>
                            <td colSpan={4} className="bg-light border-top-0">
                              <Alert variant={feedback.variant} className="mb-0 py-2">
                                {feedback.message}
                              </Alert>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
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
  setProfile: PropTypes.func.isRequired,
  defaultAssignmentContext: defaultAssignmentContextShape
};

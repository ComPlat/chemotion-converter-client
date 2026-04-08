import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Alert, Button, Card, Form, Modal, OverlayTrigger, Table, Tooltip} from "react-bootstrap";
import {additionalInfo} from "../../../../utils/identifierUtils";
import {getInputColumns} from "../../../../utils/profileUtils";
import OperatorSelect from "../common/OperatorSelect";

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
    unitMode: PropTypes.string,
    customOperations: PropTypes.arrayOf(PropTypes.shape({
      operator: PropTypes.string,
      type: PropTypes.string,
      value: PropTypes.string
    }))
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

function UnitAssignmentToggle({displayState, onToggle}) {
  const isOpen = displayState === "open";
  const hasHiddenAssignments = displayState === "hidden";
  const variant = isOpen
    ? "outline-info"
    : (hasHiddenAssignments ? "warning" : "outline-success");
  const label = isOpen
    ? "Hide SI unit assignments"
    : (hasHiddenAssignments ? "Show hidden SI unit assignments" : "Create SI unit assignment");

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={label}
      title={label}
    >
      <b>{isOpen ? "-" : (hasHiddenAssignments ? "\u{1F441}" : "+")}</b>
    </Button>
  );
}

UnitAssignmentToggle.propTypes = {
  displayState: PropTypes.oneOf(["empty", "hidden", "open"]).isRequired,
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

function CustomConversionButton({onClick, hasCustomRules}) {
  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="custom-conversion-tooltip">Custom Conversion</Tooltip>}
    >
      <Button
        variant={hasCustomRules ? "success" : "outline-secondary"}
        size="sm"
        type="button"
        onClick={onClick}
        aria-label="Custom Conversion"
      >
        &#9881;
      </Button>
    </OverlayTrigger>
  );
}

CustomConversionButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  hasCustomRules: PropTypes.bool
};

const defaultAssignmentConfig = {
  assignmentId: "",
  outputTableIndex: "",
  inputColumn: "",
  axis: "X",
  unitMode: "Found",
  customOperations: []
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

const normalizeCustomOperation = (operation) => ({
  operator: operation?.operator || "*",
  type: "value",
  value: operation?.value === null || operation?.value === undefined ? "" : String(operation.value)
});

const normalizeCustomOperations = (operations) => (
  Array.isArray(operations)
    ? operations
      .filter((operation) => operation?.type === undefined || operation.type === "value")
      .map((operation) => normalizeCustomOperation(operation))
    : []
);

const getAppliedSiUnitsOperations = (unit, assignmentConfig) => {
  if (assignmentConfig.unitMode !== "Base") {
    return [];
  }

  const customOperations = normalizeCustomOperations(assignmentConfig.customOperations);
  if (customOperations.length > 0) {
    return customOperations.map((operation) => ({
      ...operation,
      source: "siUnits"
    }));
  }

  return [{
    type: "value",
    operator: "*",
    value: unit.conversion_factor,
    source: "siUnits"
  }];
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
    if (normalizeCustomOperations(config.customOperations).length > 0) {
      return `${SI_DESCRIPTION_PREFIX} For Output Table #${targetTableIndex} ${axisLabel}, the found unit "${unit.found}" from the SI Units table is converted to the base unit "${unit.base_unit}" using custom scalar conversion operations defined in the SI Units table.`;
    }

    return `${SI_DESCRIPTION_PREFIX} For Output Table #${targetTableIndex} ${axisLabel}, the found unit "${unit.found}" from the SI Units table is converted to the base unit "${unit.base_unit}" using conversion factor ${unit.conversion_factor}.`;
  }

  return `${SI_DESCRIPTION_PREFIX} For Output Table #${targetTableIndex} ${axisLabel}, the found unit "${unit.found}" from the SI Units table is used directly as the output unit without conversion.`;
};

const buildSiUnitsAutoText = (unit, config, targetTableIndex) => {
  const axisLabel = config.axis === "X" ? "X values" : "Y values";

  if (config.unitMode === "Base") {
    if (normalizeCustomOperations(config.customOperations).length > 0) {
      return `${SI_DESCRIPTION_PREFIX} Output Table #${targetTableIndex} ${axisLabel} are configured with custom scalar conversion operations from the SI Units table.`;
    }

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
  unitMode: entry.unitMode === "Base" ? "Base" : "Found",
  customOperations: normalizeCustomOperations(entry.customOperations)
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
    unitMode: assignment.unitMode,
    customOperations: normalizeCustomOperations(assignment.customOperations)
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

const getRowId = (unit, unitIndex) => ((unit?.found || "unit") + "-" + unitIndex);

const matchesAssignmentTarget = (entry, targetTableIndex, axis) => {
  const entryOutputTableIndex = Number.parseInt(entry.outputTableIndex, 10);

  return Number.isNaN(entryOutputTableIndex) === false
    && entryOutputTableIndex === targetTableIndex
    && entry.axis === axis;
};

export default function SIunits({profile, setProfile, defaultAssignmentContext}) {
  const units = profile?.data?.units ?? [];
  const storedUnits = normalizeStoredUnits(profile?.units ?? []);
  const inputColumns = getInputColumns(profile);
  const outputTables = profile?.tables ?? [];
  const [openRows, setOpenRows] = useState({});
  const [rowAssignments, setRowAssignments] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [overwriteConfirmation, setOverwriteConfirmation] = useState(null);
  const [customConversionEditor, setCustomConversionEditor] = useState(null);
  const [customConversionModalOffset, setCustomConversionModalOffset] = useState({x: 0, y: 0});
  const [customConversionModalDrag, setCustomConversionModalDrag] = useState(null);

  useEffect(() => {
    const dialog = document.querySelector(".siunits-custom-conversion-dialog");

    if (dialog) {
      dialog.style.transform = `translate(${customConversionModalOffset.x}px, ${customConversionModalOffset.y}px)`;
    }
  }, [customConversionEditor, customConversionModalOffset]);

  useEffect(() => {
    if (customConversionModalDrag === null) {
      return undefined;
    }

    const handleMouseMove = (event) => {
      setCustomConversionModalOffset({
        x: customConversionModalDrag.originX + event.clientX - customConversionModalDrag.startX,
        y: customConversionModalDrag.originY + event.clientY - customConversionModalDrag.startY
      });
    };

    const handleMouseUp = () => {
      setCustomConversionModalDrag(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [customConversionModalDrag]);

  const toggleRow = (rowId, isOpen) => {
    setOpenRows((current) => ({
      ...current,
      [rowId]: isOpen ? false : true
    }));
  };

  const clearOverwriteConfirmation = () => {
    setOverwriteConfirmation(null);
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
    clearOverwriteConfirmation();
    if (key === "unitMode" && value !== "Base" && customConversionEditor?.assignmentId === assignmentId) {
      setCustomConversionEditor(null);
    }
    setFeedback(null);
  };

  const updateAssignment = (rowId, unit, unitIndex, assignmentId, updater) => {
    const nextAssignments = getAssignments(rowId, unit, unitIndex).map((assignment) => {
      if (assignment.assignmentId !== assignmentId) {
        return assignment;
      }

      return updater(assignment);
    });

    setAssignmentsForRow(rowId, nextAssignments);
    setProfile({
      ...profile,
      units: persistAssignmentsForRow(unit, unitIndex, nextAssignments)
    });
    clearOverwriteConfirmation();
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
    clearOverwriteConfirmation();
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
    clearOverwriteConfirmation();
    if (customConversionEditor?.rowId === rowId && customConversionEditor?.assignmentId === assignmentId) {
      setCustomConversionEditor(null);
    }
    setFeedback(null);
  };

  const openCustomConversion = (rowId, unit, unitIndex, assignmentId) => {
    setCustomConversionModalOffset({x: 0, y: 0});
    setCustomConversionModalDrag(null);
    setCustomConversionEditor({
      rowId,
      unit,
      unitIndex,
      assignmentId
    });
  };

  const getCurrentEditorAssignment = () => {
    if (customConversionEditor === null) {
      return null;
    }

    const assignments = getAssignments(
      customConversionEditor.rowId,
      customConversionEditor.unit,
      customConversionEditor.unitIndex
    );

    return assignments.find((assignment) => assignment.assignmentId === customConversionEditor.assignmentId) || null;
  };

  const addCustomScalarOperation = (rowId, unit, unitIndex, assignmentId) => {
    updateAssignment(rowId, unit, unitIndex, assignmentId, (assignment) => ({
      ...assignment,
      customOperations: [
        ...normalizeCustomOperations(assignment.customOperations),
        normalizeCustomOperation({
          operator: "*",
          value: unit.conversion_factor
        })
      ]
    }));
  };

  const updateCustomScalarOperation = (rowId, unit, unitIndex, assignmentId, operationIndex, key, value) => {
    updateAssignment(rowId, unit, unitIndex, assignmentId, (assignment) => ({
      ...assignment,
      customOperations: normalizeCustomOperations(assignment.customOperations).map((operation, index) => {
        if (index !== operationIndex) {
          return operation;
        }

        return normalizeCustomOperation({
          ...operation,
          [key]: value
        });
      })
    }));
  };

  const removeCustomScalarOperation = (rowId, unit, unitIndex, assignmentId, operationIndex) => {
    updateAssignment(rowId, unit, unitIndex, assignmentId, (assignment) => ({
      ...assignment,
      customOperations: normalizeCustomOperations(assignment.customOperations)
        .filter((operation, index) => index !== operationIndex)
    }));
  };

  const closeCustomConversion = () => {
    setCustomConversionModalDrag(null);
    setCustomConversionEditor(null);
  };

  const startCustomConversionDrag = (event) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    setCustomConversionModalDrag({
      startX: event.clientX,
      startY: event.clientY,
      originX: customConversionModalOffset.x,
      originY: customConversionModalOffset.y
    });
  };

  const applyAssignment = (rowId, unit, unitIndex, assignmentId, closeCustomEditor = false) => {
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
    const nextUnits = persistAssignmentsForRow(unit, unitIndex, assignments);
    const conflictingAssignments = nextUnits.filter((entry) => (
      entry.assignmentId !== assignmentId
      && matchesAssignmentTarget(entry, targetTableIndex, assignmentConfig.axis)
    ));

    if (conflictingAssignments.length > 0) {
      const isConfirmedOverwrite = overwriteConfirmation
        && overwriteConfirmation.rowId === rowId
        && overwriteConfirmation.assignmentId === assignmentId
        && overwriteConfirmation.outputTableIndex === targetTableIndex
        && overwriteConfirmation.axis === assignmentConfig.axis;

      if (isConfirmedOverwrite !== true) {
        setOverwriteConfirmation({
          rowId,
          assignmentId,
          outputTableIndex: targetTableIndex,
          axis: assignmentConfig.axis
        });
        setFeedback({
          rowId,
          assignmentId,
          variant: "warning",
          message: `Output table #${targetTableIndex} ${assignmentConfig.axis} is already assigned in another SI unit row. Click Do again to overwrite it and remove the previous assignment.`
        });
        return;
      }
    }

    const nextProfile = {
      ...profile,
      tables: [...outputTables],
      units: nextUnits
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
    filteredOperations.push(...getAppliedSiUnitsOperations(unit, assignmentConfig));

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

    if (conflictingAssignments.length > 0) {
      const conflictingAssignmentIds = new Set(conflictingAssignments.map((entry) => entry.assignmentId));
      nextProfile.units = nextProfile.units.filter((entry) => conflictingAssignmentIds.has(entry.assignmentId) === false);

      setRowAssignments((current) => {
        const next = {...current};

        conflictingAssignments.forEach((entry) => {
          const conflictUnit = units[entry.rowIndex];
          const conflictRowId = getRowId(conflictUnit, entry.rowIndex);

          if (Array.isArray(next[conflictRowId])) {
            const filteredAssignments = next[conflictRowId]
              .filter((currentAssignment) => conflictingAssignmentIds.has(currentAssignment.assignmentId) === false);

            if (filteredAssignments.length > 0) {
              next[conflictRowId] = filteredAssignments;
            } else {
              delete next[conflictRowId];
            }
          }
        });

        return next;
      });

      setOpenRows((current) => {
        const next = {...current};

        conflictingAssignments.forEach((entry) => {
          const conflictUnit = units[entry.rowIndex];
          const conflictRowId = getRowId(conflictUnit, entry.rowIndex);
          const hasRemainingStoredAssignments = nextProfile.units.some((storedEntry) => (
            conflictUnit ? isSameUnitEntry(storedEntry, conflictUnit, entry.rowIndex, units) : false
          ));

          if (hasRemainingStoredAssignments === false) {
            next[conflictRowId] = false;
          }
        });

        return next;
      });
    }

    setProfile(nextProfile);
    clearOverwriteConfirmation();
    if (closeCustomEditor) {
      closeCustomConversion();
    }
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
                const rowId = getRowId(unit, unitIndex);
                const assignments = getAssignments(rowId, unit, unitIndex);
                const hasStoredAssignments = getStoredAssignments(storedUnits, units, unit, unitIndex).length > 0;
                const hasLocalAssignments = Array.isArray(rowAssignments[rowId]) && rowAssignments[rowId].length > 0;
                const hasAssignments = hasStoredAssignments || hasLocalAssignments;
                const isOpen = openRows[rowId] === undefined ? hasStoredAssignments : Boolean(openRows[rowId]);
                const toggleState = isOpen ? "open" : (hasAssignments ? "hidden" : "empty");

                return (
                  <React.Fragment key={rowId}>
                    <tr>
                      <td>{unit.found}</td>
                      <td>{unit.conversion_factor}</td>
                      <td>{unit.base_unit}</td>
                      <td className="text-center align-middle">
                        <UnitAssignmentToggle
                          displayState={toggleState}
                          onToggle={() => toggleRow(rowId, isOpen)}
                        />
                      </td>
                    </tr>
                    {isOpen && assignments.map((assignment) => (
                      <React.Fragment key={assignment.assignmentId}>
                        <tr>
                          <td className="align-top bg-light">
                            <Form.Group className="mb-0">
                              <div
                                className="d-flex align-items-center justify-content-between mb-1"
                                style={{minHeight: "31px"}}
                              >
                                <Form.Label className="small text-muted mb-0">
                                  Assign to Output Table # using Input Column
                                </Form.Label>
                                <span style={{width: "31px"}}></span>
                              </div>
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
                              <div
                                className="d-flex align-items-center justify-content-between mb-1"
                                style={{minHeight: "31px"}}
                              >
                                <Form.Label className="small text-muted mb-0">For</Form.Label>
                                <span style={{width: "31px"}}></span>
                              </div>
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
                              <div
                                className="d-flex align-items-center justify-content-between mb-1"
                                style={{minHeight: "31px"}}
                              >
                                <Form.Label className="small text-muted mb-0">As</Form.Label>
                                {assignment.unitMode === "Base" ? (
                                  <CustomConversionButton
                                    hasCustomRules={normalizeCustomOperations(assignment.customOperations).length > 0}
                                    onClick={() => openCustomConversion(
                                      rowId,
                                      unit,
                                      unitIndex,
                                      assignment.assignmentId
                                    )}
                                  />
                                ) : (
                                  <span style={{width: "31px"}}></span>
                                )}
                              </div>
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
                            <div className="d-flex flex-column">
                              <div
                                className="d-flex align-items-center justify-content-center mb-1"
                                style={{minHeight: "31px"}}
                              >
                                <AddAssignmentButton onClick={() => addAssignment(rowId, unit, unitIndex)} />
                              </div>
                              <div className="d-flex align-items-center justify-content-center">
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
      <Modal
        show={customConversionEditor !== null}
        onHide={closeCustomConversion}
        centered
        scrollable
        size="lg"
        dialogClassName="siunits-custom-conversion-dialog"
      >
        <Modal.Header closeButton>
          <div
            role="presentation"
            onMouseDown={startCustomConversionDrag}
            style={{cursor: customConversionModalDrag === null ? "grab" : "grabbing"}}
          >
            <Modal.Title>Custom Conversion</Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          {(() => {
            const editorAssignment = getCurrentEditorAssignment();

            if (customConversionEditor === null || editorAssignment === null) {
              return null;
            }

            const customOperations = normalizeCustomOperations(editorAssignment.customOperations);

            return (
              <>
                <div className="mb-3">
                  <strong>{customConversionEditor.unit.found}</strong> to <strong>{customConversionEditor.unit.base_unit}</strong>
                  <div className="text-muted small">
                    Define scalar operations that replace the default <code>* {customConversionEditor.unit.conversion_factor}</code> conversion when you click <code>Do</code>.
                  </div>
                </div>

                {feedback?.rowId === customConversionEditor.rowId && feedback?.assignmentId === customConversionEditor.assignmentId && (
                  <Alert variant={feedback.variant} className="py-2">
                    {feedback.message}
                  </Alert>
                )}

                {customOperations.length === 0 ? (
                  <div className="text-muted mb-3">
                    No custom scalar operations defined. The default conversion factor will be used.
                  </div>
                ) : (
                  <>
                    {customOperations.map((operation, index) => (
                      <div key={`custom-scalar-operation-${editorAssignment.assignmentId}-${index}`} className="d-flex gap-2 align-items-end mb-2">
                        <div style={{minWidth: "110px"}}>
                          <Form.Label className="small text-muted mb-1">Operator</Form.Label>
                          <OperatorSelect
                            value={operation.operator}
                            onChange={(value) => updateCustomScalarOperation(
                              customConversionEditor.rowId,
                              customConversionEditor.unit,
                              customConversionEditor.unitIndex,
                              customConversionEditor.assignmentId,
                              index,
                              "operator",
                              value
                            )}
                          />
                        </div>
                        <div className="flex-grow-1">
                          <Form.Label className="small text-muted mb-1">Scalar value</Form.Label>
                          <Form.Control
                            size="sm"
                            value={operation.value}
                            onChange={(event) => updateCustomScalarOperation(
                              customConversionEditor.rowId,
                              customConversionEditor.unit,
                              customConversionEditor.unitIndex,
                              customConversionEditor.assignmentId,
                              index,
                              "value",
                              event.target.value
                            )}
                          />
                        </div>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          type="button"
                          onClick={() => removeCustomScalarOperation(
                            customConversionEditor.rowId,
                            customConversionEditor.unit,
                            customConversionEditor.unitIndex,
                            customConversionEditor.assignmentId,
                            index
                          )}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}

                    <Form.Group controlId="si-custom-operation-preview" className="mt-3">
                      <Form.Label column="lg">Operations description</Form.Label>
                      <pre className="text-muted">
                        {customOperations.map((operation) => (
                          operation.operator + " [" + (TYPE_MAPPING[operation.type] || "??") + additionalInfo(operation) + "]"
                        )).join(" ")}
                      </pre>
                    </Form.Group>
                  </>
                )}

                <div className="d-flex gap-2 mt-3">
                  <Button
                    variant="success"
                    size="sm"
                    type="button"
                    onClick={() => addCustomScalarOperation(
                      customConversionEditor.rowId,
                      customConversionEditor.unit,
                      customConversionEditor.unitIndex,
                      customConversionEditor.assignmentId
                    )}
                  >
                    Add scalar operation
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => applyAssignment(
                      customConversionEditor.rowId,
                      customConversionEditor.unit,
                      customConversionEditor.unitIndex,
                      customConversionEditor.assignmentId,
                      true
                    )}
                  >
                    Do
                  </Button>
                </div>
              </>
            );
          })()}
        </Modal.Body>
      </Modal>
    </Card>
  );
}

SIunits.propTypes = {
  profile: profileShape.isRequired,
  setProfile: PropTypes.func.isRequired,
  defaultAssignmentContext: defaultAssignmentContextShape
};

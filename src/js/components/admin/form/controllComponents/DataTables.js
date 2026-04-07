import React from "react";
import PropTypes from "prop-types";
import Select from 'react-select';
import {Card, Form, InputGroup, Button, OverlayTrigger, Tooltip} from "react-bootstrap";
import isEqual from "lodash/isEqual";
import {v4 as uuidv4} from "uuid";
import {
  getDistInputColumns,
  getFileMetadataOptions,
  getInputColumns, getInputTables,
  getTableMetadataOptions
} from "../../../../utils/profileUtils";
import {initIdentifier, additionalInfo} from "../../../../utils/identifierUtils";
import TableForm from "../TableForm";

const profileShape = PropTypes.shape({
  data: PropTypes.object,
  tables: PropTypes.arrayOf(PropTypes.shape({
    header: PropTypes.object,
    table: PropTypes.object,
    loopType: PropTypes.string,
    matchTables: PropTypes.bool
  })),
  matchTables: PropTypes.bool
});

export default function OutputTables({profile, setProfile, options}) {

  const addTable = () => {
    const header = {}
    if (options) {
      for (let key of ["DATA CLASS", "DATA TYPE", "XUNITS", "YUNITS"]) {
        header[key] = options[key][0];
      }
    }

    const inputColumns = getInputColumns(profile)
    const table = {}
    if (inputColumns.length > 2) {
      table.xColumn = inputColumns[0].value
      table.yColumn = inputColumns[1].value
    }

    profile.tables.push({
      header: header,
      table: table
    })

    setProfile(profile)
  }

  const updateAutomatedOperationDescription = (profile, index, key) => {
    const keyDescription = `${key}Description`;

    let value = profile.tables[index].table[keyDescription] ?? ["", ""];
    const type_mapping = {
      "header_value": "File regexp value",
      "metadata_value": "Metadata value",
      "column": "Table column",
      "value": "Scalar value"
    };
    if (profile.tables[index].table[key]) {
      const tmp_value = []
      for (const op of profile.tables[index].table[key]) {
        tmp_value.push(`${op.operator} [${type_mapping[op.type] ?? "??"}${additionalInfo(op)}]`);
      }

      value[0] = tmp_value.join(' ');
    } else {
      value[0] = ''
    }
    profile.tables[index].table[keyDescription] = value;
  }

  const updateOperationDescription = (index, key, value) => {
    const keyDescription = `${key}Description`;
    const prof_value = profile.tables[index].table[keyDescription] ?? ["", ""];
    prof_value[1] = value;
    profile.tables[index].table[keyDescription] = prof_value;
    setProfile(profile);
  }

  const addOperation = (index, key, type) => {
    if (index !== -1) {
      const operation = {
        type: type,
        operator: (key.includes('loop') ? '&' : '+')
      }

      if (type === 'header_value') {
        operation.table = '0';
        operation.regex = '';
        operation.line = '';
        operation.ignore_missing_values = false;
      } else if (type === 'metadata_value') {
        const mdZero = getTableMetadataOptions(profile)[0];
        operation.value = mdZero.key;
        operation.table = `${mdZero.tableIndex}`;
        operation.metadata = '0';
        operation.ignore_missing_values = false;
      } else if (type === 'column') {
        operation['column'] = {
          tableIndex: null,
          columnIndex: null
        };
      }

      if (profile.tables[index].table[key] === undefined) {
        profile.tables[index].table[key] = [];
      }
      profile.tables[index].table[key].push(operation);
      updateAutomatedOperationDescription(profile, index, key);
      setProfile(profile)
    }
  }

  const updateOperation = (index, key, opIndex, opKey, value) => {

    if (opKey === 'metadata') {
      const data = value.split(':');
      updateOperation(index, key, opIndex, 'value', data[1].trim());
      updateOperation(index, key, opIndex, 'table', data[2]);
      value = data[0];
    }
    if (index !== -1) {
      profile.tables[index].table[key][opIndex][opKey] = value;
      updateAutomatedOperationDescription(profile, index, key);
      setProfile(profile);
    }
  }

  const removeOperation = (index, key, opIndex) => {
    if (index !== -1) {
      profile.tables[index].table[key].splice(opIndex, 1)

      // remove operations if it is empty
      if (profile.tables[index].table[key].length === 0) {
        delete profile.tables[index].table[key];
      }

      updateAutomatedOperationDescription(profile, index, key);
      setProfile(profile)
    }
  }

  const toggleMatchTables = (index, op_index = -1) => {
    const profile_table = profile.tables[index]
    if (op_index === -1) {
      if (profile.matchTables) { // handling for old profiles
        profile.matchTables = false
      } else {
        profile_table.matchTables = !profile_table.matchTables
      }
    } else {
      profile_table.table.loop_metadata[op_index].ignoreValue = !profile_table.table.loop_metadata[op_index].ignoreValue
    }
    setProfile(profile)
  }

  const handleChangeLoop = (value, index) => {
    profile.tables[index].loopType = value;
    setProfile(profile);
  }

  const updateTable = (index, key, value) => {
    if (index !== -1) {
      profile.tables[index].table[key] = value

      // remove the column if it set to null
      if (profile.tables[index].table[key] === null) {
        delete profile.tables[index].table[key]
        // remove the column if tableIndex and columnIndex is null
      } else if (Object.values(profile.tables[index].table[key]).every(value => (value === null || isNaN(value)))) {
        delete profile.tables[index].table[key]
      }

      setProfile(profile)
    }
  }

  const removeTable = (index) => {
    profile.tables.splice(index, 1)
    setProfile(profile)
  }

  const updateHeader = (index, key, value, oldKey) => {
    let header = Object.assign({}, profile.tables[index].header)

    if (index !== -1) {
      if (oldKey === undefined) {
        header[key] = value
      } else {
        // create a new header to preserve the order
        header = Object.keys(header).reduce((agg, cur) => {
          if (cur === oldKey) {
            agg[key] = value
          } else {
            agg[cur] = header[cur]
          }
          return agg
        }, {})
      }

      if (key === 'DATA CLASS') {
        if (value === 'NTUPLES') {
          header.NTUPLES_PAGE_HEADER = header.NTUPLES_PAGE_HEADER || '___+';
          header.NTUPLES_ID = header.NTUPLES_ID || uuidv4();
        } else if (header['NTUPLES_PAGE_HEADER']) {
          delete header.NTUPLES_PAGE_HEADER;
          delete header.NTUPLES_ID;
        }

        if (value === 'XYDATA') {
          ['FIRSTX', 'LASTX', 'DELTAX'].forEach(headerKey => {
            // ensure headerKeys are there if XYDATA is selected
            if (header[headerKey] === undefined) {
              header[headerKey] = initIdentifier(profile, 'fileMetadata')
            }

            // update header identifiers if the type changed
            if (headerKey === key &&
              profile.tables[index].header[headerKey].type !== header[headerKey].type) {
              header[headerKey] = initIdentifier(profile, header[headerKey].type)
            }
          })
        } else {
          ['FIRSTX', 'LASTX', 'DELTAX'].forEach(headerKey => {
            if (header[headerKey]) {
              delete header[headerKey];
            }
          });
        }
      }

      profile.tables[index].header = header
      setProfile(profile)
    }
  }

  const inputTables = getInputTables(profile);
  const inputColumns = getInputColumns(profile);
  const distInputColumns = getDistInputColumns(profile);
  const fileMetadataOptions = getFileMetadataOptions(profile);
  const tableMetadataOptions = getTableMetadataOptions(profile);

  const loopMetadataOptions = (outputTable, op_index) => {
    const seenLabels = new Set();
    const groups = tableMetadataOptions.reduce((acc, item, index) => {
      const groupIndex = item.tableIndex;

      if (!acc[groupIndex]) {
        acc[groupIndex] = {
          label: `Input table #${groupIndex}`,
          options: []
        };
      }

      const cleanLabel = item.label.replace(/^Input table #\d+ /, "");
      const showValue = !profile.tables[outputTable].table.loop_metadata[op_index].ignoreValue && true

      if (!showValue && seenLabels.has(cleanLabel)) {
        return acc;
      }

      acc[groupIndex].options.push({
        value: index,
        label: showValue ? `${cleanLabel} (${item.value})` : cleanLabel
      });

      seenLabels.add(cleanLabel);
      return acc;
    }, {});

    return Object.values(groups);
  };

  const getSelectedMetadataOption = (metadata, outputTable, op_index) => {
    if (!metadata) return null;

    const [indexString] = metadata.split(":");
    const optionIndex = Number(indexString);

    for (const group of loopMetadataOptions(outputTable, op_index)) {
      const found = group.options.find(opt => opt.value === optionIndex);
      if (found) return found;
    }

    return null;
  };

  return (<>
    {profile.tables.map((table, index) => (
      <Card key={index} className="mt-3">
        <Card.Header className="d-flex align-items-baseline justify-content-between">
          Output table #{index}
          <Button
            variant="danger"
            size="sm"
            onClick={() => removeTable(index)}
          >
            Remove
          </Button>
        </Card.Header>
        <Card.Body>
          Use this output table configuration for:
          <InputGroup>
            {profile.tables[index].loopType === "all" && (
              <InputGroup.Checkbox
                id="match-tables-checkbox"
                checked={profile.matchTables || profile.tables[index].matchTables || false}
                onChange={() => toggleMatchTables(index)}
              />
            )}
            {profile.tables[index].loopType === "header" ? (
              <Button
                variant="outline-success"
                onClick={() => addOperation(
                  index, 'loop_header',
                  'column'
                )}>
                +
              </Button>
            ) : (profile.tables[index].loopType !== "all" && (
              <Button
                variant="outline-success"
                onClick={() => addOperation(
                  index, `loop_${profile.tables[index].loopType}`,
                  profile.tables[index].loopType === 'metadata' ? 'metadata' : 'header_value'
                )}>
                +
              </Button>))}
            <Form.Select
              id="loop_select"
              aria-label="Select looping"
              value={profile.tables[index].loopType}
              onChange={(e) => handleChangeLoop(e.target.value, index)}
            >
              <option value="all">all input tables.</option>
              <option value="header">all input tables that have the same column header.</option>
              <option value="theader">all input tables that have the same table header.</option>
              <option value="metadata">all input tables that have the same metadata.</option>
            </Form.Select>
          </InputGroup>
          {profile.tables[index].loopType !== "all" && profile.tables[index].table['loop_header']
            && profile.tables[index].table['loop_header'].map((operation, op_index) => (
              <InputGroup key={op_index}>
                <InputGroup.Text>&#8627;</InputGroup.Text>
                <Button
                  variant="outline-danger"
                  onClick={() => removeOperation(index, 'loop_header', op_index)}
                >
                  &times;
                </Button>
                <Select
                  className="loop-select-container"
                  classNamePrefix="loop-select"
                  menuPortalTarget={document.body}
                  menuShouldBlockScroll={false}
                  menuShouldScrollIntoView={false}
                  openMenuOnScroll={false}
                  closeMenuOnScroll={false}
                  value={distInputColumns.flatMap(group => group.options)
                    .find(col => isEqual(col.value, operation.column))}
                  options={distInputColumns}
                  onChange={selectedOption =>
                    updateOperation(index, 'loop_header', op_index, 'column', selectedOption.value)
                  }
                />
              </InputGroup>
            ))}
          {profile.tables[index].loopType !== "all" && profile.tables[index].table['loop_metadata']
            && profile.tables[index].table['loop_metadata'].map((operation, op_index) => (
              <InputGroup key={op_index}>
                <InputGroup.Text>&#8627;</InputGroup.Text>
                <Button
                  variant="outline-danger"
                  onClick={() => removeOperation(index, 'loop_metadata', op_index)}
                >
                  &times;
                </Button>
                <Select
                  className="loop-select-container"
                  classNamePrefix="loop-select"
                  menuPortalTarget={document.body}
                  menuShouldBlockScroll={false}
                  menuShouldScrollIntoView={false}
                  openMenuOnScroll={false}
                  closeMenuOnScroll={false}
                  value={getSelectedMetadataOption(operation.metadata, index, op_index)}
                  onChange={(selected) => {
                    if (!selected) {
                      updateOperation(index, 'loop_metadata', op_index, 'metadata', '');
                      return;
                    }

                    const selectedOption = tableMetadataOptions[selected.value];
                    const metadataString = `${selected.value}:${selectedOption.key}:${selectedOption.tableIndex}`;

                    updateOperation(index, 'loop_metadata', op_index, 'metadata', metadataString);
                  }}
                  options={loopMetadataOptions(index, op_index)}
                />
                <OverlayTrigger
                  placement="bottom-end"
                  overlay={<Tooltip>Ignore Value</Tooltip>}
                >
                  <div className="input-group-text" style={{cursor: 'pointer'}}>
                    <input type="checkbox"
                           checked={profile.tables[index].table.loop_metadata[op_index].ignoreValue || false}
                           onChange={() => toggleMatchTables(index, op_index)}
                    />
                  </div>
                </OverlayTrigger>
              </InputGroup>
            ))}
          {profile.tables[index].loopType !== "all" && profile.tables[index].table['loop_theader']
            && profile.tables[index].table['loop_theader'].map((operation, op_index) => (
              <InputGroup>
                <InputGroup.Text>&#8627;</InputGroup.Text>
                <Button
                  variant="outline-danger"
                  onClick={() => removeOperation(index, 'loop_theader', op_index)}
                >
                  &times;
                </Button>
                <Form.Control
                  value={operation.line || ''}
                  placeholder='Line'
                  onChange={(event) => {
                    updateOperation(index, 'loop_theader', op_index, 'line', event.target.value)
                  }}
                />
                <Form.Control
                  value={operation.regex || ''}
                  placeholder='Regex'
                  onChange={(event) => {
                    updateOperation(index, 'loop_theader', op_index, 'regex', event.target.value)
                  }}
                />
              </InputGroup>
            ))}
          <TableForm
            table={table}
            inputTables={inputTables}
            inputColumns={inputColumns}
            options={options}
            profile={profile}
            setProfile={setProfile}
            updateHeader={(key, value) => updateHeader(index, key, value)}
            updateTable={(key, value) => updateTable(index, key, value)}
            addOperation={(key, type) => addOperation(index, key, type)}
            updateOperation={(key, opIndex, opKey, value) => updateOperation(index, key, opIndex, opKey, value)}
            updateOperationDescription={(key, value) => updateOperationDescription(index, key, value)}
            removeOperation={(key, opIndex) => removeOperation(index, key, opIndex)}
            fileMetadataOptions={fileMetadataOptions}
            tableMetadataOptions={tableMetadataOptions}
          />
        </Card.Body>
      </Card>
    ))}

    <div className="mt-2">
      <Button
        variant="success"
        size="sm"
        onClick={() => addTable()}
      >
        Add table
      </Button>
    </div>
  </>);
}

OutputTables.propTypes = {
  profile: profileShape.isRequired,
  setProfile: PropTypes.func.isRequired,
  options: PropTypes.object
};

import TableForm from "./TableForm";
import {Card, Form, InputGroup} from 'react-bootstrap'
import React, {useCallback, useMemo} from "react";
import PropTypes from 'prop-types';
import {
  getInputColumns
} from "../../../../../utils/profileUtils";
import {additionalInfo, initIdentifier} from "../../../../../utils/identifierUtils";
import LoopForm from "./LoopForm";
import {useAdminApp} from "../../../AppContext";
import {DelayedActiveInputTableInput} from "../../common/InputTables";


export default function DataTableCardContent({
                                               table,
                                               index,
                                               inputTables,
                                               tableIdx
                                             }) {

  const {profile, updateProfile: setProfile, inData: {getTableMetadataOptions}} = useAdminApp();

  const inputTable = table.inputTableIndex ?? 0;
  const setInputTable = useCallback((value) => {
    profile.tables[index].inputTableIndex = value;
    setProfile(profile);
  }, [table, index]);

  const setInputTableName = useCallback((value) => {
    profile.tables[index].tableName = value;
    setProfile(profile);
  }, [table, index]);

  const inputColumns = useMemo(() => getInputColumns(inputTables, inputTable), [inputTable]);


  const updateTable = (index, key, value, rootObj = false) => {
    if (index !== -1) {
      if (rootObj) {
        profile.tables[index][key] = value;
      } else {
        profile.tables[index].table[key] = value;

        // remove the column if it set to null
        if (profile.tables[index].table[key] === null) {
          delete profile.tables[index].table[key]
          // remove the column if tableIndex and columnIndex is null
        } else if (Object.values(profile.tables[index].table[key]).every(value => (value === null || isNaN(value)))) {
          delete profile.tables[index].table[key]
        }
      }

      setProfile(profile)
    }
  }


  const updateOperationDescription = (index, key, value) => {
    const keyDescription = `${key}Description`;
    const prof_value = profile.tables[index].table[keyDescription] ?? ["", ""];
    prof_value[1] = value;
    profile.tables[index].table[keyDescription] = prof_value;
    setProfile(profile);
  }

  const newOperation = (key, type) => {
    const operation = {
      type: type,
      operator: (key.includes('loop') ? '&' : '+')
    }

    if (type === 'header_value') {
      operation.regex = '';
      operation.line = '';
    } else if (type === 'metadata_value') {
      const mdZero = getTableMetadataOptions(inputTable)[0];
      operation.value = null;
      operation.metadata = mdZero.key;
    }

    return operation;
  }

  const addOperationToProfile = (index, key, operation) => {

    if (profile.tables[index].table[key] === undefined) {
      profile.tables[index].table[key] = [];
    }
    profile.tables[index].table[key].push(operation);
    updateAutomatedOperationDescription(profile, index, key);
    setProfile(profile);
  }

  const addOperation = (index, key, type) => {
    if (index !== -1) {
      const operation = newOperation(key, type);
      if (type === 'header_value') {
        operation.table = inputTable;
        operation.ignore_missing_values = false;
      } else if (type === 'metadata_value') {
        operation.table = inputTable;
        operation.ignore_missing_values = false;
      } else if (type === 'column') {
        operation['column'] = {
          columnIndex: '',
          tableIndex: null
        };
      }
      addOperationToProfile(index, key, operation);
    }
  }

  const addLoopOperation = (index, key, type) => {
    if (index !== -1) {
      const operation = newOperation(key, type);
      if (type === 'column') {
        operation['column'] = '';
      }
      if (type === 'metadata_value') {
        operation['matchMode'] = 'key';
      }
      addOperationToProfile(index, key, operation);

    }
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


  const updateOperation = (index, key, opIndex, opKey, value) => {
    if (!value && typeof opKey === 'object') {
      Object.entries(opKey).forEach(([innerOpKey, value]) => {
        updateOperation(index, key, opIndex, innerOpKey, value);
      });
      return;
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

        if (value === 'XYDATA') {
          ['FIRSTX', 'LASTX', 'DELTAX'].forEach(headerKey => {
            // ensure headerKeys are there if XYDATA is selected
            if (header[headerKey] === undefined) {
              header[headerKey] = initIdentifier(profile, 'fileMetadata', tableIdx)
            }

            // update header identifiers if the type changed
            if (headerKey === key &&
              profile.tables[index].header[headerKey].type !== header[headerKey].type) {
              header[headerKey] = initIdentifier(profile, header[headerKey].type, tableIdx)
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


  return (<>
    <Card style={{marginBottom: '20px'}}>
      <Card.Header>
        Use this output table configuration for:
      </Card.Header>
      <Card.Body>
        <InputGroup className="mb-1">
          <InputGroup.Text>Table name</InputGroup.Text>
          <Form.Control
            size="sm"
            value={table.tableName}
            onChange={event => {
              const {target: {value}} = event;
              setInputTableName(value);
            }}
          >
          </Form.Control>
        </InputGroup>
        <p>Select an input table. If conditions have been selected, the input table serves only as a reference for
          creating the output table. However, if no conditions have been selected, the input table from the index
          selected here will be used during conversion to create the output table.</p>
        <DelayedActiveInputTableInput activeInputTable={inputTable} setActiveInputTable={setInputTable}
                                      delayTime={100}/>
      </Card.Body>
    </Card>

    <Card>
      <Card.Header>
        Input table select conditions
      </Card.Header>
      <Card.Body>

        <LoopForm
          index={index}
          tableIdx={tableIdx}
          inputTable={inputTable}
          addOperation={addLoopOperation}
          updateOperation={updateOperation}
          removeOperation={removeOperation}
        />
      </Card.Body>
    </Card>

    <TableForm
      table={table}
      inputTable={inputTable}
      inputTables={inputTables}
      inputColumns={inputColumns}
      updateHeader={(key, value) => updateHeader(index, key, value)}
      updateTable={(key, value, rootObj = false) => updateTable(index, key, value, rootObj)}
      addOperation={(key, type) => addOperation(index, key, type)}
      updateOperation={(key, opIndex, opKey, value) => updateOperation(index, key, opIndex, opKey, value)}
      updateOperationDescription={(key, value) => updateOperationDescription(index, key, value)}
      removeOperation={(key, opIndex) => removeOperation(index, key, opIndex)}
    /></>)
}

DataTableCardContent.propTypes = {
  table: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  inputTables: PropTypes.array.isRequired,
  tableIdx: PropTypes.number.isRequired
}
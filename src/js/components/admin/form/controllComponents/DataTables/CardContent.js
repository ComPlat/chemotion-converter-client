import TableForm from "./TableForm";
import Select from 'react-select';
import {Card} from 'react-bootstrap'
import React, {useCallback, useEffect, useMemo, useState} from "react";
import PropTypes from 'prop-types';
import {v4 as uuidv4} from "uuid";
import {
  getFileMetadataOptions, getInputColumns,
  getTableMetadataOptions
} from "../../../../../utils/profileUtils";
import {additionalInfo, initIdentifier} from "../../../../../utils/identifierUtils";
import LoopForm from "./LoopForm";
import {useAdminApp} from "../../../AppContext";


export default function DataTableCardContent({
                                               table,
                                               index,
                                               inputTables,
                                               tableIdx
                                             }) {

  const {profile, updateProfile: setProfile} = useAdminApp();
  console.log({table, XXX:profile.tables[index]});
  const inputTable = table.inputTableIndex;

  const inputColumns = useMemo(()=> getInputColumns(inputTables, inputTable), [inputTable]);
  const setInputTable = useCallback((value)=> {
    profile.tables[index].inputTableIndex = value;
    setProfile(profile);
  }, [table]);
  useEffect(() => {
    setInputTable(0);
  }, [tableIdx]);

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
      operation.ignore_missing_values = false;
    } else if (type === 'metadata_value') {
      const mdZero = getTableMetadataOptions(profile, tableIdx)[0];
      operation.value = mdZero.key;
      operation.metadata = '0';
      operation.ignore_missing_values = false;
    } else if (type === 'column') {
      operation['column'] = {
        columnIndex: null
      };
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
      } else if (type === 'metadata_value') {
        operation.table = inputTable;
      } else if (type === 'column') {
        operation['column']['tableIndex'] = null
      }
    addOperationToProfile(index, key, operation);
    }
  }

  const addLoopOperation = (index, key, type) => {
    if (index !== -1) {
      const operation = newOperation(key, type);
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

    if (opKey === 'metadata') {
      updateOperation(index, key, opIndex, 'value', value);
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


  const inputTableOptions = useMemo(() => inputTables.map((tablr, idx) => {
    return {
      value: idx,
      label: `Input tables ${idx}`,
    }
  }), [tableIdx]);


  const fileMetadataOptions = getFileMetadataOptions(profile, tableIdx);
  const tableMetadataOptions = useMemo(() => getTableMetadataOptions(profile, tableIdx, inputTable), [tableIdx, inputTable]);
  //const tableMetadataOptions = getTableMetadataOptions(profile, tableIdx, inputTable)


  return (<>
    <Card>
      <Card.Header>
        Use this output table configuration for:
      </Card.Header>
      <Card.Body style={{zIndex: '1000'}}>
        <Select value={inputTableOptions[inputTable]}
                onChange={(selectedOption) => setInputTable(selectedOption.value)}
                options={inputTableOptions}/>
      </Card.Body>
    </Card>

    <Card>
      <Card.Header>
        Loop conditions
      </Card.Header>
      <Card.Body>

        <LoopForm
          index={index}
          tableMetadataOptions={tableMetadataOptions}
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
      inputTables={inputTables}
      inputColumns={inputColumns}
      updateHeader={(key, value) => updateHeader(index, key, value)}
      updateTable={(key, value) => updateTable(index, key, value)}
      addOperation={(key, type) => addOperation(index, key, type)}
      updateOperation={(key, opIndex, opKey, value) => updateOperation(index, key, opIndex, opKey, value)}
      updateOperationDescription={(key, value) => updateOperationDescription(index, key, value)}
      removeOperation={(key, opIndex) => removeOperation(index, key, opIndex)}
      fileMetadataOptions={fileMetadataOptions}
      tableMetadataOptions={tableMetadataOptions}
    /></>)
}

DataTableCardContent.propTypes = {
  table: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  inputTables: PropTypes.array.isRequired,
  tableIdx: PropTypes.number.isRequired
}
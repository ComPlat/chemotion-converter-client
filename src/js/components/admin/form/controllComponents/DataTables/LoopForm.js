import React, {useMemo} from "react";
import PropTypes from 'prop-types';
import {Button, Col, Form, InputGroup, OverlayTrigger, Row, Tooltip} from "react-bootstrap";
import isEqual from "lodash/isEqual";
import {
  getDistInputColumns
} from "../../../../../utils/profileUtils";
import Select from "react-select";
import {useAdminApp} from "../../../AppContext";

function LoopTypeHeader({addOperation, index, loopType}) {

  const header = {
    loop_header: 'Column header',
    loop_metadata: 'Metadata',
    loop_theader: 'Header',

  }

  const opType = {
    loop_header: 'header_value',
    loop_metadata: 'metadata_value',
    loop_theader: 'header_value',

  }

  return (<p className="mb-0">
    <Button
      className="mr-2"
      size="sm"
      variant="outline-success"
      onClick={() => addOperation(
        index, loopType,
        opType[loopType]
      )}>
      +
    </Button>

    {header[loopType]}:
  </p>);
}

export default function LoopForm({
                                   index,
                                   tableIdx,
                                   inputTable,
                                   addOperation,
                                   updateOperation,
                                   removeOperation
                                 }) {
  const {profile, updateProfile: setProfile, options: {DATA_LOOP_CLASSES},  inData: {inputTables, getTableMetadataOptions}} = useAdminApp();
  const toggleMatchTables = (index, op_index = -1) => {
    const profile_table = profile.tables[index]
    if (op_index === -1) {
      if (profile.matchTables) { // handling for old profiles
        profile.matchTables = false
      } else {
        profile_table.matchTables = !profile_table.matchTables
      }
    } else {
      const {loop_metadata: loopMetadata} = profile_table.table;
      loopMetadata[op_index].ignoreValue = !loopMetadata[op_index].ignoreValue;
    }
    setProfile(profile)
  }
  const distInputColumns = useMemo(() => getDistInputColumns(inputTables, inputTable), [tableIdx, inputTable]);
  const tableMetadataOptions = getTableMetadataOptions(inputTable);
  const getSelectedMetadataOption = (metadata, outputTable, op_index) => {
    if (metadata == null) return null;

    for (const group of loopMetadataOptions(outputTable, op_index)) {
      const found = group.options.find(opt => opt.key === metadata);
      if (found) return found;
    }

    return null;
  };
  const handleChangeLoop = (value, index) => {
    profile.tables[index].loopType = value;
    setProfile(profile);
  }
  const handleChangeLoopOutput = (value, index) => {
    profile.tables[index].loopOutput = value;
    if (value === 'SINGLE FILE (NTUPLES)') {
      profile.tables[index].nTuplePageHeader |= '___+';
    }

    setProfile({...profile});
  }

  const loopMetadataOptions = (outputTable, op_index) => {
    return [{
      label: `Input table #${inputTable}`,
      options: tableMetadataOptions.map((item) => {
        const showValue = !profile.tables[outputTable].table.loop_metadata[op_index].ignoreValue && true
        return {
          value: item.key,
          key: item.key,
          metadata: item.key,
          label: showValue ? `${item.label} (${item.value})` : item.label
        }
      })
    }];
  };

  const {
    table: {loop_header: loopHeader = [], loop_metadata: loopMetadata = [], loop_theader: loopTheader = []},
    loopType,
    loopOutput
  } = profile.tables[index]
  const isLooped = loopType !== 'none'
  const isCondition = loopType === 'condition'

  return (<>
    <InputGroup>
      <Form.Select
        id="loop_select"
        aria-label="Select looping"
        value={loopType}
        onChange={(e) => handleChangeLoop(e.target.value, index)}
      >
        <option value="none">no loop.</option>
        <option value="all">all input tables.</option>
        <option value="condition">Conditioned</option>
      </Form.Select>
    </InputGroup>
    {isLooped && (<div
      style={{
        zIndex: 100,
        position: 'relative'
      }}>
      <Form.Group controlId="loop_select"
                  className="mb-2">
        <Form.Label column="sm">
          Output as:
        </Form.Label>
        <Select
          onChange={(selected) => handleChangeLoopOutput(selected.value, index)}
          options={DATA_LOOP_CLASSES.map((x) => {
            return {label: x, value: x}
          })}
          value={{label: loopOutput, value: loopOutput}}
        />
      </Form.Group>
    </div>)}
    {isCondition && <>
      <LoopTypeHeader addOperation={addOperation} index={index} loopType="loop_header"/>
      {loopHeader.map((operation, op_index) => (
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
            menuPosition="fixed"
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
    </>}
    {isCondition && <>
      <LoopTypeHeader addOperation={addOperation} index={index} loopType="loop_metadata"/>
      {loopMetadata.map((operation, op_index) => (
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
            menuPosition="fixed"
            menuShouldBlockScroll={false}
            menuShouldScrollIntoView={false}
            openMenuOnScroll={false}
            closeMenuOnScroll={false}
            value={getSelectedMetadataOption(operation.value, index, op_index)}
            onChange={(selected) => {
              if (!selected) {
                updateOperation(index, 'loop_metadata', op_index, 'metadata', '');
                return;
              }
              const metadataString = `${selected.value}`;

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
                     checked={loopMetadata[op_index].ignoreValue || false}
                     onChange={() => toggleMatchTables(index, op_index)}
              />
            </div>
          </OverlayTrigger>
        </InputGroup>
      ))}
    </>}
    {isCondition && <>
      <LoopTypeHeader addOperation={addOperation} index={index} loopType="loop_theader"/>
      {loopTheader.map((operation, op_index) => (
        <InputGroup key={op_index}>
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
      ))}</>}
  </>)
}

LoopForm.propTypes = {
  index: PropTypes.number.isRequired,
  tableIdx: PropTypes.number.isRequired,
  inputTable: PropTypes.number.isRequired,
  addOperation: PropTypes.func.isRequired,
  updateOperation: PropTypes.func.isRequired,
  removeOperation: PropTypes.func.isRequired
}
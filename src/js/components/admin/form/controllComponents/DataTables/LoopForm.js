import React, {useMemo} from "react";
import PropTypes from 'prop-types';
import {Button, Form, InputGroup, OverlayTrigger, Tooltip} from "react-bootstrap";
import isEqual from "lodash/isEqual";
import {
  getDistInputColumns
} from "../../../../../utils/profileUtils";
import Select from "react-select";
import {useAdminApp} from "../../../AppContext";

export default function LoopForm({
                                   index,
                                   tableMetadataOptions,
                                   tableIdx,
                                   inputTable,
                                   addOperation,
                                   updateOperation,
                                   removeOperation
                                 }) {
  const {profile, updateProfile: setProfile} = useAdminApp();
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
  const distInputColumns = useMemo(() => getDistInputColumns(profile, tableIdx, inputTable), [tableIdx, inputTable]);
  const getSelectedMetadataOption = (metadata, outputTable, op_index) => {
    if (metadata == null) return null;

    for (const group of loopMetadataOptions(outputTable, op_index)) {
      const found = group.options.find(opt => opt.metadata === metadata);
      if (found) return found;
    }

    return null;
  };
  const handleChangeLoop = (value, index) => {
    profile.tables[index].loopType = value;
    if(value !== 'all') {
      profile.tables[index].matchTables = false;
    }
    setProfile(profile);
  }

  const loopMetadataOptions = (outputTable, op_index) => {
    return [{
      label: `Input table #${inputTable}`,
      options: tableMetadataOptions.map((item) => {
        const cleanLabel = item.label.replace(/^Input table #\d+ /, "");
        const showValue = !profile.tables[outputTable].table.loop_metadata[op_index].ignoreValue && true
        return {
          value: item.key,
          key: item.key,
          metadata: cleanLabel,
          label: showValue ? `${cleanLabel} (${item.value})` : cleanLabel
        }
      })
    }];
  };

  return (<>          <InputGroup>
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
      && <div><p className="mb-0">Column header:</p>{profile.tables[index].table['loop_header'].map((operation, op_index) => (
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
      ))}</div>}
    {profile.tables[index].loopType !== "all" && profile.tables[index].table['loop_metadata']
      &&
      <div><p className="mb-0">Metadata:</p>{profile.tables[index].table['loop_metadata'].map((operation, op_index) => (
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
                     checked={profile.tables[index].table.loop_metadata[op_index].ignoreValue || false}
                     onChange={() => toggleMatchTables(index, op_index)}
              />
            </div>
          </OverlayTrigger>
        </InputGroup>
      ))}</div>}
    {profile.tables[index].loopType !== "all" && profile.tables[index].table['loop_theader']
      && <div><p className="mb-0">Header:</p>{profile.tables[index].table['loop_theader'].map((operation, op_index) => (
        <InputGroup  key={op_index}>
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
      ))}</div>}
  </>)
}

LoopForm.propTypes = {
  index: PropTypes.number.isRequired,
  tableMetadataOptions: PropTypes.array.isRequired,
  tableIdx: PropTypes.number.isRequired,
  inputTable: PropTypes.number.isRequired,
  addOperation: PropTypes.func.isRequired,
  updateOperation: PropTypes.func.isRequired,
  removeOperation: PropTypes.func.isRequired
}
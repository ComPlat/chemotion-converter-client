import React, {useMemo, useState} from "react"
import PropTypes from 'prop-types';
import {Col, Form, Row} from 'react-bootstrap';
import Select from "react-select";
import {DelayedActiveInputTableInput} from "../common/InputTables";
import {useAdminApp} from "../../AppContext";


const KeySelect = ({index, identifier, updateIdentifier}) => {
  const [inputTableIndex, setInputTableIndex] = useState(identifier.tableIndex);
  const {inData: {fileMetadataOptions, getTableMetadataOptions}} = useAdminApp();

  const [selectOptions, needsTableSelect] = useMemo(() => {
    if (identifier.type === 'fileMetadata') {
      return [fileMetadataOptions, false];
    } else {
      return [getTableMetadataOptions(inputTableIndex), true];
    }
  }, [inputTableIndex, fileMetadataOptions, identifier?.type]);


  const getOptionIndex = (identifier) => {

    if (identifier.type === 'fileMetadata') {
      return selectOptions.find(option => option.key === identifier.key)
    } else {
      return selectOptions.find(option => (option.key === identifier.key && option.tableIndex === identifier.tableIndex))
    }
  }

  const onChange = (option) => {
    const data = {
      key: option.key,
      value: option.value
    }
    if (identifier.type === 'tableMetadata') {
      data.tableIndex = option.tableIndex
    }
    updateIdentifier(index, data)
  }


  return (
    <Row>
      {needsTableSelect && (<Col>
        <DelayedActiveInputTableInput activeInputTable={inputTableIndex}
                                      setActiveInputTable={setInputTableIndex}
                                      asInputGroup={false}
                                      delayTime={100}/>

      </Col>)}
      <Col>
        <Form.Group style={{zIndex: 200}} controlId={`keySelect${index}`}>
          <Form.Label column="sm">Key</Form.Label>
          <Select
            size="sm"
            value={getOptionIndex(identifier)}
            onChange={(selectedOption) => onChange(selectedOption)}
            options={selectOptions}
          />
        </Form.Group>
      </Col>
    </Row>
  )
}

KeySelect.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func
}

export default KeySelect

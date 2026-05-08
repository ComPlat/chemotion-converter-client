import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import Select from "react-select";


const KeySelect = ({ index, identifier, fileMetadataOptions, tableMetadataOptions, updateIdentifier }) => {
  const selectOptions = (identifier.type === 'fileMetadata') ? fileMetadataOptions : tableMetadataOptions

  const getOptionIndex = identifier => {
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
    <Form.Group controlId={`keySelect${index}`}>
      <Form.Label column="sm">Key</Form.Label>
      <Select
        size="sm"
        value={getOptionIndex(identifier)}
        onChange={(selectedOption) => onChange(selectedOption)}
        options={selectOptions}
      />
    </Form.Group>
  )
}

KeySelect.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  fileMetadataOptions: PropTypes.array,
  tableMetadataOptions: PropTypes.array,
  updateIdentifier: PropTypes.func
}

export default KeySelect

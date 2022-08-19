import React, { Component } from "react"
import PropTypes from 'prop-types';

const KeySelect = ({ index, identifier, fileMetadataOptions, tableMetadataOptions, updateIdentifier }) => {
  const options = (identifier.type == 'fileMetadata') ? fileMetadataOptions : tableMetadataOptions

  const getOptionIndex = identifier => {
    if (identifier.type == 'fileMetadata') {
      return options.findIndex(option => option.key == identifier.key)
    } else {
      return options.findIndex(option => (option.key == identifier.key && option.tableIndex == identifier.tableIndex))
    }
  }

  const onChange = (optionIndex) => {
    const option = options[optionIndex]
    const data = {
      key: option.key
    }
    if (identifier.type == 'tableMetadata') {
      data.tableIndex = option.tableIndex
    }
    if (!identifier.match == 'regex') {
      data.value = option.value
    }

    updateIdentifier(index, data)
  }

  return (
    <React.Fragment>
      <label className="sr-only" htmlFor={`keySelect${index}`}>Key</label>
      <select className="form-control form-control-sm" id={`keySelect${index}`} value={getOptionIndex(identifier)}
              onChange={(event) => onChange(event.target.value)} >
        {
          options.map((option, optionIndex) => (
            <option key={optionIndex} value={optionIndex}>{option.label}</option>
          ))
        }
      </select>
      <label className="mb-0" htmlFor={`keyInput${index}`}><small>Key</small></label>
    </React.Fragment>
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

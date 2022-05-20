import React, { Component } from "react"

const KeySelect = ({ index, identifier, data, updateIdentifier }) => {
  const updateKey = (option) => {
    const identifierData = {
      key: option.key
    }
    if (identifier.type == 'tableMetadata') {
      identifierData.tableIndex = option.tableIndex
    }
    if (!identifier.isRegex) {
      identifierData.value = option.value
    }

    updateIdentifier(index, identifierData)
  }

  let keyOptions = []
  if (identifier.type == 'fileMetadata') {
    keyOptions = Object.keys(data.metadata).map(key => ({
      key,
      label: key,
      value: data.metadata[key]
    }))
  } else if (identifier.type == 'tableMetadata') {
    keyOptions = data.tables.reduce((acc, table, tableIndex) => {
      if (table.metadata !== undefined) {
        return acc.concat(Object.keys(table.metadata).map(key => ({
          key,
          tableIndex,
          value: table.metadata[key],
          label: `Input table #${tableIndex} ${key}` })))
      } else {
        return acc
      }
    }, [])
  }

  return (
    <React.Fragment>
      <label className="sr-only" htmlFor={`keySelect${index}`}>Key</label>
      <select className="form-control form-control-sm" id={`keySelect${index}`}
              onChange={(event) => updateKey(keyOptions[event.target.value])}>
        {
          keyOptions.map((option, i) => (
            <option key={i} value={i}>{option.label}</option>
          ))
        }
      </select>
      <label className="mb-0" htmlFor={`keyInput${index}`}><small>Key</small></label>
    </React.Fragment>
  )
}

export default KeySelect

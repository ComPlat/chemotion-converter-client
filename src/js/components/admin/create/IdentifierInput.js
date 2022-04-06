import React, { Component } from "react"

class IndentifierInput extends Component {

  constructor(props) {
    super(props)
  }

  getKeyOptions() {
    const { type, tableData } = this.props

    if (type == 'fileMetadata') {
      return Object.keys(tableData.metadata).map(key => ({
        key,
        label: key,
        value: tableData.metadata[key]
      }))
    } else if (type == 'tableMetadata') {
      return tableData.tables.reduce((acc, table, tableIndex) => {
        if (table.metadata !== undefined) {
          return acc.concat(Object.keys(table.metadata).map(key => ({
            key,
            tableIndex,
            value: table.metadata[key],
            label: `Input table ${tableIndex} ${key}` })))
        } else {
          return acc
        }
      }, [])
    } else {
      return []
    }
  }

  updateKey(option) {
    const { index, type, identifier, updateIdentifier } = this.props
    const identifierData = {
      key: option.key
    }
    if (type == 'tableMetadata') {
      identifierData.tableIndex = option.tableIndex
    }
    if (!identifier.isRegex) {
      identifierData.value = option.value
    }

    updateIdentifier(index, identifierData)
  }

  render() {
    const { index, type, identifier, tableData, tables, addIdentifier, updateIdentifier, removeIdentifier } = this.props
    const keyOptions = this.getKeyOptions()
    const valueDisabled = (type == 'fileMetadata' || type == 'tableMetadata') && !identifier.isRegex

    return (
      <form>
        <div className="form-row align-items-center">
          {
            (type == 'fileMetadata' || type == 'tableMetadata') &&
            <div className="col-lg-4 mb-2">
              <label className="sr-only" htmlFor={`keySelect${index}`}>Key</label>
              <select className="form-control form-control-sm" id={`keySelect${index}`}
                      onChange={(event) => this.updateKey(keyOptions[event.target.value])}>
                {
                  keyOptions.map((option, i) => (
                    <option key={i} value={i}>{option.label}</option>
                  ))
                }
              </select>
            </div>
          }
          {
            (type == 'tableHeader') &&
            <div className="col-lg-4 mb-2">
              <label className="sr-only" htmlFor={`tableIndexSelect${index}`}>Key</label>
              <select className="form-control form-control-sm" id={`tableIndexSelect${index}`}
                      onChange={(event) => updateIdentifier(index, { tableIndex: parseInt(event.target.value, 10) })}>
                {
                  tableData.tables.map((table, tableIndex) => <option key={tableIndex} value={tableIndex}>Input table #{tableIndex}</option>)
                }
              </select>
            </div>
          }
          {
            (type == 'tableHeader') &&
            <div className="col-lg-2 mb-2">
              <label className="sr-only" htmlFor={`lineNumberInput${index}`}>Line</label>
              <input
                type="text"
                id={`lineNumberInput${index}`}
                className="form-control form-control-sm"
                placeholder={'# Line'}
                value={identifier.lineNumber}
                onChange={(event) => updateIdentifier(index, { lineNumber: parseInt(event.target.value, 10) })}
              />
            </div>
          }
          <div className={(type == 'tableHeader' ? 'col-lg-4' : 'col-lg-6') + ' mb-2'}>
            <label className="sr-only" htmlFor={`valueInput${index}`}>Value</label>
            <div className="input-group">
              <input
                type="text"
                id={`valueInput${index}`}
                className="form-control form-control-sm"
                placeholder={valueDisabled ? '' : 'Value'}
                value={identifier.value}
                onChange={(event) => updateIdentifier(index, { value: event.target.value })}
                disabled={valueDisabled}
              />
            </div>
          </div>
          <div className="col-lg-2 mb-2">
            <div className="form-check">
              <input className="form-check-input"
                type="checkbox"
                id={`regexInput${index}`}
                checked={identifier.isRegex}
                onChange={(event) => updateIdentifier(index, { isRegex: !identifier.isRegex })}
              />
              <label className="form-check-label" htmlFor={`regexInput${index}`}>Regex</label>
            </div>
          </div>
        </div>
        <div className="form-row align-items-center">
          <div className="col-lg-4 mb-2">
            <label className="sr-only" htmlFor={`outputTableIndexSelect${index}`}>Output table</label>
            <select className="form-control form-control-sm" id={`outputTableIndexSelect${index}`}
                    onChange={(event) => updateIdentifier(index, { outputTableIndex: parseInt(event.target.value, 10) })}>
              <option value="">---</option>
              {
                tables.map((outputTable, outputTableIndex) => <option key={outputTableIndex} value={outputTableIndex}>Output table #{outputTableIndex}</option>)
              }
            </select>
          </div>
          <div className="col-lg-3 mb-2">
            <label className="sr-only" htmlFor={`outputLayerInput${index}`}>Line</label>
            <input
              type="text"
              id={`outputLayerInput${index}`}
              className="form-control form-control-sm"
              placeholder={'Output layer'}
              value={identifier.outputLayer}
              onChange={(event) => updateIdentifier(index, { outputLayer: event.target.value })}
            />
          </div>
          <div className="col-lg-3 mb-2">
            <label className="sr-only" htmlFor={`outputKeyInput${index}`}>Line</label>
            <input
              type="text"
              id={`outputKeyInput${index}`}
              className="form-control form-control-sm"
              placeholder={'Output key'}
              value={identifier.outputKey}
              onChange={(event) => updateIdentifier(index, { outputKey: event.target.value })}
            />
          </div>
          <div className="col-lg-2 mb-2">
            <button type="button" className="btn btn-danger btn-sm btn-block" onClick={() => removeIdentifier(index)}>Remove</button>
          </div>
        </div>
      </form>
    )
  }
}

export default IndentifierInput

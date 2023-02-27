import React, { Component } from "react"
import PropTypes from 'prop-types';

import KeyInput from './identifier/KeyInput'
import KeySelect from './identifier/KeySelect'
import LineNumberInput from './identifier/LineNumberInput'
import MatchSelect from './identifier/MatchSelect'
import OperatorSelect from './common/OperatorSelect'
import OutputKeyInput from './identifier/OutputKeyInput'
import OutputLayerInput from './identifier/OutputLayerInput'
import OutputTableIndexSelect from './identifier/OutputTableIndexSelect'
import TableIndexInput from './identifier/TableIndexInput'
import TableIndexSelect from './identifier/TableIndexSelect'
import ValueInput from './identifier/ValueInput'

class IndentifierInput extends Component {

  render() {
    const { index, identifier, fileMetadataOptions, tableMetadataOptions,
            inputTables, outputTables, updateIdentifier, removeIdentifier,
            updateIdentifierOperation, removeIdentifierOperation, dataset } = this.props
    const valueDisabled = identifier.match === 'any'

    return (
      <form className="mt-15 mb-0">
        <div className="row">
          {
            (identifier.type === 'fileMetadata' || identifier.type === 'tableMetadata') &&
            <div className="col-md-12 mb-10">
              {
                fileMetadataOptions.length > 0 ? <KeySelect index={index} identifier={identifier}
                                                            fileMetadataOptions={fileMetadataOptions}
                                                            tableMetadataOptions={tableMetadataOptions}
                                                            updateIdentifier={updateIdentifier} />
                                               : <KeyInput index={index} identifier={identifier}
                                                           updateIdentifier={updateIdentifier} />
              }
            </div>
          }
          {
            (identifier.type === 'tableHeader') &&
            <div className="col-md-10 mb-10">
              {
                inputTables.length > 0 ? <TableIndexSelect index={index} identifier={identifier} tables={inputTables} updateIdentifier={updateIdentifier} />
                                       : <TableIndexInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
              }
            </div>
          }
          {
            (identifier.type === 'tableHeader' || identifier.type === 'file') &&
            <div className="col-md-2 mb-10">
              <LineNumberInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
            </div>
          }
        </div>
        <div className="row">
          <div className="col-md-4 mb-10">
            <MatchSelect index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
          </div>
          <div className="col-md-8 mb-10">
            <ValueInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} disabled={valueDisabled} />
          </div>
        </div>
        {
          identifier.optional &&
          <div className="row">
            <div className="col-md-4 mb-10">
              <OutputTableIndexSelect index={index} identifier={identifier} tables={outputTables}
                                      updateIdentifier={updateIdentifier} />
            </div>
            <div className="col-md-4 mb-10">
              <OutputLayerInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} dataset={dataset} />
            </div>
            <div className="col-md-4 mb-10">
              <OutputKeyInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} dataset={dataset} />
            </div>
          </div>
        }
        {
          Array.isArray(identifier.operations) && identifier.operations.map((operation, opIndex) => (
            <div key={opIndex} className="row">
              <div className="col-sm-4 mb-10">
                <OperatorSelect value={operation.operator} id={`identifierOperationOperator${index}${opIndex}`}
                                onChange={value => updateIdentifierOperation(index, opIndex, 'operator', value)} />
                <label className="mb-0" htmlFor={`identifierOperationOperator${index}${opIndex}`}><small>Operator</small></label>
              </div>
              <div className="col-sm-6 mb-10">
                <input type="text" id={`identifierOperationValue${index}${opIndex}`}
                       className="form-control input-sm" value={operation.value || ''}
                       onChange={event => updateIdentifierOperation(index, opIndex, 'value', event.target.value)} />
                <label className="mb-0" htmlFor={`identifierOperationValue${index}${opIndex}`}><small>Value</small></label>
              </div>
              <div className="col-sm-2 mb-10 text-right">
                <button type="button" className="btn btn-danger btn-sm" onClick={event => removeIdentifierOperation(index, opIndex)}>
                  &times;
                </button>
              </div>
            </div>
          ))
        }
      </form>
    )
  }

}

IndentifierInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  fileMetadataOptions: PropTypes.array,
  tableMetadataOptions: PropTypes.array,
  inputTables: PropTypes.array,
  outputTables: PropTypes.array,
  dataset: PropTypes.object,
  updateIdentifier: PropTypes.func,
  removeIdentifier: PropTypes.func
}

export default IndentifierInput

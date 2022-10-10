import React, { Component } from "react"
import PropTypes from 'prop-types';

import KeyInput from './identifier/KeyInput'
import KeySelect from './identifier/KeySelect'
import LineNumberInput from './identifier/LineNumberInput'
import MatchSelect from './identifier/MatchSelect'
import OutputKeyInput from './identifier/OutputKeyInput'
import OutputLayerInput from './identifier/OutputLayerInput'
import OutputTableIndexSelect from './identifier/OutputTableIndexSelect'
import TableIndexInput from './identifier/TableIndexInput'
import TableIndexSelect from './identifier/TableIndexSelect'
import ValueInput from './identifier/ValueInput'


class IndentifierInput extends Component {

  render() {
    const { index, identifier, fileMetadataOptions, tableMetadataOptions,
            inputTables, outputTables, updateIdentifier, removeIdentifier, dataset } = this.props
    const valueDisabled = identifier.match == 'any'

    return (
      <form className="mt-15">
        <div className="row">
          {
            (identifier.type == 'fileMetadata' || identifier.type == 'tableMetadata') &&
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
            (identifier.type == 'tableHeader') &&
            <div className="col-md-10 mb-10">
              {
                inputTables.length > 0 ? <TableIndexSelect index={index} identifier={identifier} tables={inputTables} updateIdentifier={updateIdentifier} />
                                       : <TableIndexInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
              }
            </div>
          }
          {
            (identifier.type == 'tableHeader') &&
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

import React, { Component } from "react"

import KeyInput from '../common/KeyInput'
import TableIndexInput from '../common/TableIndexInput'
import LineNumberInput from '../common/LineNumberInput'
import ValueInput from '../common/ValueInput'
import RegexCheckbox from '../common/RegexCheckbox'
import OutputTableIndexInput from '../common/OutputTableIndexInput'
import OutputLayerInput from '../common/OutputLayerInput'
import OutputKeyInput from '../common/OutputKeyInput'
import RemoveButton from '../common/RemoveButton'

class IdentifierInput extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { index, identifier, tables, updateIdentifier, removeIdentifier } = this.props
    const valueDisabled = (identifier.type == 'fileMetadata' || identifier.type == 'tableMetadata') && !identifier.isRegex
    return (
      <form>
        <div className="form-row-item">
          {
            (identifier.type == 'tableMetadata' || identifier.type == 'tableHeader') &&
            <div className="col-md-2 mb-10">
              <TableIndexInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
            </div>
          }
          {
            (identifier.type == 'fileMetadata' || identifier.type == 'tableMetadata') &&
            <div className={(identifier.type == 'tableMetadata' ? 'col-md-2' : 'col-md-4') + ' mb-10'}>
              <KeyInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
            </div>
          }
          {
            (identifier.type == 'tableHeader') &&
            <div className="col-md-2 mb-10">
              <LineNumberInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
            </div>
          }
          <div className="col-md-4 mb-10">
            <ValueInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
          </div>
          <div className="col-md-2 mb-10">
            <RegexCheckbox index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
          </div>
          <div className="col-md-2 mb-10">
            <RemoveButton index={index} removeIdentifier={removeIdentifier} />
          </div>
        </div>
        {
          identifier.optional &&
          <div className="form-row-item">
            <div className="col-md-2 mb-10">
              <OutputTableIndexInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
            </div>
            <div className="col-md-5 mb-10">
              <OutputLayerInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
            </div>
            <div className="col-md-5 mb-10">
              <OutputKeyInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
            </div>
          </div>
        }
      </form>
    )
  }
}

export default IdentifierInput

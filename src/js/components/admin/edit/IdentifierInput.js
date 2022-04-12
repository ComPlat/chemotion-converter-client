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
        <div className="form-row">
          {
            (identifier.type == 'tableMetadata' || identifier.type == 'tableHeader') &&
            <div className="col-lg-2 mb-2">
              <TableIndexInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
            </div>
          }
          {
            (identifier.type == 'fileMetadata' || identifier.type == 'tableMetadata') &&
            <div className={(identifier.type == 'tableMetadata' ? 'col-lg-2' : 'col-lg-4') + ' mb-2'}>
              <KeyInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
            </div>
          }
          {
            (identifier.type == 'tableHeader') &&
            <div className="col-lg-2 mb-2">
              <LineNumberInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
            </div>
          }
          <div className="col-lg-4 mb-2">
            <ValueInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
          </div>
          <div className="col-lg-2 mb-2">
            <RegexCheckbox index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
          </div>
          <div className="col-lg-2 mb-2">
            <RemoveButton index={index} removeIdentifier={removeIdentifier} />
          </div>
        </div>
        {
          identifier.optional &&
          <div className="form-row">
            <div className="col-lg-2 mb-2">
              <OutputTableIndexInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
            </div>
            <div className="col-lg-5 mb-2">
              <OutputLayerInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
            </div>
            <div className="col-lg-5 mb-2">
              <OutputKeyInput index={index} identifier={identifier} updateIdentifier={updateIdentifier} />
            </div>
          </div>
        }
      </form>
    )
  }
}

export default IdentifierInput

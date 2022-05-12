import React, { Component } from "react"

import KeySelect from '../common/KeySelect'
import TableIndexSelect from '../common/TableIndexSelect'
import LineNumberInput from '../common/LineNumberInput'
import ValueInput from '../common/ValueInput'
import RegexCheckbox from '../common/RegexCheckbox'
import OutputTableIndexSelect from '../common/OutputTableIndexSelect'
import OutputLayerInput from '../common/OutputLayerInput'
import OutputKeyInput from '../common/OutputKeyInput'
import RemoveButton from '../common/RemoveButton'


class IndentifierInput extends Component {

  render() {
    const { index, identifier, tableData, tables, updateIdentifier, removeIdentifier, dataset } = this.props

    return (
      <form>
        <div className="row">
          {
            (identifier.type == 'fileMetadata' || identifier.type == 'tableMetadata') &&
            <div className="col-md-4 mb-10">
              <KeySelect index={index} identifier={identifier} tableData={tableData}
                         updateIdentifier={updateIdentifier} />
            </div>
          }
          {
            (identifier.type == 'tableHeader') &&
            <div className="col-md-3 mb-10">
              <TableIndexSelect index={index} identifier={identifier} tableData={tableData}
                                updateIdentifier={updateIdentifier} />
            </div>
          }
          {
            (identifier.type == 'tableHeader') &&
            <div className="col-md-1 mb-10">
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
          <div className="row">
            <div className="col-md-4 mb-10">
              <OutputTableIndexSelect index={index} identifier={identifier} tables={tables}
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

export default IndentifierInput

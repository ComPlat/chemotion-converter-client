import React, { Component } from "react"
import PropTypes from 'prop-types';

import TypeSelect from './identifier/TypeSelect'
import IdentifierInput from './IdentifierInput'


class TableIdentifier extends Component {

  constructor(props) {
    super(props)

    this.updateTableIdentifier = this.updateTableIdentifier.bind(this)
  }

  updateTableIdentifier(identifierIndex, data) {
    const { headerKey, table, updateHeader } = this.props
    const headerKeyIdentifier = Object.assign({}, table.header[headerKey], data)

    updateHeader(headerKey, headerKeyIdentifier)
  }

  render() {
    const { index, headerKey, table, inputTables,
            fileMetadataOptions, tableMetadataOptions } = this.props

    return (
      <div>
        <div className="row">
          <div className="col-md-2 mb-10">
            <p className="form-control-static">{headerKey}</p>
          </div>
          <div className="col-md-10 mb-10">
            <TypeSelect index={index} identifier={table.header[headerKey]}
                        updateIdentifier={this.updateTableIdentifier} />
          </div>
        </div>
        <IdentifierInput
          index={index}
          identifier={table.header[headerKey]}
          inputTables={inputTables}
          fileMetadataOptions={fileMetadataOptions}
          tableMetadataOptions={tableMetadataOptions}
          updateIdentifier={this.updateTableIdentifier}
        />
      </div>
    )
  }
}

TableIdentifier.propTypes = {
  index: PropTypes.number,
  headerKey: PropTypes.string,
  table: PropTypes.object,
  inputTables: PropTypes.array,
  updateHeader: PropTypes.func,
  fileMetadataOptions: PropTypes.array,
  tableMetadataOptions: PropTypes.array
}

export default TableIdentifier

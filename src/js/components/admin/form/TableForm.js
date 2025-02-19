import React, { Component } from "react"
import PropTypes from 'prop-types';

import HeaderInput from './table/HeaderInput'
import TableColumn from './TableColumn'
import TableIdentifier from './TableIdentifier'
import ExtendedHeaderInput from "./table/ExtendedHeaderInput";


class TableForm extends Component {

  render() {
    const {
      table, inputTables, inputColumns, options,
      updateTable, updateHeader,
      addOperation, updateOperation, removeOperation,
      fileMetadataOptions, tableMetadataOptions
    } = this.props

    const xy_units = { XUNITS: options.XUNITS, YUNITS: options.YUNITS }

    const headerOptions = Object.keys(options).reduce(function(filtered, key) {
      if (!(key in xy_units)) filtered[key] = options[key];
      return filtered;
    }, {});


    return (
      <div>
        <div className="fw-bold">
          Table header
        </div>

        {Object.keys(headerOptions).map((optionKey, index) => (
          <HeaderInput key={index} optionKey={optionKey} value={table.header[optionKey]} values={headerOptions[optionKey]} updateHeader={updateHeader} />
        ))}

        {Object.keys(xy_units).map((optionKey, index) => (
          <ExtendedHeaderInput key={index} optionKey={optionKey} value={table.header[optionKey]} values={xy_units[optionKey]} updateHeader={updateHeader} />
        ))}

        <div className="mt-3 fw-bold">
          Table columns
        </div>

        {(table.header['DATA CLASS'] === 'XYDATA') ? (
          <div>
            <div className="mb-2">
              Which metadata should be used for the x-values?
            </div>
            {['FIRSTX', 'LASTX', 'DELTAX'].map((headerKey, index) => (
              <TableIdentifier
                key={index}
                index={index + 1000}
                headerKey={headerKey}
                table={table}
                inputTables={inputTables}
                updateHeader={updateHeader}
                fileMetadataOptions={fileMetadataOptions}
                tableMetadataOptions={tableMetadataOptions}
              />
            ))}
          </div>
        ) : (
          <TableColumn
            table={table.table}
            label="Which column should be used as x-values?"
            columnKey="xColumn"
            operationsKey="xOperations"
            inputColumns={inputColumns}
            updateTable={updateTable}
            addOperation={addOperation}
            updateOperation={updateOperation}
            removeOperation={removeOperation}
            tableMetadataOptions={tableMetadataOptions}
            inputTables={inputTables}
          />
        )}

        <TableColumn
          table={table.table}
          label="Which column should be used as y-values?"
          columnKey="yColumn"
          operationsKey="yOperations"
          inputColumns={inputColumns}
          updateTable={updateTable}
          addOperation={addOperation}
          updateOperation={updateOperation}
          removeOperation={removeOperation}
          tableMetadataOptions={tableMetadataOptions}
          inputTables={inputTables}
        />

        <small className="text-muted">The data you pick will determine which table columns are going to converted.</small>
      </div>
    )
  }

}

TableForm.propTypes = {
  table: PropTypes.object,
  inputTables: PropTypes.array,
  inputColumns: PropTypes.array,
  options: PropTypes.object,
  updateTable: PropTypes.func,
  updateHeader: PropTypes.func,
  addOperation: PropTypes.func,
  updateOperation: PropTypes.func,
  removeOperation: PropTypes.func,
  fileMetadataOptions: PropTypes.array,
  tableMetadataOptions: PropTypes.array
}

export default TableForm

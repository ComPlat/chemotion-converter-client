import React from "react"
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap'

const ColumnSelect = ({ column, columnList, onChange }) => {

  const handleChange = event => {
    const index = event.target.value
    if (index) {
      onChange(columnList[index].value)
    } else {
      onChange(false)
    }
  }

  const getColumn = column => {
    if (column) {
      return columnList.reduce((agg, cur, idx) => {
        if (cur.value.tableIndex == column.tableIndex &&
          cur.value.columnIndex == column.columnIndex) {
          return idx
        } else {
          return agg
        }
      }, false)
    } else {
      return false
    }
  }

  return (
    <Form.Select
      size="sm"
      value={getColumn(column)}
      onChange={handleChange}
    >
      <option value="">---</option>
      {columnList.map((item, index) => (
        <option value={index} key={index}>{item.label}</option>
      ))}
    </Form.Select>
  )
}

ColumnSelect.propTypes = {
  column: PropTypes.object,
  columnList: PropTypes.array,
  onChange: PropTypes.func
}

export default ColumnSelect

import React, { useEffect } from "react"
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap'

const ColumnSelect = ({ column, columnList, onChange }) => {
	useEffect(() => {
		const current = getColumn(column);

		// If nothing selected AND list has values → auto-select index 0
		if (current === "" && columnList.length > 0) {
			onChange(columnList[0].value);
		}
	}, [columnList]);


  const handleChange = (event) => {
    const indexStr = event.target.value;

    if (indexStr === "") {
      onChange(false);
      return;
    }

    const index = Number(indexStr);
    onChange(columnList[index].value);
  };

  const getColumn = (column) => {
    if (!column) return "";

    const idx = columnList.findIndex(
      (cur) =>
        cur.value.tableIndex === column.tableIndex &&
        cur.value.columnIndex === column.columnIndex
    );

    return idx >= 0 ? String(idx) : "";
  };

  return (
    <Form.Select
      size="sm"
      value={getColumn(column)}
      onChange={handleChange}
    >
      <>
				{columnList.map((item, index) => (
          <option value={String(index)} key={index}>{item.label}</option>
        ))}
      </>
    </Form.Select>
  )
}

ColumnSelect.propTypes = {
  column: PropTypes.object,
  columnList: PropTypes.array,
  onChange: PropTypes.func
}

export default ColumnSelect

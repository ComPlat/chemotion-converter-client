import React, {useEffect} from "react"
import PropTypes from 'prop-types';
import Select from "react-select";

const ColumnSelect = ({column, columnList, onChange}) => {
  useEffect(() => {
    const current = getColumn(column);

    // If nothing selected AND list has values → auto-select index 0
    if (!current && columnList[0].length > 0) {
      onChange(columnList[0].options[0].value);
    }
  }, [columnList[0]?.options.length]);


  const handleChange = (columnSelected) => {
    onChange(columnSelected.value);
  };

  const getColumn = (column) => {
    if (!column) return "";

    return columnList.map((x) => x.options).flat().find(
      (cur) =>
        cur.value.columnIndex === column.columnIndex
    );
  };

  return (
    <Select
      size="sm"
      value={getColumn(column)}
      onChange={handleChange}
      options={columnList}
    />
  )
}

ColumnSelect.propTypes = {
  column: PropTypes.object,
  columnList: PropTypes.array,
  onChange: PropTypes.func
}

export default ColumnSelect

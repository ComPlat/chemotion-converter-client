import React, {Component} from "react"
import PropTypes from 'prop-types';
import {Form} from 'react-bootstrap';

const OutputTableIndexSelect = ({index, identifier, tables, updateIdentifier}) => {
  const toggleTable = (tableIdx) => {
    const idx = identifier.outputTableIndex.indexOf(tableIdx);
    if (idx !== -1) {
      identifier.outputTableIndex.splice(idx, 1);
    } else {
      identifier.outputTableIndex.push(tableIdx);
    }

    updateIdentifier(index, {outputTableIndex: identifier.outputTableIndex})
  }

  return (
    <Form.Group controlId={`outputTableIndexSelect${index}`}>
      <Form.Label column="lg">Output table</Form.Label>
      {tables.map((outputTable, outputTableIndex) => (<Form.Check
          type="checkbox"
          key={outputTableIndex}
          onChange={(e) => toggleTable(outputTableIndex)}
          checked={identifier.outputTableIndex.includes(outputTableIndex)}
          label={`Output table #${outputTableIndex}`}/>
      ))}
    </Form.Group>
  )
}

OutputTableIndexSelect.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  tables: PropTypes.array,
  updateIdentifier: PropTypes.func
}

export default OutputTableIndexSelect

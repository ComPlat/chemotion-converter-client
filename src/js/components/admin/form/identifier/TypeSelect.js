import React from "react"
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const TypeSelect = ({ index, identifier, updateIdentifier }) => {
  return (
    <Form.Select
      size="sm"
      value={identifier.type}
      onChange={(event) => updateIdentifier(index, { type: event.target.value })}
    >
      <option value="fileMetadata">Based on file metadata</option>
      <option value="tableMetadata">Based on table metadata</option>
      <option value="tableHeader">Based on table headers</option>
    </Form.Select>
  )
}

TypeSelect.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func
}

export default TypeSelect

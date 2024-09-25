import React from "react"
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const OperatorSelect = ({ value, onChange }) => (
  <Form.Select
    size="sm"
    value={value}
    onChange={event => onChange(event.target.value)}
  >
    <option value="+">+</option>
    <option value="-">-</option>
    <option value="*">*</option>
    <option value=":">:</option>
  </Form.Select>
)

OperatorSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func
}

export default OperatorSelect

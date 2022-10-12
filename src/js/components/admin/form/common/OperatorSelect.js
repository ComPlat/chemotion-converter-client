import React, { Component } from "react"
import PropTypes from 'prop-types';

const OperatorSelect = ({ value, onChange }) => (
  <select className="form-control input-sm" value={value} onChange={event => onChange(event.target.value)}>
    <option value="+">+</option>
    <option value="-">-</option>
    <option value="*">*</option>
    <option value=":">:</option>
  </select>
)

OperatorSelect.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func
}

export default OperatorSelect

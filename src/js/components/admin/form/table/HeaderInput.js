import React, { Component } from "react"
import PropTypes from 'prop-types';

const HeaderInput = ({ optionKey, value, values, updateHeader }) => (
  <div className="form-group row">
    <label htmlFor={optionKey} className="col-sm-4 col-form-label">{optionKey}</label>
    <div className="col-sm-8">
      <select className="form-control form-control-sm" id={optionKey} value={value}
              onChange={e => updateHeader(optionKey, e.target.value)}>
        {
          values.map((value, index) => {
            return <option value={value} key={index}>{value}</option>
          })
        }
      </select>
    </div>
  </div>
)

HeaderInput.propTypes = {
  optionKey: PropTypes.string,
  value: PropTypes.string,
  values: PropTypes.array,
  updateHeader: PropTypes.func
}

export default HeaderInput

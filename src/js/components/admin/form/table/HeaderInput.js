import React, { Component } from "react"

const HeaderInput = ({ option, value, values, updateHeader }) => (
  <div className="form-group row">
    <label htmlFor={option} className="col-sm-4 col-form-label">{option}</label>
    <div className="col-sm-8">
      <select className="form-control form-control-sm" id={option} value={value}
              onChange={e => updateHeader(option, e.target.value)}>
        {
          values.map((value, index) => {
            return <option value={value} key={index}>{value}</option>
          })
        }
      </select>
    </div>
  </div>
)

export default HeaderInput

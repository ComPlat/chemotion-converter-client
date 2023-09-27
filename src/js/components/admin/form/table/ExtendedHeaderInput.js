import React, { Component } from "react"
import PropTypes from 'prop-types';
import CreatableSelect from 'react-select/creatable';


const ExtendedHeaderInput = ({ optionKey, value, values, updateHeader }) => {
    let idx = values.indexOf(value);
    values = values.map((x) => {  return { 'value': x, 'label': x}});
    if(idx === -1) {
        if(value) values.unshift({ 'value': value, 'label': value});
        idx = 0;
    }

    return (
        <div className="form-group row">
            <label htmlFor={optionKey} className="col-sm-4 col-form-label">{optionKey}</label>
            <div className="col-sm-8">
                <CreatableSelect
                    options={values}
                    defaultValue={values[idx]}
                    onChange={(v) => {updateHeader(optionKey, v.value)}}/>
            </div>
        </div>
    )
}

ExtendedHeaderInput.propTypes = {
  optionKey: PropTypes.string,
  value: PropTypes.string,
  values: PropTypes.array,
  updateHeader: PropTypes.func
}

export default ExtendedHeaderInput

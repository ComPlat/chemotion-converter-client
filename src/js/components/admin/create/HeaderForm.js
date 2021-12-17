import React, { Component } from "react"

class HeaderForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="mb-3">
        <div>
          <label>Table header</label>
        </div>
        {
          Object.keys(this.props.headerOptions).map((option, index) => {
            return (
              <div key={index} className="form-group">
                <label htmlFor={option}>{option}</label>
                <select className="form-control form-control-sm" onChange={e => this.props.onChange(option, e.target.value)} id={option}>
                  {
                    this.props.headerOptions[option].map((select, selectIndex) => {
                      return <option value={select} key={selectIndex}>{select}</option>
                    })
                  }
                </select>
              </div>
            )
          }
        )}
        <small className="text-muted">The data you pick here will be added to the metadata of your converted file.</small>
      </div>
    )
  }
}

export default HeaderForm

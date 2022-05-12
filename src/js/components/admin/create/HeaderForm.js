import React, { Component } from "react"

class HeaderForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="mb-20">
        <div>
          <label>Table header</label>
        </div>
        {
          Object.keys(this.props.headerOptions).map((option, index) => {
            return (
              <div key={index} className="form-group row">
                <label htmlFor={option} className="col-sm-4 col-form-label">{option}</label>
                <div className="col-sm-8">
                  <select className="form-control form-control-sm" onChange={e => this.props.updateHeader(option, e.target.value)} id={option}>
                    {
                      this.props.headerOptions[option].map((select, selectIndex) => {
                        return <option value={select} key={selectIndex}>{select}</option>
                      })
                    }
                  </select>
                </div>
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

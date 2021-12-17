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
          Object.keys(this.props.header).map((key, index) => {
            return (
              <div key={index} className="form-row align-items-center">
                <div className="col-lg-2 mb-2">
                  <input
                    readOnly
                    type="text"
                    className="form-control form-control-sm"
                    value={key}
                  />
                </div>
                <div className="col-lg-10 mb-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    onChange={event => this.props.onChange(key, event.target.value)}
                    value={this.props.header[key]}
                  />
                </div>
              </div>
            )
          })
        }
        <small className="text-muted">The data you pick here will be added to the metadata of your converted file.</small>
      </div>
    )
  }
}

export default HeaderForm

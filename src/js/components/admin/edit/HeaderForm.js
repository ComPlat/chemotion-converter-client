import React, { Component } from "react"

class HeaderForm extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { header, addHeader, updateHeader, removeHeader } = this.props
    return (
      <div className="mb-20">
        <div>
          <label>Table header</label>
        </div>
        {
          Object.keys(header).map((key, index) => {
            const value = header[key]

            return (
              <div key={index} className="form-row-item align-items-center">
                <div className="col-md-2 mb-10">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    onChange={event => updateHeader(event.target.value, value, key)}
                    value={key}
                  />
                </div>
                <div className="col-md-8 mb-10">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    onChange={event => updateHeader(key, event.target.value)}
                    value={value}
                  />
                </div>
                <div className="col-md-2 mb-10">
                  <button type="button" className="btn btn-danger btn-sm btn-block" onClick={() => removeHeader(key)}>Remove</button>
                </div>
              </div>
            )
          })
        }
        <div className="mb-10">
          <button type="button" className="btn btn-success btn-sm" onClick={addHeader}>Add header value</button>
        </div>
        <div>
          <small className="text-muted">The data you pick here will be added to the metadata of your converted file.</small>
        </div>
      </div>
    )
  }
}

export default HeaderForm

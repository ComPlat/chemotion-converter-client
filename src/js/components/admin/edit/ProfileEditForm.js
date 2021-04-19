import React, { Component } from "react"
import IdentifierInputBox from '../../IdentifierInputBox'

class ProfileEditForm extends Component {

  constructor(props) {
    super(props)
    this.updateTitle = this.updateTitle.bind(this)
    this.updateDescription = this.updateDescription.bind(this)

  }

  updateTitle(event) {
    let title = event.currentTarget.value
    this.props.updateTitle(title)
  }

  updateDescription(event) {
    let description = event.currentTarget.value
    this.props.updateDescription(description)
  }

  render() {
    return (
      <div>
        <div className="card rounded-0 mt-3">
          <div className="card-header">
            <div>Profile</div>
          </div>
          <div className="card-body">
            <div>
              <label>Title</label>
              <input type="text" className="form-control form-control-sm" onChange={this.updateTitle} value={this.props.title} />
              <small className="text-muted">Please add a title for this profile.</small>
            </div>
            <div className="mt-3">
              <label>Description</label>
              <textarea className="form-control" rows="3" onChange={this.updateDescription} value={this.props.description} />
              <small className="text-muted">Please add a description for this profile.</small>
            </div>
          </div>
        </div>
        <div className="card rounded-0 mt-3">
          <div className="card-header">
            <div>Metadata</div>
          </div>
          <div className="card-body">
            {Object.keys(this.props.header).map((entry, i) => {
              return (
                <div key={i} className="form-row align-items-center">
                  <div className="col-lg-2 mb-2">
                    <input
                      readOnly
                      type="text"
                      className="form-control form-control-sm"
                      value={entry}
                    />
                  </div>
                  <div className="col-lg-10 mb-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={this.props.header[entry]}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="card rounded-0 mt-3">
          <div className="card-header">
            <div>Rules</div>
          </div>
          <div className="card-body">
            <div className="form-row align-items-center">
              <div className="col-lg-2 mb-2">
                <input
                  readOnly
                  type="text"
                  className="form-control form-control-sm"
                  value="x-Values"
                />
              </div>
              <div className="col-lg-4 mb-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={this.props.table.xColumn.tableIndex}
                />
              </div>
              <div className="col-lg-4 mb-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={this.props.table.xColumn.columnIndex}
                />
              </div>
            </div>
            <div className="form-row align-items-center">
              <div className="col-lg-2 mb-2">
                <input
                  readOnly
                  type="text"
                  className="form-control form-control-sm"
                  value="y-Values"
                />
              </div>
              <div className="col-lg-4 mb-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={this.props.table.yColumn.tableIndex}
                />
              </div>
              <div className="col-lg-4 mb-2">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={this.props.table.yColumn.columnIndex}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card rounded-0 mt-3">
          <div className="card-header">
            <div>Identifiers</div>
          </div>
          <div className="card-body">
            <IdentifierInputBox
              status='edit'
              type={'metadata'}
              identifiers={this.props.identifiers}
              addIdentifier={this.addIdentifier}
              updateIdentifiers={this.updateIdentifiers}
              removeIdentifier={this.props.removeIdentifier}
              data={[]}
            />

            <IdentifierInputBox
              status='edit'
              type={'table'}
              identifiers={this.props.identifiers}
              addIdentifier={this.addIdentifier}
              updateIdentifiers={this.updateIdentifiers}
              removeIdentifier={this.props.removeIdentifier}
              data={[]}
            />
          </div>
        </div>


        <div onClick={this.props.updateProfile} className="btn btn-primary btn-block mt-3">Submit</div>
      </div>
    )
  }

}

export default ProfileEditForm
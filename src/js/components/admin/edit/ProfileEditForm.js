import React, { Component } from "react"
import IdentifierInputBox from '../common/IdentifierInputBox'
import HeaderEntry from './HeaderEntry'
import RuleEntry from './RuleEntry'

class ProfileEditForm extends Component {

  constructor(props) {
    super(props)
    this.updateTitle = this.updateTitle.bind(this)
    this.updateDescription = this.updateDescription.bind(this)
    this.updateHeaderValue = this.updateHeaderValue.bind(this)

  }

  updateTitle(event) {
    let title = event.currentTarget.value
    this.props.updateTitle(title)
  }

  updateDescription(event) {
    let description = event.currentTarget.value
    this.props.updateDescription(description)
  }

  updateHeaderValue(key, value) {
    this.props.updateHeaderValue(key, value)
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
                < HeaderEntry
                  key={i}
                  name={entry}
                  value={this.props.header[entry]}
                  updateHeaderValue={this.updateHeaderValue}
                />
              )
            })}
          </div>
        </div>

        <div className="card rounded-0 mt-3">
          <div className="card-header">
            <div>Rules</div>
          </div>
          <div className="card-body">
            <RuleEntry
              name={'xColumn'}
              title={'x-Values'}
              tableIndex={this.props.table.xColumn.tableIndex}
              columnIndex={this.props.table.xColumn.columnIndex}
              updateRule={this.props.updateRule}
            />
            <RuleEntry
              name={'yColumn'}
              title={'y-Values'}
              tableIndex={this.props.table.yColumn.tableIndex}
              columnIndex={this.props.table.yColumn.columnIndex}
              updateRule={this.props.updateRule}
            />
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
              addIdentifier={this.props.addIdentifier}
              updateIdentifiers={this.props.updateIdentifiers}
              removeIdentifier={this.props.removeIdentifier}
              data={[]}
            />

            <IdentifierInputBox
              status='edit'
              type={'table'}
              identifiers={this.props.identifiers}
              addIdentifier={this.props.addIdentifier}
              updateIdentifiers={this.props.updateIdentifiers}
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
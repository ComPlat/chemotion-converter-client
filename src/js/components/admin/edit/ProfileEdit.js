import React, { Component } from "react"

import FirstRowIsHeaderInput from './FirstRowIsHeaderInput'
import HeaderForm from './HeaderForm'
import TableForm from './TableForm'
import IdentifierForm from './IdentifierForm'

class ProfileEdit extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const { id, title, description, tables, updateTitle, updateDescription,
            addTable, updateTable, removeTable, addHeader, updateHeader, removeHeader,
            addOperation, updateOperation, removeOperation,
            addIdentifier, updateIdentifier, removeIdentifier,
            toggleFirstRowIsHeader, updateProfile } = this.props

    return (
      <div>
        <div className="card rounded-0 mt-3">
          <div className="card-header">
            <div>Profile</div>
          </div>
          <div className="card-body">
            <div className="mt-3">
              <label>Title</label>
              <input type="text" className="form-control form-control-sm" onChange={event => updateTitle(event.currentTarget.value)} value={title} />
              <small className="text-muted">Please add a title for this profile.</small>
            </div>
            <div className="mt-3">
              <label>Description</label>
              <textarea className="form-control" rows="3" onChange={event => updateDescription(event.currentTarget.value)} value={description} />
              <small className="text-muted">Please add a description for this profile.</small>
            </div>
            <div className="mt-3">
              <label>Unique ID</label>
              <div><code>{id}</code></div>
              <small className="text-muted">The unique id for this profile.</small>
            </div>
          </div>
        </div>

        {
          tables.map((table, index) => {
            return (
              <React.Fragment key={index}>
                <div className="card rounded-0 mt-3">
                  <div className="card-header">
                    <div className="form-row">
                      <div className="col-lg-11">
                        Table #{index}
                      </div>
                      <div className="col-lg-1">
                        <button type="button" className="btn btn-danger btn-sm btn-block float-right" onClick={removeTable}>Remove</button>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <HeaderForm header={table.header}
                                addHeader={() => addHeader(index)}
                                updateHeader={(key, value, oldKey) => updateHeader(index, key, value, oldKey)}
                                removeHeader={(key) => removeHeader(index, key)} />
                    <TableForm table={table.table}
                               updateTable={(key, value) => updateTable(index, key, value)}
                               addOperation={(key, type) => addOperation(index, key, type)}
                               updateOperation={(key, opIndex, opKey, value) => updateOperation(index, key, opIndex, opKey, value)}
                               removeOperation={(key, opIndex) => removeOperation(index, key, opIndex)} />
                  </div>
                </div>
              </React.Fragment>
            )
          })
        }
        <div className="text-center mt-2">
          <button type="button" className="btn btn-success" onClick={addTable}>Add table</button>
        </div>
        <div className="card rounded-0 mt-3">
          <div className="card-header">
            <div>First row are column names</div>
          </div>
          <div className="card-body">
            {
              this.props.firstRowIsHeader.map((checked, index) => {
                return <FirstRowIsHeaderInput
                  key={index}
                  title={'Table #' + index}
                  checked={checked}
                  index={index}
                  updateFirstRowIsHeader={this.props.updateFirstRowIsHeader}
                />
              })
            }
          </div>
        </div>

        <div className="card rounded-0 mt-3">
          <div className="card-header">
            <div>Identifiers</div>
          </div>
          <div className="card-body">
            <label>Based on file metadata</label>
            <IdentifierForm
              type="fileMetadata"
              identifiers={this.props.identifiers}
              tables={tables}
              addIdentifier={this.props.addIdentifier}
              updateIdentifier={this.props.updateIdentifier}
              removeIdentifier={this.props.removeIdentifier}
            />
            <label>Based on table metadata</label>
            <IdentifierForm
              type="tableMetadata"
              identifiers={this.props.identifiers}
              tables={tables}
              addIdentifier={this.props.addIdentifier}
              updateIdentifier={this.props.updateIdentifier}
              removeIdentifier={this.props.removeIdentifier}
            />
            <label>Based on table headers</label>
            <IdentifierForm
              type="tableHeader"
              identifiers={this.props.identifiers}
              tables={tables}
              addIdentifier={this.props.addIdentifier}
              updateIdentifier={this.props.updateIdentifier}
              removeIdentifier={this.props.removeIdentifier}
            />
          </div>
        </div>
        <div className="text-center mb-5">
          <button onClick={updateProfile} className="btn btn-primary mt-3">Save profile</button>
        </div>
      </div>
    )
  }

}

export default ProfileEdit

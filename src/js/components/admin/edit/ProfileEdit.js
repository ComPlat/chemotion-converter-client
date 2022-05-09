import React, { Component } from "react"

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
            updateProfile } = this.props

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
                    <div className="form-row-item">
                      <div className="col-lg-10">
                        Table #{index}
                      </div>
                      <div className="col-lg-2">
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

        <div className="row">
          <div className="col-lg-6">
            <div className="card rounded-0 mt-3">
              <div className="card-header">
                <div>Identifiers</div>
              </div>
              <div className="card-body">
                {
                  [['Based on file metadata', 'fileMetadata'],
                   ['Based on table metadata', 'tableMetadata'],
                   ['Based on table headers', 'tableHeader']].map(([label, type]) => (
                    <IdentifierForm
                      key={type}
                      label={label}
                      type={type}
                      optional={false}
                      identifiers={this.props.identifiers}
                      tables={tables}
                      addIdentifier={this.props.addIdentifier}
                      updateIdentifier={this.props.updateIdentifier}
                      removeIdentifier={this.props.removeIdentifier}
                    />
                  ))
                }
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card rounded-0 mt-3">
              <div className="card-header">
                <div>Metadata</div>
              </div>
              <div className="card-body">
                {
                  [['Based on file metadata', 'fileMetadata'],
                   ['Based on table metadata', 'tableMetadata'],
                   ['Based on table headers', 'tableHeader']].map(([label, type]) => (
                    <IdentifierForm
                      key={type}
                      label={label}
                      type={type}
                      optional={true}
                      identifiers={this.props.identifiers}
                      tables={tables}
                      addIdentifier={this.props.addIdentifier}
                      updateIdentifier={this.props.updateIdentifier}
                      removeIdentifier={this.props.removeIdentifier}
                    />
                  ))
                }
              </div>
            </div>
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

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
    const { id, title, description, updateTitle, updateDescription, addTable, updateHeader, updateTable, removeTable,
            addIdentifier, updateIdentifier, removeIdentifier, toggleFirstRowIsHeader, updateProfile } = this.props

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
          this.props.tables.map((table, index) => {
            return (
              <React.Fragment key={index}>
                <div className="card rounded-0 mt-3">
                  <div className="card-header">
                    <div className="form-row">
                      <div className="col-lg-10">
                        Table #{index}
                      </div>
                      {
                        // <div className="col-lg-2">
                        //   <button type="button" className="btn btn-danger btn-sm btn-block float-right" onClick={removeTable}>Remove</button>
                        // </div>
                      }
                    </div>
                  </div>
                  <div className="card-body">
                    <HeaderForm header={table.header} onChange={(key, value) => updateHeader(index, key, value)} />
                    <TableForm table={table.table} onChange={(key, value) => updateTable(index, key, value)} />
                  </div>
                </div>
              </React.Fragment>
            )
          })
        }

        {
          // <div className="mt-3">
          //   <button type="button" className="btn btn-success btn-sm" onClick={addTable}>Add table</button>
          // </div>
        }

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
            <label>Based on metadata</label>
            <IdentifierForm
              type="metadata"
              identifiers={this.props.identifiers}
              addIdentifier={this.props.addIdentifier}
              updateIdentifier={this.props.updateIdentifier}
              removeIdentifier={this.props.removeIdentifier}
              data={[]}
            />
            <label>Based on table headers</label>
            <IdentifierForm
              type="table"
              identifiers={this.props.identifiers}
              addIdentifier={this.props.addIdentifier}
              updateIdentifier={this.props.updateIdentifier}
              removeIdentifier={this.props.removeIdentifier}
              data={[]}
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

import React, { Component } from "react"
import ReactDataGrid from "react-data-grid"
import IdentifierInputBox from '../common/IdentifierInputBox'

class ProfileCreate extends Component {

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

  renderTableHeader(table) {
    return (
      <div>
        Header
        <pre>
          {
            table.header.map((line, index) => {
              return <code key={index}>{line}</code>
            })
          }
        </pre>
      </div>
    )
  }

  renderDataGrid(table) {
    const rows = table.rows.map(row => {
      return Object.fromEntries(row.map((value, idx) => {
        return [idx, value]
      }))
    })

    return <ReactDataGrid
      columns={table.columns}
      rowGetter={i => rows[i]}
      rowsCount={rows.length}
      enableCellAutoFocus={false}
      minHeight={400} />
  }

  renderOptions() {
    const { options } = this.props

    return (
      <div>
        {
          Object.keys(options).map((option, index) => {
            return (
              <div key={index} className="form-group">
                <label htmlFor={option} >{option}</label>
                <select className="form-control form-control-sm" onChange={this.props.addOrUpdateOption} id={option}>
                  {
                    options[option].map((select, selectIndex) => {
                      return <option value={select} key={selectIndex}>{select}</option>
                    })
                  }
                </select>
              </div>
            )
          }
        )}
      </div>
    )
  }

  renderColumnsForm() {
    const { columnList } = this.props

    return (
      <div>
        <div className="form-group">
          <label htmlFor="x_column">Which column should be used as x-values?</label>
          <select className="form-control form-control-sm" id="x_column" onChange={this.props.onSelectXcolumn}>
            <option value='default' >-----------</option>
            {columnList.map((column, index) => {
              return <option value={index} key={index}>{column.label}</option>
            })}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="y_column">Which column should be used as y-values?</label>
          <select className="form-control form-control-sm" id="y_column" onChange={this.props.onSelectYcolumn}>
            <option value='default' >-----------</option>
            {columnList.map((column, index) => {
              return <option value={index} key={index}>{column.label}</option>
            })}
          </select>
        </div>
      </div>
    )
  }

  render() {
    return (
      <div className="row">
        <div className="col-md-7 scroll">
          <div className="mb-5">
            <h4>Metadata</h4>
            <div className="pt-3 pb-3 mb-3 border-top border-bottom">
              {Object.keys(this.props.tableData.metadata).map((entry, index) => {
                return <div key={index}>{entry}: {this.props.tableData.metadata[entry]}</div>
              })}
            </div>

            <h4>Tables</h4>
            <ul className="nav nav-tabs" id="Tabs" role="tablist">
              {this.props.tableData.data.map((table, index) => {
                return (
                  <li key={index} className="nav-item" role="presentation">
                    <a className={`nav-link ${index == 0 ? "active" : ""}`} id="table-data-tab" href={'#table-data-' + index}
                      data-toggle="tab" role="tab" aria-controls="profile" aria-selected="false">Table #{index}</a>
                  </li>
                )
              })}
            </ul>

            <div className="tab-content border-bottom pt-3" id="Tabs">
              {this.props.tableData.data.map((table, index) => {
                return (
                  <div key={index} className={`tab-pane fade ${index == 0 ? "active show" : ""}`} id={'table-data-' + index}
                    role="tabpanel" aria-labelledby="table-data-tab">

                    {table.header.length > 0 && this.renderTableHeader(table)}

                    {table.rows.length > 0 &&
                      <div>
                        <div className="form-group form-check">
                          <input type="checkbox" checked={table.firstRowIsHeader || false}
                            onChange={e => this.props.toggleFirstRowIsHeader(index)}
                            className="form-check-input" id="first_row_is_header" />
                          <label className="form-check-label" htmlFor="first_row_is_header">First row are column names</label>
                        </div>

                        {this.renderDataGrid(table)}
                      </div>
                    }
                  </div>
                )
              })
              }
            </div>
          </div>
        </div>
        <div className="col-md-5 scroll">
          <div className="mb-5">

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
                {this.renderOptions()}
                <small className="text-muted">The data you pick here will be added to the metadata of your converted file.</small>
              </div>
            </div>

            <div className="card rounded-0 mt-3">
              <div className="card-header">
                <div>Rules</div>
              </div>
              <div className="card-body">
                {this.renderColumnsForm()}
                <small className="text-muted">The data you pick will determine which table columns are going to converted.</small>
              </div>
            </div>

            <div className="card rounded-0 mt-3">
              <div className="card-header">Identifiers</div>
              <div className="card-body">
                <label>Based on metadata</label>
                <IdentifierInputBox
                  status='create'
                  type={'metadata'}
                  identifiers={this.props.identifiers}
                  addIdentifier={this.props.addIdentifier}
                  updateIdentifiers={this.props.updateIdentifiers}
                  removeIdentifier={this.props.removeIdentifier}
                  data={this.props.tableData.metadata}
                />

                <label>Based on table headers</label>
                <IdentifierInputBox
                  status='create'
                  type={'table'}
                  identifiers={this.props.identifiers}
                  addIdentifier={this.props.addIdentifier}
                  updateIdentifiers={this.props.updateIdentifiers}
                  removeIdentifier={this.props.removeIdentifier}
                  data={this.props.tableData.data}
                />
                <small className="text-muted">The identifiers you create will be used to find the right profile for uploaded files. The 'value' will be compared to the selected file metadata or to the header of a table. If you provide a line number, only this line of the header will be used. If you select 'RexExp', you can enter a regular expression as value, which will be used to match the file. If you fill in the field 'header key', the compared string (or the first group of a given RegExp) will be added to the header of the converted file.</small>
              </div>
            </div>

            <div className="row justify-content-center mt-3">
              <form>
                <button type="submit" className="btn btn-primary" onClick={this.props.onSubmitSelectedData}>Create profile</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    )
  }

}

export default ProfileCreate
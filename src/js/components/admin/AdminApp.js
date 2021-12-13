import React, { Component } from "react"
//import ReactDataGrid from "react-data-grid"

import ConverterApi from '../../api/ConverterApi'
import ProfileList from './list/ProfileList'
import ProfileEditForm from './edit/ProfileEditForm'
import FileUploadForm from './create/FileUploadForm'
import ProfileCreate from './create/ProfileCreate'


class AdminApp extends Component {

  constructor(props) {

    super(props)
    this.state = {
      status: 'list',
      selectedFile: null,
      tableData: null,
      columnList: null,
      error: false,
      isLoading: false,
      errorMessage: '',
      title: '',
      description: '',
      xValues: false,
      yValues: false,
      identifiers: [],
      options: {},
      selectedOptions: {},
      profiles: [],
      currentIndex: -1,
      currentIdentifier: '',
      header: {},
      table: {},
      deleteIdentifier: '',
      deleteIndex: '',
      showAlert: false,
    }

    this.onSelectXcolumn = this.onSelectXcolumn.bind(this)
    this.onSelectYcolumn = this.onSelectYcolumn.bind(this)
    this.toggleFirstRowIsHeader = this.toggleFirstRowIsHeader.bind(this)
    this.onSubmitSelectedData = this.onSubmitSelectedData.bind(this)
    this.onFileChangeHandler = this.onFileChangeHandler.bind(this)
    this.onSubmitFileHandler = this.onSubmitFileHandler.bind(this)
    this.addIdentifier = this.addIdentifier.bind(this)
    this.updateIdentifiers = this.updateIdentifiers.bind(this)
    this.removeIdentifier = this.removeIdentifier.bind(this)
    this.addOrUpdateOption = this.addOrUpdateOption.bind(this)
    this.showUpdateView = this.showUpdateView.bind(this)
    this.deleteProfile = this.deleteProfile.bind(this)
    this.editProfile = this.editProfile.bind(this)
    this.updateTitle = this.updateTitle.bind(this)
    this.updateDescription = this.updateDescription.bind(this)
    this.updateHeaderValue = this.updateHeaderValue.bind(this)
    this.updateFirstRowIsHeaderValue = this.updateFirstRowIsHeaderValue.bind(this)
    this.dispatchView = this.dispatchView.bind(this)
    this.updateProfile = this.updateProfile.bind(this)
    this.submitDeleteProfile = this.submitDeleteProfile.bind(this)
    this.dismissDeleteProfile = this.dismissDeleteProfile.bind(this)
    this.getTitleforStatus = this.getTitleforStatus.bind(this)
    this.updateRule = this.updateRule.bind(this)
  }

  componentDidMount() {
    ConverterApi.fetchProfiles()
      .then(profiles => {
        this.setState({
          profiles: profiles
        })
      })
  }

  componentDidUpdate() {
    setTimeout(() => this.setState({ showAlert: false }), 6000);
  }

  editProfile(index, identifier) {
    let currentProfile = this.state.profiles[index]
    this.setState({
      status: 'edit',
      currentIndex: index,
      currentIdentifier: identifier,
      id: currentProfile.id,
      title: currentProfile.title,
      description: currentProfile.description,
      identifiers: currentProfile.identifiers,
      header: currentProfile.header,
      table: currentProfile.table
    })
  }

  updateProfile() {
    const { title, description, identifiers, header, table } = this.state
    let data = {
      title: title,
      description: description,
      identifiers: identifiers,
      header: header,
      table: table
    }
    ConverterApi.updateProfile(data, this.state.currentIdentifier)
      .then((data) => {
        let newProfiles = [...this.state.profiles]
        newProfiles[this.state.currentIndex] = data
        this.setState({
          profiles: newProfiles,
          status: 'list',
          title: '',
          description: '',
          identifiers: [],
          header: {},
          table: {},
          currentIndex: -1,
          currentIdentifier: '',
          showAlert: true
        })
      })
  }

  deleteProfile(index, identifier) {
    $('#delete-modal').show()
    this.setState({
      deleteIdentifier: identifier,
      deleteIndex: index
    })
  }

  submitDeleteProfile() {
    ConverterApi.deleteProfile(this.state.deleteIdentifier)
      .then(() => {
        let newProfiles = [...this.state.profiles]
        if (this.state.deleteIndex !== -1) {
          newProfiles.splice(this.state.deleteIndex, 1)
          this.setState({
            profiles: newProfiles,
            deleteIdentifier: '',
            deleteIndex: ''
          })
          $('#delete-modal').hide()
        }
      }
      )
  }

  dismissDeleteProfile() {
    $('#delete-modal').hide()
    this.setState({
      deleteIdentifier: '',
      deleteIndex: ''
    })
  }

  updateTitle(title) {
    this.setState({
      title: title
    })
  }

  updateDescription(description) {
    this.setState({
      description: description
    })
  }

  updateHeaderValue(key, value) {
    let newHeader = { ...this.state.header}
    newHeader[key] = value
    this.setState({
      header: newHeader
    })
  }

  updateFirstRowIsHeaderValue(index, checked) {
    let newTable = { ...this.state.table }
    newTable['firstRowIsHeader'][index]=checked
    this.setState({
      table: newTable
    })
  }

  updateRule(key, tableIndex, columnIndex) {
    let newTable = { ...this.state.table }
    newTable[key] = {
      tableIndex: tableIndex,
      columnIndex: columnIndex
    }
    this.setState({
      table: newTable
    })
  }

  addOrUpdateOption(event) {
    let key = event.target.getAttribute('id')
    let value = event.target.value
    let newSelectedOptions = { ...this.state.selectedOptions }
    newSelectedOptions[key] = value
    this.setState({
      selectedOptions: newSelectedOptions
    })
  }

  showUpdateView() {
    this.setState({
      status: 'create'
    })
  }

  addIdentifier(type) {
    let metadataKey = ''
    let value = ''

    if (type === 'metadata' && this.state.status == 'create') {
      metadataKey = Object.keys(this.state.tableData.metadata)[0]
      value = this.state.tableData.metadata[metadataKey]
    }

    let identifier = {
      type: type,
      tableIndex: 0,
      lineNumber: '',
      metadataKey: metadataKey,
      headerKey: '',
      value: value,
      isRegex: false
    }
    let identifiers = this.state.identifiers
    identifiers.push(identifier)
    this.setState({
      identifiers: identifiers
    })
  }

  updateIdentifiers(index, data) {
    let newIdentifiers = [...this.state.identifiers]
    if (index !== -1) {
      let newData = newIdentifiers[index]
      Object.assign(newData, data)
      newIdentifiers[index] = newData
      this.setState({ identifiers: newIdentifiers })
    }
  }

  removeIdentifier(index) {
    let newIdentifiers = [...this.state.identifiers]
    if (index !== -1) {
      newIdentifiers.splice(index, 1)
      this.setState({ identifiers: newIdentifiers })
    }
  }

  onSelectXcolumn(event) {
    let value = event.target.value
    if (value === 'default') {
      this.setState({ xValues: false })
    } else {
      this.setState({ xValues: value })
    }
  }

  onSelectYcolumn(event) {
    let value = event.target.value
    if (value === 'default') {
      this.setState({ yValues: false })
    } else {
      this.setState({ yValues: value })
    }
  }

  toggleFirstRowIsHeader(index) {
    const { tableData } = this.state
    const table = tableData.data[index]

    if (table.firstRowIsHeader) {
      table.firstRowIsHeader = false
      table.columns = table._columns
      table.rows.splice(0, 0, table._first)
      table._columns = null
      table._first = null
    } else {
      table.firstRowIsHeader = true
      table._columns = table.columns
      table._first = table.rows.shift()
      table.columns = table._first.map((value, idx) => {
        const originalName = table._columns[idx].name

        return {
          key: idx.toString(),
          name: value + ` (${originalName})`
        }
      })
    }

    this.setState({ tableData });
  }

  onSubmitSelectedData(event) {
    event.preventDefault()

    const { title, description, tableData, columnList, identifiers, xValues, yValues, selectedOptions } = this.state

    let xv = false
    if (xValues) {
      xv = columnList[xValues].value
    }

    let yv = false
    if (yValues) {
      yv = columnList[yValues].value
    }

    const data = {
      table: {
        xColumn: xv,
        yColumn: yv,
        firstRowIsHeader: tableData.data.map(table => {
          return table.firstRowIsHeader || false
        })
      },
      identifiers: identifiers,
      header: selectedOptions,
      title: title,
      description: description
    }

    ConverterApi.createProfile(data)
      .then(data => {
        $('#modal').show()
      })
      .catch(error => {
        return {
          errors: {
            path: 'File not found'
          }
        }
      })
  }

  onFileChangeHandler(event) {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
      isLoading: false,
      error: false,
      errorMessage: ''
    })
  }

  onSubmitFileHandler() {
    const { selectedFile } = this.state

    this.setState({
      isLoading: true
    })

    ConverterApi.fetchTables(selectedFile)
      .then(tableData => {
        if (tableData) {
          // create a flat list of all columns
          const columnList = tableData.data.reduce((accumulator, table, tableIndex) => {
            const tableColumns = table.columns.map((tableColumn, columnIndex) => {
              return Object.assign({}, tableColumn, {
                label: `Table #${tableIndex} Column #${columnIndex}`,
                value: {
                  tableIndex: tableIndex,
                  columnIndex: columnIndex
                }
              })
            })
            return accumulator.concat(tableColumns)
          }, [])

          const selectedOptions = {}
          for (let key in tableData.options) {
            selectedOptions[key] = tableData.options[key][0]
          }

          this.setState({
            selectedFile: null,
            isLoading: false,
            tableData: tableData,
            columnList: columnList,
            options: tableData.options,
            selectedOptions: selectedOptions,
            showSuccessMessage: true,
            error: false,
            errorMessage: ''
          })
        }
      })
      .catch(error => {
        if (error.status === 413) {
          this.setState({
            error: true,
            errorMessage: 'The uploaded file is too large.',
            isLoading: false
          })
        } else {
          error.text().then(errorMessage => {
            this.setState({
              error: true,
              errorMessage: JSON.parse(errorMessage).error,
              isLoading: false
            })
          })
        }
      })
  }

  dispatchView() {
    const { tableData, status } = this.state
    if (status === 'list') {
      return (
        <ProfileList
        profiles={this.state.profiles}
        editProfile={this.editProfile}
        deleteProfile={this.deleteProfile}
      />
      )
    } else if (status == 'edit') {
      return (
        <ProfileEditForm
          id={this.state.id}
          title={this.state.title}
          description={this.state.description}
          header={this.state.header}
          table={this.state.table}
          identifiers={this.state.identifiers}
          updateIdentifiers={this.updateIdentifiers}
          addIdentifier={this.addIdentifier}
          updateTitle={this.updateTitle}
          updateDescription={this.updateDescription}
          updateHeaderValue={this.updateHeaderValue}
          updateFirstRowIsHeaderValue={this.updateFirstRowIsHeaderValue}
          updateRule={this.updateRule}
          updateProfile={this.updateProfile}
          removeIdentifier={this.removeIdentifier}
        />
      )
    } else if (status == 'create') {
      if (tableData) {
        return(
          <ProfileCreate
            tableData={this.state.tableData}
            title={this.state.title}
            description={this.state.description}
            options={this.state.options}
            columnList={this.state.columnList}
            identifiers={this.state.identifiers}
            updateTitle={this.updateTitle}
            updateDescription={this.updateDescription}
            removeIdentifier={this.removeIdentifier}
            addIdentifier={this.addIdentifier}
            onSubmitSelectedData={this.onSubmitSelectedData}
            updateIdentifiers={this.updateIdentifiers}
            addOrUpdateOption={this.addOrUpdateOption}
            toggleFirstRowIsHeader={this.toggleFirstRowIsHeader}
            onSelectXcolumn={this.onSelectXcolumn}
            onSelectYcolumn={this.onSelectYcolumn}
          />
        )
      } else {
        return (
          <FileUploadForm
            onFileChangeHandler={this.onFileChangeHandler}
            onSubmitFileHandler={this.onSubmitFileHandler}
            errorMessage={this.state.errorMessage}
            error={this.state.error}
            isLoading={this.state.isLoading}
          />
        )
      }
    }
  }

  getTitleforStatus() {
    if (this.state.status == 'list') {
      return 'Profiles List'
    } else if (this.state.status == 'edit') {
      return 'Update Profile'
    } else {
      return 'Create Profile'
    }
  }

  render() {
    return (
      <div className={this.state.tableData ? 'container-fluid' : 'container'}>
        <header>
          <nav aria-label="breadcrumb">
            {this.state.status == 'list' &&
              <ol className="breadcrumb">
                <li className="breadcrumb-item active" aria-current="page">Chemotion file converter admin</li>
              </ol>
            }
            {this.state.status == 'edit' &&
              <ol className="breadcrumb">
                <li className="breadcrumb-item" aria-current="page"><a href="">Chemotion file converter admin</a></li>
                <li className="breadcrumb-item active" aria-current="page">{'Edit Profile: ' + this.state.title}</li>
              </ol>
            }
            {this.state.status == 'create' &&
              <ol className="breadcrumb">
                <li className="breadcrumb-item" aria-current="page"><a href="">Chemotion file converter admin</a></li>
                <li className="breadcrumb-item active" aria-current="page">{'Create Profile'}</li>
              </ol>
            }
          </nav>

          <div className="mt-auto">
            {this.state.status == "list" &&
              <div className="float-right">
                <button type="button" onClick={this.showUpdateView} className="btn btn-primary">Create new profile</button>
              </div>
            }

            <h2 className="mb-0">{this.getTitleforStatus()}</h2>
          </div>
        </header>

        <main>
          {this.dispatchView()}
        </main>

        <div className="modal modal-backdrop" data-backdrop="static" id="modal" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-body">
                <div className="alert alert-success" role="alert">Profile successfully created!</div>
              </div>
              <div className="modal-footer">
                <a href="." className="btn btn-secondary">Back to profiles list</a>
                <a href="/" className="btn btn-primary">Upload file and use profile</a>
              </div>
            </div>
          </div>
        </div>

        <div className="modal modal-backdrop" data-backdrop="static" id="delete-modal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Do you really want to delete this profile?</h5>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-danger" onClick={this.submitDeleteProfile}>Delete profile</button>
                <button type="button" className="btn btn-secondary" onClick={this.dismissDeleteProfile} data-bs-dismiss="modal">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

}

export default AdminApp
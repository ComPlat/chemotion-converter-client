import React, { Component } from "react"

import ConverterApi from '../../api/ConverterApi'

import ProfileList from './list/ProfileList'
import ProfileEdit from './edit/ProfileEdit'
import ProfileCreate from './create/ProfileCreate'
import FileUploadForm from './common/FileUploadForm'


class AdminApp extends Component {

  constructor(props) {

    super(props)
    this.state = {
      status: 'list',
      selectedFile: null,
      profiles: [],
      datasets:[],
      tableData: null,
      columnList: null,
      headerOptions: [],
      error: false,
      isLoading: false,
      errorMessage: '',
      title: '',
      description: '',
      ols: '',
      tables: [],
      identifiers: [],
      currentIdentifier: '',
      currentIndex: -1,
      deleteIdentifier: '',
      deleteIndex: -1,
      showAlert: false,
    }

    this.showUpdateView = this.showUpdateView.bind(this)
    this.showImportView = this.showImportView.bind(this)
    this.showEditView = this.showEditView.bind(this)
    this.showDeleteModal = this.showDeleteModal.bind(this)
    this.hideDeleteModal = this.hideDeleteModal.bind(this)

    this.updateTitle = this.updateTitle.bind(this)
    this.updateDescription = this.updateDescription.bind(this)
    this.updateOls = this.updateOls.bind(this)

    this.addTable = this.addTable.bind(this)
    this.updateTable = this.updateTable.bind(this)
    this.removeTable = this.removeTable.bind(this)
    this.addHeader = this.addHeader.bind(this)
    this.updateHeader = this.updateHeader.bind(this)
    this.removeHeader = this.removeHeader.bind(this)
    this.addOperation = this.addOperation.bind(this)
    this.updateOperation = this.updateOperation.bind(this)
    this.removeOperation = this.removeOperation.bind(this)

    this.addIdentifier = this.addIdentifier.bind(this)
    this.updateIdentifier = this.updateIdentifier.bind(this)
    this.removeIdentifier = this.removeIdentifier.bind(this)

    this.createProfile = this.createProfile.bind(this)
    this.updateProfile = this.updateProfile.bind(this)
    this.deleteProfile = this.deleteProfile.bind(this)
    this.downloadProfile = this.downloadProfile.bind(this)
    this.updateFile = this.updateFile.bind(this)
    this.uploadFile = this.uploadFile.bind(this)
    this.importFile = this.importFile.bind(this)

    this.dispatchView = this.dispatchView.bind(this)
    this.getTitleforStatus = this.getTitleforStatus.bind(this)
  }

  componentDidMount() {
    ConverterApi.fetchProfiles()
      .then(profiles => {
        this.setState({
          profiles: profiles
        })
      })

      ConverterApi.fetchDatasets()
      .then(datasets => {
        this.setState({
          datasets: datasets
        })
      })
  }

  componentDidUpdate() {
    // setTimeout(() => this.setState({ showAlert: false }), 6000);
  }

  showImportView() {
    this.setState({
      status: 'import'
    })
  }

  showUpdateView() {
    this.setState({
      status: 'create'
    })
  }

  showEditView(index, identifier) {
    let currentProfile = this.state.profiles[index]
    this.setState({
      status: 'edit',
      currentIdentifier: identifier,
      currentIndex: index,
      id: currentProfile.id,
      title: currentProfile.title,
      description: currentProfile.description,
      ols: currentProfile.ols,
      identifiers: currentProfile.identifiers,
      header: currentProfile.header,
      tables: currentProfile.tables,
    })
  }

  showDeleteModal(index, identifier) {
    $('#delete-modal').show()
    this.setState({
      deleteIdentifier: identifier,
      deleteIndex: index
    })
  }

  hideDeleteModal() {
    $('#delete-modal').hide()
    this.setState({
      deleteIdentifier: '',
      deleteIndex: -1
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

  updateOls(ols) {
    console.log(ols);
    this.setState({
      ols: ols
    })
  }

  addTable() {
    const { tables, tableData } = this.state
    tables.push(this.initTable(tableData))
    this.setState({ tables })
  }

  initTable(tableData) {
    const header = {}
    if (tableData) {
      for (let key in tableData.options) {
        header[key] = tableData.options[key][0]
      }
    }

    return {
      header: header,
      table: {}
    }
  }

  updateTable(index, key, value) {
    const tables = [...this.state.tables]
    if (index !== -1) {
      tables[index].table[key] = value

      // remove the column if tableIndex and columnIndex is null
      if (Object.values(tables[index].table[key]).every(value => (value === null || isNaN(value)))) {
        delete tables[index].table[key]
      }

      this.setState({ tables })
    }
  }

  removeTable(index) {
    const tables = [...this.state.tables]
    tables.splice(index, 1)
    this.setState({ tables })
  }

  addHeader(index) {
    const tables = [...this.state.tables]
    if (index !== -1) {
      const key = 'HEADER' + Object.keys(tables[index].header).length
      tables[index].header[key] = ''
    }
    this.setState({ tables })
  }

  updateHeader(index, key, value, oldKey) {
    const tables = [...this.state.tables]
    if (index !== -1) {
      if (oldKey === undefined) {
        tables[index].header[key] = value
      } else {
        // create a new header to preserve the order
        tables[index].header = Object.keys(tables[index].header).reduce((agg, cur) => {
          if (cur == oldKey) {
            agg[key] = value
          } else {
            agg[cur] = tables[index].header[cur]
          }
          return agg
        }, {})
      }
      this.setState({ tables })
    }
  }

  removeHeader(index, key) {
    const tables = [...this.state.tables]
    delete tables[index].header[key]
    this.setState({ tables })
  }

  addOperation(index, key, type) {
    const tables = [...this.state.tables]
    if (index !== -1) {
      const operation = {
        type: type,
        operator: '+'
      }
      if (type == 'column') {
        operation['column'] = {
          tableIndex: null,
          columnIndex: null
        }
      }

      if (tables[index].table[key] === undefined) {
        tables[index].table[key] = []
      }
      tables[index].table[key].push(operation)
      this.setState({ tables })
    }
  }

  updateOperation(index, key, opIndex, opKey, value) {
    const tables = [...this.state.tables]
    if (index !== -1) {
      tables[index].table[key][opIndex][opKey] = value
      this.setState({ tables })
    }
  }

  removeOperation(index, key, opIndex) {
    const tables = [...this.state.tables]
    if (index !== -1) {
      tables[index].table[key].splice(opIndex, 1)

      // remove operations if it is empty
      if (tables[index].table[key].length == 0) {
        delete tables[index].table[key]
      }

      this.setState({ tables })
    }
  }

  addIdentifier(type, optional) {
    const { identifiers, tableData } = this.state

    const identifier = {
      type: type,
      optional: optional,
      isRegex: false,
    }

    if (this.state.status == 'create') {
      if (type === 'fileMetadata') {
        identifier['key'] = Object.keys(tableData.metadata)[0]
        identifier['value'] = tableData.metadata[identifier['key']]
      } else if (type === 'tableMetadata') {
        identifier['tableIndex'] = 0
        if (tableData.tables.length > 0 && tableData.tables[0].metadata !== undefined) {
          identifier['key'] = Object.keys(tableData.tables[0].metadata)[0]
          identifier['value'] = tableData.tables[0].metadata[identifier['key']]
        } else {
          identifier['key'] = ''
          identifier['value'] = ''
        }
      } else if (type === 'tableHeader') {
        identifier['tableIndex'] = 0
        identifier['lineNumber'] = ''
        identifier['value'] = ''
      }
    } else {
      if (type === 'fileMetadata') {
        identifier['key'] = ''
        identifier['value'] = ''
      } else if (type === 'tableMetadata') {
        identifier['tableIndex'] = 0
        identifier['key'] = ''
        identifier['value'] = ''
      } else if (type === 'tableHeader') {
        identifier['tableIndex'] = 0
        identifier['lineNumber'] = ''
        identifier['value'] = ''
      }
    }

    if (optional) {
      identifier['outputTableIndex'] = null
      identifier['outputLayer'] = ''
      identifier['outputKey'] = ''
    }

    identifiers.push(identifier)
    this.setState({ identifiers })
  }

  updateIdentifier(index, data) {
    const identifiers = [...this.state.identifiers]
    if (index !== -1) {
      const identifier = identifiers[index]
      Object.assign(identifier, data)
      identifiers[index] = identifier
      this.setState({ identifiers })
    }
  }

  removeIdentifier(index) {
    let identifiers = [...this.state.identifiers]
    if (index !== -1) {
      identifiers.splice(index, 1)
      this.setState({ identifiers })
    }
  }

  createProfile(event) {
    event.preventDefault()

    const { title, description, ols, tables, identifiers, tableData } = this.state
    const profile = {
      title,
      description,
      ols,
      tables,
      identifiers
    }

    ConverterApi.createProfile(profile)
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

  updateProfile() {
    const { id, title, description, tables, identifiers, tableData } = this.state
    const profile = {
      id,
      title,
      description,
      tables,
      identifiers
    }

    ConverterApi.updateProfile(profile, this.state.currentIdentifier)
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
          currentIdentifier: '',
          currentIndex: -1,
          showAlert: true
        })
      })
  }

  deleteProfile() {
    ConverterApi.deleteProfile(this.state.deleteIdentifier)
      .then(() => {
        let newProfiles = [...this.state.profiles]
        if (this.state.deleteIndex !== -1) {
          newProfiles.splice(this.state.deleteIndex, 1)
          this.setState({
            profiles: newProfiles,
            deleteIdentifier: '',
            deleteIndex: -1
          })
          $('#delete-modal').hide()
        }
      }
    )
  }

  downloadProfile(index, identifier) {
    const a = document.createElement('a')
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.state.profiles[index], null, 2))
    a.download = identifier + '.json'
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  updateFile(event) {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
      isLoading: false,
      error: false,
      errorMessage: ''
    })
  }

  uploadFile() {
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
                label: `Input table #${tableIndex} Column #${columnIndex}`,
                value: {
                  tableIndex: tableIndex,
                  columnIndex: columnIndex
                }
              })
            })
            return accumulator.concat(tableColumns)
          }, [])

          this.setState({
            selectedFile: null,
            isLoading: false,
            tableData: tableData,
            columnList: columnList,
            headerOptions: tableData.options,
            tables: [this.initTable(tableData)],
            identifiers: [],
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

  importFile() {
    const { selectedFile } = this.state

    this.setState({
      isLoading: true
    })

    const createProfile = e => {
      const profile = JSON.parse(e.target.result)

      ConverterApi.createProfile(profile)
        .then(data => {
          $('#modal').show()
          this.setState({
            selectedFile: null,
            isLoading: false,
            error: false,
            errorMessage: ''
          })
        })
        .catch(errors => {
          this.setState({
            error: true,
            errorMessage: Object.values(errors).join(', '),
            isLoading: false
          })
        })
    }

    const reader = new FileReader()
    reader.readAsText(selectedFile)
    reader.onload = createProfile.bind(this)
  }

  dispatchView() {
    const { tableData, status, error, errorMessage, isLoading, selectedFile } = this.state

    if (status === 'list') {
      return (
        <ProfileList
          profiles={this.state.profiles}
          editProfile={this.showEditView}
          deleteProfile={this.showDeleteModal}
          downloadProfile={this.downloadProfile}
        />
      )
    } else if (status == 'edit') {
      return (
        <ProfileEdit
          id={this.state.id}
          title={this.state.title}
          description={this.state.description}
          tables={this.state.tables}
          identifiers={this.state.identifiers}
          updateTitle={this.updateTitle}
          updateDescription={this.updateDescription}
          addTable={this.addTable}
          updateTable={this.updateTable}
          removeTable={this.removeTable}
          addHeader={this.addHeader}
          updateHeader={this.updateHeader}
          removeHeader={this.removeHeader}
          addOperation={this.addOperation}
          updateOperation={this.updateOperation}
          removeOperation={this.removeOperation}
          addIdentifier={this.addIdentifier}
          updateIdentifier={this.updateIdentifier}
          removeIdentifier={this.removeIdentifier}
          updateProfile={this.updateProfile}
        />
      )
    } else if (status == 'import') {
      return (
        <FileUploadForm
          onFileChangeHandler={this.updateFile}
          onSubmitFileHandler={this.importFile}
          errorMessage={errorMessage}
          error={error}
          isLoading={isLoading}
          disabled={selectedFile === null}
        />
      )
    } else if (status == 'create') {
      if (tableData) {
        return (
          <ProfileCreate
            tableData={this.state.tableData}
            columnList={this.state.columnList}
            headerOptions={this.state.headerOptions}
            title={this.state.title}
            datasets={this.state.datasets}
            description={this.state.description}
            ols={this.state.ols}
            identifiers={this.state.identifiers}
            tables={this.state.tables}
            updateTitle={this.updateTitle}
            updateDescription={this.updateDescription}
            updateOls={this.updateOls}
            addTable={this.addTable}
            updateTable={this.updateTable}
            removeTable={this.removeTable}
            updateHeader={this.updateHeader}
            addOperation={this.addOperation}
            updateOperation={this.updateOperation}
            removeOperation={this.removeOperation}
            addIdentifier={this.addIdentifier}
            updateIdentifier={this.updateIdentifier}
            removeIdentifier={this.removeIdentifier}
            createProfile={this.createProfile}
          />
        )
      } else {
        return (
          <FileUploadForm
            onFileChangeHandler={this.updateFile}
            onSubmitFileHandler={this.uploadFile}
            errorMessage={errorMessage}
            error={error}
            isLoading={isLoading}
            disabled={selectedFile === null}
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
    } else if (this.state.status == 'import') {
      return 'Import Profile'
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
            {this.state.status == 'import' &&
              <ol className="breadcrumb">
                <li className="breadcrumb-item" aria-current="page"><a href="">Chemotion file converter admin</a></li>
                <li className="breadcrumb-item active" aria-current="page">{'Import Profile'}</li>
              </ol>
            }
          </nav>

          <div>
            {this.state.status == "list" &&
              <div className="pull-right">
                <button type="button" onClick={this.showImportView} className="btn btn-success mr-10">Import profile</button>
                <button type="button" onClick={this.showUpdateView} className="btn btn-primary">Create new profile</button>
              </div>
            }

            <h2>{this.getTitleforStatus()}</h2>
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
                <button type="button" className="btn btn-danger" onClick={this.deleteProfile}>Delete profile</button>
                <button type="button" className="btn btn-secondary" onClick={this.hideDeleteModal} data-bs-dismiss="modal">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

}

export default AdminApp
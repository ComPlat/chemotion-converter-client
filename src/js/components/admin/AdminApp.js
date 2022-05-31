import React, { Component } from "react"

import ConverterApi from '../../api/ConverterApi'

import ProfileList from './list/ProfileList'
import ProfileForm from './form/ProfileForm'
import FileUploadForm from './upload/FileUploadForm'


class AdminApp extends Component {

  constructor(props) {
    super(props)
    this.state = {
      status: 'list',
      selectedFile: null,
      profiles: [],
      options: [],
      datasets: [],
      profile: null,
      error: false,
      errorMessage: '',
      isLoading: false,
      showAlert: false
    }

    this.showCreateView = this.showCreateView.bind(this)
    this.showUpdateView = this.showUpdateView.bind(this)
    this.showImportView = this.showImportView.bind(this)

    this.showDeleteModal = this.showDeleteModal.bind(this)
    this.hideDeleteModal = this.hideDeleteModal.bind(this)

    this.updateProfile = this.updateProfile.bind(this)
    this.storeProfile = this.storeProfile.bind(this)
    this.deleteProfile = this.deleteProfile.bind(this)
    this.downloadProfile = this.downloadProfile.bind(this)

    this.updateFile = this.updateFile.bind(this)
    this.uploadFile = this.uploadFile.bind(this)
    this.importFile = this.importFile.bind(this)

    this.dispatchView = this.dispatchView.bind(this)
  }

  componentDidMount() {
    Promise.all([
      ConverterApi.fetchProfiles(),
      ConverterApi.fetchDatasets(),
      ConverterApi.fetchOptions()
    ]).then(responses => {
      const [profiles, datasets, options] = responses
      this.setState({
        profiles, datasets, options
      })
    })
  }

  showImportView() {
    this.setState({
      status: 'import',
      profile: null
    })
  }

  showCreateView() {
    this.setState({
      status: 'upload',
      profile: null
    })
  }

  showUpdateView(profile) {
    this.setState({
      status: 'update',
      profile: Object.assign({}, profile),
      error: false,
      errorMessage: ''
    })
  }

  showDeleteModal(profile) {
    $('#delete-modal').show()
    this.setState({
      profile: Object.assign({}, profile),
    })
  }

  hideDeleteModal() {
    $('#delete-modal').hide()
    this.setState({
      profile: null
    })
  }

  updateProfile(profile) {
    this.setState({ profile })
  }

  storeProfile() {
    const { status } = this.state
    if (status == 'create') {
      ConverterApi.createProfile(this.state.profile)
        .then(profile => {
          const profiles = [...this.state.profiles]
          profiles.push(profile)
          this.setState({
            status: 'list',
            profiles: profiles,
            profile: null
          })
          $('#modal').show()
        })
    } else if (status == 'update') {
      ConverterApi.updateProfile(this.state.profile)
        .then((profile) => {
          const profiles = [...this.state.profiles]
          const index = profiles.findIndex(p => (p.id == profile.id))
          profiles[index] = profile
          this.setState({
            status: 'list',
            profiles: profiles,
            profile: null
          })
        })
    }
  }

  deleteProfile() {
    ConverterApi.deleteProfile(this.state.profile)
      .then(() => {
        const profiles = [...this.state.profiles]
        const index = profiles.findIndex(p => (p.id == this.state.profile.id))
        profiles.splice(index, 1)
        this.setState({
          status: 'list',
          profiles: profiles,
          profile: null
        })
        $('#delete-modal').hide()
      }
    )
  }

  downloadProfile(profile) {
    const a = document.createElement('a')
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2))
    a.download = profile.id + '.json'
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
      .then(data => {
        if (data) {
          const profile = {
            title: '',
            description: '',
            tables: [],
            identifiers: [],
            data: data,
          }

          this.setState({
            status: 'create',
            profile: profile,
            selectedFile: null,
            isLoading: false,
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
      const fileProfile = JSON.parse(e.target.result)

      ConverterApi.createProfile(fileProfile)
        .then(profile => {
          const profiles = [...this.state.profiles]
          profiles.push(profile)
          this.setState({
            status: 'list',
            profiles: profiles,
            profile: null
          })
          $('#modal').show()
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
    if (this.state.status === 'list') {
      return (
        <ProfileList
          profiles={this.state.profiles}
          updateProfile={this.showUpdateView}
          deleteProfile={this.showDeleteModal}
          downloadProfile={this.downloadProfile}
        />
      )
    } else if (this.state.status == 'import') {
      return (
        <FileUploadForm
          onFileChangeHandler={this.updateFile}
          onSubmitFileHandler={this.importFile}
          errorMessage={this.state.errorMessage}
          error={this.state.error}
          isLoading={this.state.isLoading}
          disabled={this.state.selectedFile === null}
        />
      )
    } else if (this.state.status == 'upload') {
      return (
          <FileUploadForm
            onFileChangeHandler={this.updateFile}
            onSubmitFileHandler={this.uploadFile}
            errorMessage={this.state.errorMessage}
            error={this.state.error}
            isLoading={this.state.isLoading}
            disabled={this.state.selectedFile === null}
          />
        )
    } else {
      return (
        <ProfileForm
          status={this.state.status}
          profile={this.state.profile}
          options={this.state.options}
          datasets={this.state.datasets}
          updateProfile={this.updateProfile}
          storeProfile={this.storeProfile}
        />
      )
    }
  }

  render() {
    return (
      <div className={['create', 'update'].includes(this.state.status) ? 'container-fluid' : 'container'}>
        <header>
          <nav aria-label="breadcrumb">
            {this.state.status == 'list' &&
              <ol className="breadcrumb">
                <li className="breadcrumb-item active" aria-current="page">Chemotion file converter admin</li>
              </ol>
            }
            {['upload', 'create'].includes(this.state.status) &&
              <ol className="breadcrumb">
                <li className="breadcrumb-item" aria-current="page"><a href="">Chemotion file converter admin</a></li>
                <li className="breadcrumb-item active" aria-current="page">{'Create Profile'}</li>
              </ol>
            }
            {this.state.status == 'update' &&
              <ol className="breadcrumb">
                <li className="breadcrumb-item" aria-current="page"><a href="">Chemotion file converter admin</a></li>
                <li className="breadcrumb-item active" aria-current="page">{'Edit Profile: ' + this.state.title}</li>
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
                <button type="button" onClick={this.showImportView} className="btn btn-success mr-10">
                  Import profile
                </button>
                <button type="button" onClick={this.showCreateView} className="btn btn-primary">
                  Create new profile
                </button>
              </div>
            }

            <h2>
              {this.state.status == 'list' && 'Profiles List'}
              {['upload', 'create'].includes(this.state.status) && 'Create Profile'}
              {this.state.status == 'update' && 'Edit Profile'}
              {this.state.status == 'import' && 'Import Profile'}
            </h2>
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
                <button type="button" className="btn btn-secondary" onClick={e => $('#modal').hide()} data-bs-dismiss="modal">Back to profiles list</button>
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
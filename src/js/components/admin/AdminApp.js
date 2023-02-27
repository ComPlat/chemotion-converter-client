import React, {Component} from "react"
import {Modal, Button} from 'react-bootstrap';

import ConverterApi from '../../api/ConverterApi'

import ProfileList from './list/ProfileList'
import ReaderList from './list/ReaderList'
import ProfileForm from './form/ProfileForm'
import FileUploadForm from './upload/FileUploadForm'
import ReaderForm from "./form/ReaderForm";


class AdminApp extends Component {

    constructor(props) {
        super(props)
        this.state = {
            status: 'list',
            newReaderName: '',
            selectedFile: null,
            profiles: [],
            readers: [],
            options: [],
            datasets: [],
            profile: null,
            reader: null,
            error: false,
            errorMessage: '',
            isLoading: false,
            createdModal: false,
            deleteModal: false
        }

        this.newReaderName = ""

        this.showCreateView = this.showCreateView.bind(this)
        this.showUpdateView = this.showUpdateView.bind(this)
        this.showImportView = this.showImportView.bind(this)
        this.showInfoView = this.showInfoView.bind(this)

        this.showCreatedModal = this.showCreatedModal.bind(this)
        this.hideCreatedModal = this.hideCreatedModal.bind(this)

        this.showDeleteModal = this.showDeleteModal.bind(this)
        this.hideDeleteModal = this.hideDeleteModal.bind(this)

        this.showReaderDeleteModal = this.showReaderDeleteModal.bind(this)
        this.showReaderUpdateView = this.showReaderUpdateView.bind(this)
        this.createReader = this.createReader.bind(this)
        this.updateReader = this.updateReader.bind(this)
        this.storeReader = this.storeReader.bind(this)

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
        Promise.all([ConverterApi.fetchProfiles(), ConverterApi.fetchReader(), ConverterApi.fetchDatasets(), ConverterApi.fetchOptions()]).then(responses => {
            const [profiles, readers, datasets, options] = responses
            this.setState({
                profiles, readers, datasets, options
            })
        })
    }

    showImportView() {
        this.setState({
            status: 'import', profile: null
        })
    }

    showCreateView() {
        this.setState({
            status: 'upload', profile: null
        })
    }


    showInfoView() {
        this.setState({
            status: 'infoText', profile: null
        })
    }

    showUpdateView(profile) {
        this.setState({
            status: 'update', profile: Object.assign({}, profile), error: false, errorMessage: ''
        })
    }

    showReaderUpdateView(reader) {
        this.setState({
            status: 'updateReader', reader: Object.assign({}, reader), error: false, errorMessage: ''
        })
    }

    showCreatedModal() {
        this.setState({
            createdModal: true
        })
    }

    hideCreatedModal() {
        this.setState({
            createdModal: false
        })
    }

    showReaderDeleteModal(profile) {
        this.setState({
            deleteModal: true, profile: null, reader: Object.assign({}, profile),
        })
    }

    showDeleteModal(profile) {
        this.setState({
            deleteModal: true, reader: null, profile: Object.assign({}, profile),
        })
    }

    hideDeleteModal() {
        this.setState({
            deleteModal: false, profile: null
        })
    }

    updateProfile(profile) {
        this.setState({profile})
    }
    updateReader(reader) {
        this.setState({reader})
    }

    storeReader(isDone=true) {
        const {reader} = this.state
        reader.title = reader.title || 'Nameless'
        ConverterApi.updateReader(reader)
            .then((response) => {
                const readers = [...this.state.readers]
                const index = readers.findIndex(p => (p.id === response.id))
                readers[index] = response
                if(isDone) {
                    this.setState({
                        status: 'list', readers: readers, profile: null
                    })
                } else {
                    this.setState({
                        readers: readers, profile: null
                    })
                }
            })

    }

    storeProfile() {
        const {status, profile} = this.state

        // remove show flag
        if (Array.isArray(profile.identifiers)) {
            profile.identifiers.forEach(identifier => {
                delete identifier.show
            })
        }

        if (status === 'create') {
            ConverterApi.createProfile(profile)
                .then(response => {
                    const profiles = [...this.state.profiles]
                    profiles.push(response)
                    this.setState({
                        status: 'list', profiles: profiles, profile: null
                    }, this.showCreatedModal)
                })
        } else if (status === 'update') {
            ConverterApi.updateProfile(profile)
                .then((response) => {
                    const profiles = [...this.state.profiles]
                    const index = profiles.findIndex(p => (p.id === response.id))
                    profiles[index] = response
                    this.setState({
                        status: 'list', profiles: profiles, profile: null
                    })
                })
        }
    }

    deleteProfile() {
        if(this.state.profile !== null) {
            ConverterApi.deleteProfile(this.state.profile)
                .then(() => {
                    const profiles = [...this.state.profiles]
                    const index = profiles.findIndex(p => (p.id === this.state.profile.id))
                    profiles.splice(index, 1)
                    this.setState({
                        status: 'list', profiles: profiles, profile: null
                    }, this.hideDeleteModal)
                })
        } else if(this.state.reader !== null) {
            ConverterApi.deleteReader(this.state.reader)
                .then(() => {
                    const readers = [...this.state.readers]
                    const index = readers.findIndex(p => (p.id === this.state.readers.id))
                    readers.splice(index, 1)
                    this.setState({
                        status: 'list', readers: readers, profile: null
                    }, this.hideDeleteModal)
                })
        }
    }

    downloadProfile(profile) {
        const a = document.createElement('a')
        a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2))
        a.download = profile.id + '.json'
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    createReader(ev) {
        ev.preventDefault()
        ConverterApi.createReader({'title': this.state.newReaderName})
        .then(response => {
            const readers = [...this.state.readers]
            readers.push(response)
            document.getElementById('create-reader-name').value = ''
            this.setState({
                status: 'list', readers: readers, profile: null, newReaderName: ''
            })
        })
    }

    deleteReader() {
        ConverterApi.deleteReader(this.state.profile)
            .then(() => {
                const profiles = [...this.state.profiles]
                const index = profiles.findIndex(p => (p.id === this.state.profile.id))
                profiles.splice(index, 1)
                this.setState({
                    status: 'list', profiles: profiles, profile: null
                }, this.hideDeleteModal)
            })
    }

    downloadReader(reader) {
        const a = document.createElement('a')
        a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reader, null, 2))
        a.download = reader.id + '.json'
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    updateFile(event) {
        this.setState({
            selectedFile: event.target.files[0], loaded: 0, isLoading: false, error: false, errorMessage: ''
        })
    }

    uploadFile() {
        const {selectedFile} = this.state

        this.setState({
            isLoading: true
        })

        ConverterApi.fetchTables(selectedFile)
            .then(data => {
                if (data) {
                    const profile = {
                        title: '', description: '', tables: [], identifiers: [], data: data,
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
                        error: true, errorMessage: 'The uploaded file is too large.', isLoading: false
                    })
                } else {
                    error.text().then(errorMessage => {
                        this.setState({
                            error: true, errorMessage: JSON.parse(errorMessage).error, isLoading: false
                        })
                    })
                }
            })
    }

    importFile() {
        const {selectedFile} = this.state

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
                        status: 'list', profiles: profiles, profile: null
                    }, this.showCreatedModal)
                })
                .catch(errors => {
                    this.setState({
                        error: true, errorMessage: Object.values(errors).join(', '), isLoading: false
                    })
                })
        }

        const reader = new FileReader()
        reader.readAsText(selectedFile)
        reader.onload = createProfile.bind(this)
    }

    dispatchView() {
        if (this.state.status === 'list') {
            return (<div>
                <h2>
                    Profiles List
                </h2>
                <ProfileList
                    profiles={this.state.profiles}
                    updateProfile={this.showUpdateView}
                    deleteProfile={this.showDeleteModal}
                    downloadProfile={this.downloadProfile}
                />
                <form onSubmit={this.createReader}>
                    <div className="row">


                        <h2 className="col-md-4">
                            Reader List
                        </h2>
                        <div className="col-md-5 ">
                            <input
                                   className="form-control"
                                   type="text"
                                   id="create-reader-name"
                                   placeholder="Name of the new reader"
                                   onChange={(evt)=> this.setState({newReaderName: evt.target.value})}
                            />
                        </div>
                        <label className="col-md-3 ag-pinned-right-floating-bottom" htmlFor="create-reader-name">
                            <button className="btn btn-primary" disabled={this.state.newReaderName === ''}>
                                Create new reader
                            </button>
                        </label>

                    </div>
                </form>
                <ReaderList
                    readers={this.state.readers}
                    updateReader={this.showReaderUpdateView}
                    deleteReader={this.showReaderDeleteModal}
                    downloadReader={this.downloadReader}
                />

            </div>)
        } else if (this.state.status === 'import') {
            return (<FileUploadForm
                onFileChangeHandler={this.updateFile}
                onSubmitFileHandler={this.importFile}
                errorMessage={this.state.errorMessage}
                error={this.state.error}
                isLoading={this.state.isLoading}
                disabled={this.state.selectedFile === null}
            />)
        } else if (this.state.status === 'upload') {
            return (<FileUploadForm
                onFileChangeHandler={this.updateFile}
                onSubmitFileHandler={this.uploadFile}
                errorMessage={this.state.errorMessage}
                error={this.state.error}
                isLoading={this.state.isLoading}
                disabled={this.state.selectedFile === null}
            />)
        } else if (this.state.status === 'updateReader') {
            return (<ReaderForm
                status={this.state.status}
                reader={this.state.reader}
                options={this.state.options}
                datasets={this.state.datasets}
                updateReader={this.updateReader}
                storeReader={this.storeReader}
                errorMessage={this.state.errorMessage}
                error={this.state.error}
            />)
        } else {
            return (<ProfileForm
                status={this.state.status}
                profile={this.state.profile}
                options={this.state.options}
                datasets={this.state.datasets}
                updateProfile={this.updateProfile}
                storeProfile={this.storeProfile}
            />)
        }
    }



    render() {

        return (<div className={['create', 'update', 'updateReader'].includes(this.state.status) ? 'container-fluid' : 'container'}>
            <header>
                <nav aria-label="breadcrumb">
                    {this.state.status === 'list' && <ol className="breadcrumb">
                        <li className="breadcrumb-item active" aria-current="page">Chemotion file converter admin
                        </li>
                    </ol>}
                    {['upload', 'create'].includes(this.state.status) && <ol className="breadcrumb">
                        <li className="breadcrumb-item" aria-current="page"><a href="">Chemotion file converter
                            admin</a></li>
                        <li className="breadcrumb-item active" aria-current="page">{'Create Profile'}</li>
                    </ol>}
                    {this.state.status === 'update' && <ol className="breadcrumb">
                        <li className="breadcrumb-item" aria-current="page"><a href="">Chemotion file converter
                            admin</a></li>
                        <li className="breadcrumb-item active"
                            aria-current="page">{'Edit Profile: ' + this.state.title}</li>
                    </ol>}
                    {this.state.status === 'updateReader' && <ol className="breadcrumb">
                        <li className="breadcrumb-item" aria-current="page"><a href="">Chemotion file converter
                            admin</a></li>
                        <li className="breadcrumb-item active"
                            aria-current="page">{'Edit Reader: ' + this.state.title}</li>
                    </ol>}
                    {this.state.status === 'import' && <ol className="breadcrumb">
                        <li className="breadcrumb-item" aria-current="page"><a href="">Chemotion file converter
                            admin</a></li>
                        <li className="breadcrumb-item active" aria-current="page">{'Import Profile'}</li>
                    </ol>}
                </nav>

                <div>
                    {this.state.status === "list" && <div className="pull-right">
                        <button type="button" onClick={this.showImportView} className="btn btn-success mr-10">
                            Import profile
                        </button>
                        <button type="button" onClick={this.showCreateView} className="btn btn-primary mr-10">
                            Create new profile
                        </button>
                        <a target="_blank" href="https://chemotion.net/docs/chemconverter/#technical-aspect" className="btn btn-info">
                            Help
                        </a>
                    </div>}

                    <h2>
                        {['upload', 'create'].includes(this.state.status) && 'Create Profile'}
                        {this.state.status === 'update' && 'Edit Profile'}
                        {this.state.status === 'import' && 'Import Profile'}
                    </h2>
                </div>
            </header>

            <main>
                {this.dispatchView()}
            </main>

            <Modal show={this.state.createdModal}>
                <Modal.Header>
                    <Modal.Title>Profile successfully created!</Modal.Title>
                </Modal.Header>

                <Modal.Footer>
                    <Button bsStyle="primary" onClick={this.hideCreatedModal}>Great!</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={this.state.deleteModal}>
                <Modal.Header>
                    <Modal.Title>Do you really want to delete this profile?</Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <Button bsStyle="default" onClick={this.hideDeleteModal}>Cancel</Button>
                    <Button bsStyle="danger" onClick={this.deleteProfile}>Delete profile</Button>
                </Modal.Footer>
            </Modal>
        </div>)
    }

}

export default AdminApp

import React, {Component} from 'react';
import {Breadcrumb, Button, Col, Container, Modal, Row} from 'react-bootstrap';

import ConverterApi from '../../api/ConverterApi';

import ProfileList from './list/ProfileList';
import ProfileForm from './form/ProfileForm';
import FileUploadForm from './upload/FileUploadForm';
import {GENERIC_PREDICATE} from "./form/common/TibFetchService";


class AdminApp extends Component {

    constructor(props) {
        super(props);
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
            createdModal: false,
            deleteModal: false
        };

        this.showListView = this.showListView.bind(this);
        this.showCreateView = this.showCreateView.bind(this);
        this.showUpdateView = this.showUpdateView.bind(this);
        this.showImportView = this.showImportView.bind(this);

        this.showCreatedModal = this.showCreatedModal.bind(this);
        this.hideCreatedModal = this.hideCreatedModal.bind(this);

        this.showDeleteModal = this.showDeleteModal.bind(this);
        this.hideDeleteModal = this.hideDeleteModal.bind(this);

        this.updateProfile = this.updateProfile.bind(this);
        this.storeProfile = this.storeProfile.bind(this);
        this.deleteProfile = this.deleteProfile.bind(this);
        this.downloadProfile = this.downloadProfile.bind(this);
        this.toggleDisableProfile = this.toggleDisableProfile.bind(this);

        this.updateFile = this.updateFile.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.importFile = this.importFile.bind(this);

        this.dispatchView = this.dispatchView.bind(this);
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

    showListView() {
        this.setState({
            status: 'list',
            profile: null
        });
    }

    showImportView() {
        this.setState({
            status: 'import',
            profile: null
        });
    }

    showCreateView() {
        this.setState({
            status: 'upload',
            profile: null
        });
    }

    showUpdateView(profile) {
        this.setState({
            status: 'update',
            profile: Object.assign({}, profile),
            error: false,
            errorMessage: ''
        });
    }

    showCreatedModal() {
        this.setState({
            createdModal: true
        });
    }

    hideCreatedModal() {
        this.setState({
            createdModal: false
        });
    }

    showDeleteModal(profile) {
        this.setState({
            deleteModal: true,
            profile: Object.assign({}, profile),
        });
    }

    hideDeleteModal() {
        this.setState({
            deleteModal: false,
            profile: null
        });
    }

    updateProfile(profile) {
        this.setState({profile});
    }

    storeProfile() {
        const {status, profile} = this.state;

        // remove show flag
        if (Array.isArray(profile.identifiers)) {
            profile.identifiers.forEach(identifier => {
                delete identifier.show;
            });
        }

        if (status === 'create') {
            this._createProfile(profile);
        } else if (status === 'update') {
            this._saveProfile(profile);
        }
    }

    _createProfile(profile) {
        ConverterApi.createProfile(profile)
            .then(response => {
                const profiles = [...this.state.profiles]
                profiles.push(response)
                this.setState({
                    status: 'list',
                    profiles: profiles,
                    profile: null,
                    createdModal: true
                });
            })
            .catch(errors => {
                this.setState({
                    error: true,
                    errorMessage: Object.values(errors).join(', '),
                    isLoading: false
                });
            });
    }

    _saveProfile(profile) {
        ConverterApi.updateProfile(profile)
            .then((response) => {
                const profiles = [...this.state.profiles]
                const index = profiles.findIndex(p => (p.id === response.id))
                profiles[index] = response
                this.setState({
                    status: 'list',
                    profiles: profiles,
                    profile: null
                });
            });
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

    toggleDisableProfile(profile) {
        profile.isDisabled = !profile.isDisabled;
        this._saveProfile(profile);
    }

    deleteProfile() {
        ConverterApi.deleteProfile(this.state.profile)
            .then(() => ConverterApi.fetchProfiles())
            .then((profiles) => {
                this.hideDeleteModal();
                this.setState({
                    status: 'list',
                    profiles: profiles,
                    profile: null
                });
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
                        title: '',
                        description: '',
                        tables: [],
                        identifiers: [],
                        data: data,
                        subjects: [],
                        predicates: [],
                        objects: [],
                        subjectInstances: {},
                        rootOntology: GENERIC_PREDICATE
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
        const {selectedFile} = this.state

        this.setState({
            isLoading: true
        })

        const createProfile = (e) => {
            const fileProfile = JSON.parse(e.target.result);
            this._createProfile(fileProfile);
        }

        const reader = new FileReader()
        reader.readAsText(selectedFile)
        reader.onload = createProfile.bind(this)
    }

    dispatchView() {
        const {profiles, status} = this.state;
        if (status === 'list') {
            return (
                <ProfileList
                    profiles={profiles}
                    isAdmin
                    updateProfile={this.showUpdateView}
                    deleteProfile={this.showDeleteModal}
                    downloadProfile={this.downloadProfile}
                    toggleDisableProfile={this.toggleDisableProfile}
                />
            )
        } else if (status === 'import' || status === 'upload') {
            let handler = status === 'import' ? this.importFile : this.uploadFile;
            const {errorMessage, error, isLoading, selectedFile} = this.state;
            return (
                <FileUploadForm
                    onFileChangeHandler={this.updateFile}
                    onSubmitFileHandler={handler}
                    errorMessage={errorMessage}
                    error={error}
                    isLoading={isLoading}
                    disabled={selectedFile === null}
                />
            )
        } else {
            const {profile, options, datasets} = this.state;
            return (
                <ProfileForm
                    status={status}
                    profile={profile}
                    options={options}
                    datasets={datasets}
                    updateProfile={this.updateProfile}
                    storeProfile={this.storeProfile}
                />
            )
        }
    }

    render() {
        return (
            <Container fluid={['create', 'update'].includes(this.state.status)}>
                <Breadcrumb className="mt-4">
                    <Breadcrumb.Item
                        onClick={this.showListView}
                        active={this.state.status === 'list'}
                    >
                        Chemotion file converter admin
                    </Breadcrumb.Item>

                    {['upload', 'create'].includes(this.state.status) && (
                        <Breadcrumb.Item active>Create Profile</Breadcrumb.Item>
                    )}
                    {this.state.status === 'update' && (
                        <Breadcrumb.Item active>{'Edit Profile: ' + this.state.profile.title}</Breadcrumb.Item>
                    )}
                    {this.state.status === 'import' && (
                        <Breadcrumb.Item active>Import Profile</Breadcrumb.Item>
                    )}
                </Breadcrumb>
                <Row className="mb-3">
                    <Col>
                        <h2>
                            {this.state.status === 'list' && 'Profiles List'}
                            {['upload', 'create'].includes(this.state.status) && 'Create Profile'}
                            {this.state.status === 'update' && 'Edit Profile'}
                            {this.state.status === 'import' && 'Import Profile'}
                        </h2>
                    </Col>

                    {this.state.status === "list" &&
                        <Col md={4} className="d-flex justify-content-end gap-2">
                            <Button variant="success" onClick={this.showImportView}>
                                Import profile
                            </Button>
                            <Button variant="primary" onClick={this.showCreateView}>
                                Create new profile
                            </Button>
                        </Col>
                    }
                </Row>

                <main>
                    {this.dispatchView()}
                </main>

                <Modal show={this.state.createdModal}>
                    <Modal.Header>
                        <Modal.Title>Profile successfully created!</Modal.Title>
                    </Modal.Header>

                    <Modal.Footer>
                        <Button variant="primary" onClick={this.hideCreatedModal}>Great!</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.deleteModal}>
                    <Modal.Header>
                        <Modal.Title>Do you really want to delete this profile?</Modal.Title>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button variant="default" onClick={this.hideDeleteModal}>Cancel</Button>
                        <Button variant="danger" onClick={this.deleteProfile}>Delete profile</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        )
    }

}

export default AdminApp

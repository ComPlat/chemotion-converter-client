import React, {useEffect, useState} from 'react';
import {Breadcrumb, Button, Col, Container, Modal, Row} from 'react-bootstrap';

import ConverterApi from '../../api/ConverterApi';

import ProfileList from './list/ProfileList';
import ProfileForm from './form/ProfileForm';
import FileUploadForm from './upload/FileUploadForm';
import {AllCommunityModule, ModuleRegistry, provideGlobalGridOptions} from 'ag-grid-community';
import {getProfileData} from "../../utils/profileUtils";
import {GENERIC_PREDICATE} from "./form/common/TibFetchService";

ModuleRegistry.registerModules([AllCommunityModule]);

// Mark all grids as using legacy themes
provideGlobalGridOptions({
  theme: "legacy",
});


function AdminApp() {
  const [status, setStatus] = useState('list');
  const [selectedFile, setSelectedFile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [options, setOptions] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [profile, setProfile] = useState(null);
  const [originProfile, setOriginProfile] = useState(null);
  const [error, setError] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdModal, setCreatedModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  useEffect(() => {
    Promise.all([
      ConverterApi.fetchProfiles(),
      ConverterApi.fetchDatasets(),
      ConverterApi.fetchOptions()
    ]).then(responses => {
      const [profilesResponse, datasetsResponse, optionsResponse] = responses
      setProfiles(profilesResponse);
      setDatasets(datasetsResponse);
      setOptions(optionsResponse);
    })
  }, []);

  const showListView = () => {
    setStatus('list');
    setProfile(null);
  };

  const showImportView = () => {
    setStatus('import');
    setProfile(null);
  };

  const showCreateView = () => {
    setStatus('upload');
    setProfile(null);
  };

  const showUpdateView = (nextProfile) => {
    setStatus('update');
    setProfile(nextProfile);
    setOriginProfile(nextProfile)
    setError(false);
    setUploadError(false);
    setErrorMessage('');
  };

  const hideCreatedModal = () => {
    setCreatedModal(false);
  };

  const showDeleteModal = (nextProfile) => {
    setDeleteModal(true);
    setProfile(Object.assign({}, nextProfile));
  };

  const hideDeleteModal = () => {
    setDeleteModal(false);
    setProfile(null);
  };

  const updateProfile = (nextProfile) => {
    setProfile({...nextProfile});
  };

  const createProfile = (nextProfile, silent = false) => {
    return ConverterApi.createProfile(nextProfile)
      .then(response => {
        setProfiles(prevProfiles => [...prevProfiles, response]);
        if (!silent) {
          setStatus('list');
          setProfile(null);
          setCreatedModal(true);
        } else {
          setProfile(response);
          setOriginProfile(response);
          setStatus('update');
        }
        return response;
      })
      .catch(errors => {
        setError(true);
        setErrorMessage(Object.values(errors.data).join(', '));
        setIsLoading(false);
      });
  };

  const saveProfile = (nextProfile, silent = false) => {
    return ConverterApi.updateProfile(nextProfile)
      .then((response) => {
        setProfiles(prevProfiles => {
          const updatedProfiles = [...prevProfiles];
          const index = updatedProfiles.findIndex(p => (p.id === response.id))
          updatedProfiles[index] = response
          return updatedProfiles;
        });
        if (!silent) {
          setStatus('list');
          setProfile(null);
        } else {
          setProfile(response);
          setOriginProfile(response);
        }

        return response;
      })
      .catch(errors => {
        setError(true);
        setErrorMessage(Object.values(errors.data).join(', '));
        setIsLoading(false);
      });
  };

  const storeProfile = (silent = false) => {
    if (!profile) {
      return;
    }

    if (Array.isArray(profile.identifiers)) {
      profile.identifiers.forEach(identifier => {
        delete identifier.show;
      });
    }

    if (status === 'create') {
      return createProfile(profile, silent);
    } else if (status === 'update') {
      return saveProfile(profile, silent);
    }
  };

  const downloadProfile = (nextProfile) => {
    const a = document.createElement('a')
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(nextProfile, null, 2))
    a.download = nextProfile.id + '.json'
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const updateFile = (event) => {
    setSelectedFile(event.target.files[0]);
    setIsLoading(false);
    setError(false);
    setUploadError(false);
    setErrorMessage('');
  };

  const toggleDisableProfile = (nextProfile) => {
    nextProfile.isDisabled = !nextProfile.isDisabled;
    saveProfile(nextProfile);
  };

  const deleteProfile = () => {
    ConverterApi.deleteProfile(profile)
      .then(() => ConverterApi.fetchProfiles())
      .then((profilesResponse) => {
        hideDeleteModal();
        setStatus('list');
        setProfiles(profilesResponse);
        setProfile(null);
        setOriginProfile(null);
      })
  };

  const uploadFile = async () => {

    if (profile) {
      const storedProfile = await storeProfile(true);
      let profileId;
      try {
        const res = await (await ConverterApi.fetchConversion(selectedFile, 'metajson', false)).json();
        profileId = res.profile_id;
      } catch {
      }
      if (profileId !== storedProfile.id) {
        setUploadError(true);
        setErrorMessage('The file cannot be recognised by the configured identifier!');
        return;
      }
    }
    setIsLoading(true);

    return ConverterApi.fetchTables(selectedFile)
      .then(data => {
        if (data) {
          const uploadedProfileData = Array.isArray(data) ? data[0] : data;
          const currentProfileData = getProfileData(profile, 0);
          let nextProfile = {};
          if (profile) {
            if (uploadedProfileData?.metadata?.reader === currentProfileData?.metadata?.reader) {

              const fileExists = profile.data.some(item => item.metadata.file_name === uploadedProfileData?.metadata?.file_name);
              if (fileExists) {
                setUploadError(true);
                setErrorMessage('The uploaded file already in the Profile!.');
                setIsLoading(false);

                return false;
              }
              nextProfile = {
                ...profile,
                data: [...profile.data, data]
              };
              setStatus('update');
            } else {
              setUploadError(true);
              setErrorMessage('The uploaded file cannot be read by the reader for this profile.');
              setIsLoading(false);

              return false;
            }
          } else {
            nextProfile = {
              title: '',
              description: '',
              tables: [],
              identifiers: [],
              data: [data],
              subjects: [],
              predicates: [],
              datatypes: [],
              subjectInstances: {},
              rootOntology: GENERIC_PREDICATE
            }
            setStatus('create');
          }

          setProfile(nextProfile);
          setSelectedFile(null);
          setIsLoading(false);
          setUploadError(false);
          setErrorMessage('');
        }
        return true;
      })
      .catch(error => {
        if (error.status === 413) {
          setUploadError(true);
          setErrorMessage('The uploaded file is too large.');
          setIsLoading(false);
        } else {
          error.text().then(errorMessage => {
            setUploadError(true);
            setErrorMessage(JSON.parse(errorMessage).error);
            setIsLoading(false);
          })
        }
        return false;
      })
  };

  const importFile = () => {
    setIsLoading(true);

    const handleLoad = (e) => {
      const fileProfile = JSON.parse(e.target.result);
      createProfile(fileProfile);
    }

    const reader = new FileReader()
    reader.readAsText(selectedFile)
    reader.onload = handleLoad
  };

  const dispatchView = () => {
    if (status === 'list') {
      return (
        <ProfileList
          profiles={profiles}
          isAdmin
          updateProfile={showUpdateView}
          deleteProfile={showDeleteModal}
          downloadProfile={downloadProfile}
          toggleDisableProfile={toggleDisableProfile}
        />
      )
    } else if (status === 'import' || status === 'upload') {
      let handler = status === 'import' ? importFile : uploadFile;
      return (
        <FileUploadForm
          onFileChangeHandler={updateFile}
          onSubmitFileHandler={handler}
          errorMessage={errorMessage}
          error={uploadError}
          isLoading={isLoading}
          disabled={selectedFile === null}
        />
      )
    } else {
      return (
        <ProfileForm
          status={status}
          profile={profile}
          options={options}
          datasets={datasets}
          errorMessage={errorMessage}
          savable={profile !== originProfile}
          error={error}
          uploadError={uploadError}
          updateProfile={updateProfile}
          storeProfile={storeProfile}
          onFileChangeHandler={updateFile}
          onSubmitFileHandler={uploadFile}
          isLoading={isLoading}
        />
      )
    }
  }

  return (
    <Container fluid={['create', 'update'].includes(status)}>
      <Breadcrumb className="mt-4">
        <Breadcrumb.Item
          onClick={showListView}
          active={status === 'list'}
        >
          Chemotion file converter admin
        </Breadcrumb.Item>

        {['upload', 'create'].includes(status) && profile === null && (
          <Breadcrumb.Item active>Create Profile</Breadcrumb.Item>
        )}
        {['upload', 'create'].includes(status) && profile !== null && (
          <Breadcrumb.Item active>Replace File</Breadcrumb.Item>
        )}
        {status === 'update' && (
          <Breadcrumb.Item active>{'Edit Profile: ' + profile.title}</Breadcrumb.Item>
        )}
        {status === 'import' && (
          <Breadcrumb.Item active>Import Profile</Breadcrumb.Item>
        )}
      </Breadcrumb>
      <Row className="mb-3">
        <Col>
          <h2>
            {status === 'list' && 'Profiles List'}
            {['upload', 'create'].includes(status) && profile === null && 'Create Profile'}
            {['upload', 'create'].includes(status) && profile !== null && 'Replace File'}
            {status === 'update' && 'Edit Profile'}
            {status === 'import' && 'Import Profile'}
          </h2>
        </Col>

        {status === "list" &&
          <Col md={4} className="d-flex justify-content-end gap-2">
            <Button variant="success" onClick={showImportView}>
              Import profile
            </Button>
            <Button variant="primary" onClick={showCreateView}>
              Create new profile
            </Button>
          </Col>
        }
      </Row>

      <main>
        {dispatchView()}
      </main>

      <Modal show={createdModal}>
        <Modal.Header>
          <Modal.Title>Profile successfully created!</Modal.Title>
        </Modal.Header>

        <Modal.Footer>
          <Button variant="primary" onClick={hideCreatedModal}>Great!</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={deleteModal}>
        <Modal.Header>
          <Modal.Title>Do you really want to delete this profile?</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button variant="default" onClick={hideDeleteModal}>Cancel</Button>
          <Button variant="danger" onClick={deleteProfile}>Delete profile</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default AdminApp

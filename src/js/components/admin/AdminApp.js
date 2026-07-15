import React, {useState} from 'react';
import {Breadcrumb, Button, Col, Container, Modal, Row} from 'react-bootstrap';

import ConverterApi from '../../api/ConverterApi';

import ProfileList from './list/ProfileList';
import ProfileForm from './form/ProfileForm';
import FileUploadForm from './upload/FileUploadForm';
import {AllCommunityModule, ModuleRegistry, provideGlobalGridOptions} from 'ag-grid-community';
import {getProfileData} from "../../utils/profileUtils";
import {GENERIC_PREDICATE} from "./form/common/TibFetchService";
import {AdminProvider, useAdminApp} from "./AppContext";
import PropTypes from "prop-types";
import AppModal from "../../utils/modalWrapper";

ModuleRegistry.registerModules([AllCommunityModule]);

// Mark all grids as using legacy themes
provideGlobalGridOptions({
  theme: "legacy",
});

// Turns a rejected ConverterApi call into a message to display. The rejection
// can be an Error carrying converter-app's `{ Validation, ... }` body on `.data`
// (a create/update validation failure), but also a bare Error or Response with
// no `.data` (a network failure, or an upstream error whose body was not JSON).
// `Object.values(undefined)` throws "Cannot convert undefined or null to object"
// and takes down the save, so every shape has to be guarded.
const formatConverterError = (errors) => {
  const data = errors && errors.data;
  if (data && typeof data === 'object') {
    return Object.values(data).join(', ');
  }
  return (errors && errors.message) || 'An error occurred during processing.';
};


function AdminAppContent({ModalComponent, isAdmin}) {
  const {profiles, setProfiles, profile, setProfile, updateProfileList, options, setTableIdx} = useAdminApp((s) => ({
    profiles: s.profiles,
    setProfiles: s.setProfiles,
    profile: s.profile,
    setProfile: s.setProfile,
    updateProfileList: s.updateProfileList,
    options: s.options,
    setTableIdx: s.setTableIdx
  }));
  const [status, setStatus] = useState('list');
  const [selectedFile, setSelectedFile] = useState(null);
  const [originProfile, _setOriginProfile] = useState(null);
  const [saveabel, setSaveabel] = useState(false);
  const [error, setError] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [createdModal, setCreatedModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [identifierWarningModal, setIdentifierWarningModal] = useState(false);
  const [pendingUploadFile, setPendingUploadFile] = useState(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [ontologyRef, setOntologyRef] = useState("");

  const setOriginProfile = (obj1) => {
    setSaveabel(false);
    if (obj1) {
      _setOriginProfile(JSON.stringify(obj1));
    } else {
      _setOriginProfile(null);
    }
  }

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

  const createProfile = (nextProfile, silent = false) => {
    const profile = profiles.find(p => p.id === nextProfile.id);
    if (profile) {
      setUploadError(true);
      setErrorMessage("Profile already exists.");
      setIsLoading(false);
      return null;
    }
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
        setUploadError(false);
        setErrorMessage('');
        setIsLoading(false);
        return response;
      })
      .catch(errors => {
        setUploadError(true);
        setErrorMessage(formatConverterError(errors));
        setIsLoading(false);
      });
  };

  const saveProfile = (nextProfile, silent = false) => {
    return ConverterApi.updateProfile(nextProfile)
      .then((response) => {
        updateProfileList(response);
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
        setErrorMessage(formatConverterError(errors));
        setIsLoading(false);
      });
  };

  const storeProfile = (silent = false) => {
    if (!profile) {
      return;
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
      .then(() => ConverterApi.fetchProfiles(isAdmin))
      .then((profilesResponse) => {
        hideDeleteModal();
        setStatus('list');
        setProfiles(profilesResponse);
        setProfile(null);
        setOriginProfile(null);
      })
  };

  const processUploadedFile = (file) => {
    setIsLoading(true);
    return ConverterApi.fetchTables(file, ontologyRef)
      .then(data => {
        if (data) {
          const uploadedProfileData = Array.isArray(data) ? data[0] : data;
          let nextProfile = {};
          if (profile) {
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
            setProfile(nextProfile);
            setTableIdx(nextProfile.data.length - 1);
            setStatus('update');
          } else {
            nextProfile = {
              title: '',
              diff_history: [],
              profile_version: '1.0',
              description: '',
              tables: [],
              identifiers: [],
              data: [data],
              subjects: [],
              predicates: [],
              devices: [],
              software: [],
              ontology: '',
              // Carry the ontology chosen during upload into the profile so the
              // Ontology tab is pre-filled. Empty selection -> null (no artefacts).
              ols: ontologyRef || null,
              objects: [], datatypes: [],
              converter_version: options?.VERSION ?? '0.0',
              subjectInstances: {},
              rootOntology: GENERIC_PREDICATE,
              reactionVariations: {elements: [], identifiers: []}
            }
            setStatus('create');
            setProfile(nextProfile);
          }


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

  const uploadFile = async () => {
    if (profile) {
      const storedProfile = await storeProfile(true);
      let profileId;
      try {
        const res = await (await ConverterApi.fetchConversion(selectedFile, 'metajson', false, ontologyRef)).json();
        profileId = res.profile_id;
      } catch {
      }
      if (profileId !== storedProfile.id) {
        setShowFileUpload(false);
        setPendingUploadFile(selectedFile);
        setIdentifierWarningModal(true);
        return;
      }
    }

    return processUploadedFile(selectedFile);
  };

  const confirmIdentifierWarning = () => {
    setIdentifierWarningModal(false);
    const file = pendingUploadFile;
    setPendingUploadFile(null);
    return processUploadedFile(file);
  };

  const cancelIdentifierWarning = () => {
    setIdentifierWarningModal(false);
    setPendingUploadFile(null);
  };

  const importFile = () => {
    setIsLoading(true);

    const handleLoad = (e) => {
      const fileProfile = JSON.parse(e.target.result);
      createProfile(fileProfile);
    }

    const reader = new FileReader()
    reader.readAsText(selectedFile);
    reader.onload = handleLoad;
  };

  const handleCloseFileUpload = () => setShowFileUpload(false);
  const handleShowFileUpload = () => setShowFileUpload(true);
  const submitFileHandler = async () => {
    const res = await uploadFile();
    if (res) {
      handleCloseFileUpload();
    }
  }

  if (!saveabel && profile && JSON.stringify(profile) !== originProfile) {
    setSaveabel(true);
  }

  const dispatchView = () => {
    if (status === 'list') {
      return (
        <ProfileList
          profiles={profiles}
          isAdmin={isAdmin}
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
          ontologyRef={ontologyRef}
          setOtologyRef={setOntologyRef}
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
          errorMessage={errorMessage}
          savable={saveabel}
          error={error}
          storeProfile={storeProfile}
          handleShowFileUpload={handleShowFileUpload}/>
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
            <Button disabled={!isAdmin} variant="success" onClick={showImportView}>
              Import profile
            </Button>
            <Button disabled={!isAdmin} variant="primary" onClick={showCreateView}>
              Create new profile
            </Button>
          </Col>
        }
      </Row>

      <main>
        {dispatchView()}
      </main>

      <ModalComponent
        show={createdModal}
        onHide={hideCreatedModal}
        title="Profile successfully created!"
        showFooter
        closeLabel="Close"
      >
        Your converter profile has been created successfully.
      </ModalComponent>

      <ModalComponent
        show={deleteModal}
        onHide={hideDeleteModal}
        title="Do you really want to delete this profile?"
        closeLabel="Cancel"
        primaryActionLabel="Delete profile"
        onPrimaryAction={deleteProfile}
      >
        This action will permanently remove the selected converter profile.
      </ModalComponent>

      <ModalComponent
        show={identifierWarningModal}
        onHide={cancelIdentifierWarning}
        title="Identifier mismatch"
        closeLabel="Cancel"
        primaryActionLabel="Use file anyway"
        onPrimaryAction={confirmIdentifierWarning}
      >
        The file was converted by a different profile. It is most likely that the identifiers do not match. Do you
        still want to use this file?
      </ModalComponent>

      <ModalComponent
        show={showFileUpload}
        onHide={handleCloseFileUpload}
        title="Add File"
        closeLabel="Cancel"
      >
        <FileUploadForm
          onFileChangeHandler={updateFile}
          onSubmitFileHandler={submitFileHandler}
          ontologyRef={ontologyRef}
          setOtologyRef={setOntologyRef}
          errorMessage={errorMessage}
          error={uploadError}
          isLoading={isLoading}
          disabled={false}
        />
      </ModalComponent>
    </Container>
  )
}

AdminAppContent.propTypes = {
  ModalComponent: PropTypes.elementType.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

function AdminApp({ModalComponent = null, converterUrl = null, isAdmin = true}) {
  if (converterUrl) {
     ConverterApi.setConverterUrl(converterUrl);
  }

  return (
    <AdminProvider isAdmin={isAdmin}>
      <AdminAppContent ModalComponent={ModalComponent ?? AppModal}  isAdmin={isAdmin}/>
    </AdminProvider>
  )
}

AdminApp.propTypes = {
  ModalComponent: PropTypes.elementType,
  converterUrl: PropTypes.string,
  isAdmin: PropTypes.bool,
};

AdminApp.defaultProps = {
  ModalComponent: null,
  converterUrl: null,
  isAdmin: true,
};

export default AdminApp

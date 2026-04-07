import React, {useEffect, useState} from "react"
import PropTypes from 'prop-types';
import {Alert, Button, ButtonGroup, Modal, Row} from 'react-bootstrap';

import InputTables from "./common/InputTables";
import FormNavigatorCol from "./controllComponents/FormNavigator";
import FileUploadForm from "../upload/FileUploadForm";

const profileShape = PropTypes.shape({
  data: PropTypes.oneOfType([
    PropTypes.shape({
      metadata: PropTypes.object,
      tables: PropTypes.array
    }),
    PropTypes.arrayOf(PropTypes.shape({
      metadata: PropTypes.object,
      tables: PropTypes.array
    }))
  ]),
  tables: PropTypes.arrayOf(PropTypes.shape({
    table: PropTypes.object,
    loopType: PropTypes.string
  })).isRequired
});

function ProfileForm({
                       status,
                       profile,
                       options,
                       datasets,
                       updateProfile,
                       storeProfile,
                       error,
                       uploadError,
                       errorMessage,
                       onFileChangeHandler,
                       onSubmitFileHandler,
                       isLoading,
                       savable
                     }) {

  const [activeTabKey, setActiveTabKey] = useState("basics");
  const [tableIdx, setTableIdx] = useState(0);
  const [showFileUpload, setShowFileUpload] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (savable) {
        event.preventDefault();
        event.returnValue = ""; // Required for Chrome
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [savable]);

  const _onSubmit = (silent) => {
    const errors = [];

    check_loop_fields(profile, errors);

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }

    storeProfile(silent);
  }

  const onSubmit = (event) => {
    event.preventDefault();
    return _onSubmit(false);
  }

  const onSubmitSilent = (event) => {
    event.preventDefault();
    return _onSubmit(true);
  }

  const check_loop_fields = (profile, errors) => {
    profile.tables.forEach((t, tableIndex) => {
      t.table['loop_header']?.forEach((lh, lhIndex) => {
        if (lh.column?.columnIndex == null) {
          errors.push(`In Output Table ${tableIndex}: no column header selected for loop condition ${lhIndex}`);
        }
      });
      t.table['loop_theader']?.forEach((lh, lhIndex) => {
        if (lh.line === "" || lh.regex === "") {
          errors.push(`In Output Table ${tableIndex}: no line or regex selected for loop condition ${lhIndex}`);
        }
      });
      t.table['loop_metadata']?.forEach((lh, lhIndex) => {
        if (lh.metadata == null) {
          errors.push(`In Output Table ${tableIndex}: no metadata selected for loop condition ${lhIndex}`);
        }
      });
    });
  }

  const handleShowFileUpload = () => setShowFileUpload(true);
  const handleCloseFileUpload = () => setShowFileUpload(false);
  const submitFileHandler = async () => {
    const res = await onSubmitFileHandler();
    if (res) {
      handleCloseFileUpload();
    }
  }


  if (!profile?.data) return null;

  profile.tables.map((table) => table.loopType = table.loopType ?? "all")

  return (
    <div>
      <Modal show={showFileUpload} onHide={handleCloseFileUpload}>
        <Modal.Header closeButton>
          <Modal.Title>Add File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FileUploadForm
            onFileChangeHandler={onFileChangeHandler}
            onSubmitFileHandler={submitFileHandler}
            errorMessage={errorMessage}
            error={uploadError}
            isLoading={isLoading}
            disabled={false}
          />
        </Modal.Body>
      </Modal>
      <ButtonGroup style={{
        position: "fixed",
        top: '10px',
        right: '10px',
      }}>
        <Button variant="warning" onClick={handleShowFileUpload}>
          {status === 'create' ? 'Create profile' : 'Update profile'} & add input File
        </Button>
        <Button disabled={!savable}
          variant="primary" onClick={onSubmitSilent}>
          {status === 'create' && 'Create profile'}
          {status === 'update' && 'Update profile'}
        </Button>
        <Button disabled={!savable}
          variant="primary" onClick={onSubmit}>
          {status === 'create' && 'Create profile & close'}
          {status === 'update' && 'Update profile & close'}
        </Button>
      </ButtonGroup>
      <Row>
        {error && (
          <div className="fixed-alert-container">
            <Alert variant="danger" dismissible>{errorMessage}</Alert>
          </div>
        )}
        <InputTables setActiveTabKey={setActiveTabKey} profile={profile} setProfile={updateProfile} tableIdx={tableIdx}
                     setTableIdx={setTableIdx}/>
        <FormNavigatorCol
          profile={profile}
          datasets={datasets}
          options={options}
          setProfile={updateProfile}
          activeTabKey={activeTabKey}
          setActiveTabKey={setActiveTabKey}
          tableIdx={tableIdx}
        />

      </Row>

    </div>
  )
}

ProfileForm.propTypes = {
  status: PropTypes.string,
  profile: profileShape,
  options: PropTypes.object,
  datasets: PropTypes.array,
  updateProfile: PropTypes.func,
  storeProfile: PropTypes.func,
  error: PropTypes.bool,
  uploadError: PropTypes.bool,
  errorMessage: PropTypes.string,
  onFileChangeHandler: PropTypes.func,
  onSubmitFileHandler: PropTypes.func,
  isLoading: PropTypes.bool,
  savable: PropTypes.bool,
}

export default ProfileForm

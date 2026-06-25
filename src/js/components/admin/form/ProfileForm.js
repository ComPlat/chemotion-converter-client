import React, {useCallback, useEffect} from "react"
import PropTypes from 'prop-types';
import {Alert, Button, ButtonGroup, Row} from 'react-bootstrap';

import InputTables from "./common/InputTables";
import FormNavigatorCol from "./controllComponents/FormNavigator";
import {useAdminApp} from "../AppContext";

function ProfileForm({
                       status,
                       storeProfile,
                       error,
                       errorMessage,
                       savable,
                       handleShowFileUpload
                     }) {

  const {activeTabKey, setActiveTabKey, profile, updateProfile} = useAdminApp((s) => ({
    activeTabKey: s.activeTabKey,
    setActiveTabKey: s.setActiveTabKey,
    profile: s.profile,
    updateProfile: s.updateProfile
  }));

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

  const onDeleteInputFile = useCallback((idx) => {
    if (profile.data.length <= 1) {
      return
    }
    const newData = [...profile.data];
    newData.splice(idx, 1);
    const newProfile = {...profile, data: newData};
    updateProfile(newProfile)
  }, [profile]);

  const _onSubmit = (silent) => {
    const errors = [];

    check_loop_fields(profile, errors);
    clean_dead_links(profile, errors);

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

  const clean_dead_links = (profile) => {
    const uuids = profile.tables.map((x) => x['uuid']);
    profile.identifiers.forEach((i) => {
      if (i['outputTableIndex']) {
        i['outputTableIndex'] = i['outputTableIndex'].filter((x) => uuids.includes(x));
      }
    });

  }
  const check_loop_fields = (profile, errors) => {
    profile.tables.forEach((t, tableIndex) => {
      t.table['loop_header']?.forEach((lh, lhIndex) => {
        if (typeof lh.column !== 'string') {
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

  if (!profile?.data) return null;

  profile.tables.map((table) => table.loopType = table.loopType ?? "all")

  return (
    <div>
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
        <InputTables onDeleteInputFile={onDeleteInputFile}/>
        <FormNavigatorCol
          activeTabKey={activeTabKey}
          setActiveTabKey={setActiveTabKey}
        />

      </Row>

    </div>
  )
}

ProfileForm.propTypes = {
  status: PropTypes.string.isRequired,
  storeProfile: PropTypes.func.isRequired,
  error: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  savable: PropTypes.bool.isRequired,
  handleShowFileUpload: PropTypes.func.isRequired,
}

export default ProfileForm

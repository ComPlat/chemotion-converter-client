import {Button, Container, Row, Col, Card, ListGroup} from "react-bootstrap";
import React, {useCallback, useState} from "react";
import ConverterApi from "../../../../api/ConverterApi";
import JsonPatchHistoryViewer from "./HistoryChangeView";


export default function ProfileHistory({profile, setProfile}) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const {diff_history: versions} = profile;
  const restoreHandler = useCallback(async (hard) => {
    if (!selectedVersion) return;
    const {profile_version: version} = selectedVersion;
    const {id: profileId} = profile;
    const newProfile = await ConverterApi.fetchRestoreProfiles({hard, version, profileId});
    setProfile(newProfile, {updateList: true});
  }, [profile, selectedVersion]);
  return (<Card>
    <Card.Header>
      Profile history
    </Card.Header>
    <Card.Body>
      <p>You can restore an older version of this profile in two ways:</p>

      <p>
        <b>Restore as New Version</b> restores the selected version’s content as a new latest version while keeping the
        full history intact.
      </p>
      <p>
        <b>Reset to This Version</b> permanently removes all newer versions and resets the profile history to the
        selected version.
      </p>
      <Container fluid className="mt-3">
        <Row>
          {/* Left side: version list */}
          <Col md={4}>
            <Card>
              <Card.Header>Versions</Card.Header>
              <ListGroup style={{maxHeight: "450px", overflowY: "auto"}} variant="flush">
                {versions.map((item) => (
                  <ListGroup.Item
                    key={item.profile_version}
                    action
                    active={selectedVersion?.profile_version === item.profile_version}
                    onClick={() => setSelectedVersion(item)}
                  >
                    Version: <b>{item.profile_version}</b><br/> {new Date(item.at).toLocaleString()}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>

          {selectedVersion && (
            <Col md={8}>
              <Card>
                <Card.Header>Details</Card.Header>
                <Card.Body>
                  <h4>{selectedVersion.profile_version}</h4>
                  <p>Date: {new Date(selectedVersion.at).toLocaleString()}</p>

                  <h5>Changes</h5>
                  <JsonPatchHistoryViewer history={selectedVersion.diff}/>
                  <Button variant="success"
                          onClick={() => restoreHandler(false)}>Restore as New Version</Button>
                  <Button variant="danger"
                          onClick={() => restoreHandler(true)}>Reset to This Version</Button>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Container>
    </Card.Body>
  </Card>)
}
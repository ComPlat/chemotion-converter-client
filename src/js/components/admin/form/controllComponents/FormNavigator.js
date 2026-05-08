import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Tabs, Tab, Col, Card, Form, InputGroup} from "react-bootstrap";
import OutputTables from "./DataTables/DataTables";
import {CheckIdentifier, MetadataIdentifier} from "./Identifier";
import OntologyManager from "./Ontology";
import ReactionVariations from "./ReactionVariations";
import {getDataset} from "../../../../utils/profileUtils";
import {useAdminApp} from "../../AppContext";
import ProfileHistory from "../common/ProfileHistory";

function ProfileBasics() {
  const {profile, updateProfile: setProfile} = useAdminApp();
  const [software, setSoftware] = useState(profile.software);
  const [devices, setDevices] = useState(profile.devices);

  useEffect(() => {
    setSoftware(profile.software);
  }, [profile.software]);

  useEffect(() => {
    setDevices(profile.devices);
  }, [profile.devices]);

  const onRootPropertyChange = (e) => {
    const {name, value} = e.target;
    setProfile({...profile, [name]: value});
  }

  const updateSoftwareOrDevice = (e) => {
    const {name, value} = e.target;
    if (name === "software") {
      setSoftware(value);
    } else if (name === "devices") {
      setDevices(value);
    }
    const listValue = value ? value.split(',').map(s => s.trim()) : []
    setProfile({...profile, [name]: listValue});
  }

  return (<Card>
    <Card.Header>
      Profile
    </Card.Header>
    <Card.Body>
      <Form.Group controlId="profile-title">
        <Form.Label column="lg">Title</Form.Label>
        <Form.Control size="sm"
                      name="title"
                      onChange={onRootPropertyChange}
                      value={profile.title}/>
        <Form.Text>Please add a title for this profile.</Form.Text>
      </Form.Group>
      <p>Profile version: {profile.profile_version}</p>
      <p>Converter version: {profile.converter_version ?? '?'}</p>

      <Form.Group controlId="profile-description" className="mt-3">
        <Form.Label column="lg">Description</Form.Label>
        <Form.Control as="textarea" size="sm" rows="3"
                      name="description"
                      onChange={onRootPropertyChange}
                      value={profile.description}/>
        <Form.Text>Please add a description for this profile.</Form.Text>
      </Form.Group>
      <InputGroup>
        <InputGroup.Text>Software</InputGroup.Text>
        <Form.Control
          size="sm"
          name="software"
          value={software}
          onChange={updateSoftwareOrDevice}
        />
        <InputGroup.Text>Devices</InputGroup.Text>
        <Form.Control
          size="sm"
          name="devices"
          value={devices}
          onChange={updateSoftwareOrDevice}
        />
      </InputGroup>
    </Card.Body>
  </Card>)
}

export default function FormNavigatorCol({activeTabKey, setActiveTabKey, tableIdx}) {
  const {profile, datasets} = useAdminApp();
  const dataset = getDataset(profile, datasets);

  return (
    <Col md={5}>
      <div className="scroll">
        <Tabs activeKey={activeTabKey}
              onSelect={(k) => setActiveTabKey(k)}
              id="main-form-tabs"
              className="mb-3">

          <Tab eventKey="basics" title="Basics">
            <ProfileBasics/>
            <br/>
            <ProfileHistory />
          </Tab>

          <Tab eventKey="ontology" title="Ontology">
            <OntologyManager dataset={dataset}/>
          </Tab>

          <Tab eventKey="identifier" title="Identifier">
            <CheckIdentifier dataset={dataset}
                             tableIdx={tableIdx}/>
          </Tab>

          <Tab eventKey="data" title="Data tables">
            <OutputTables tableIdx={tableIdx}/>
          </Tab>

          <Tab eventKey="metadata" title="Metadata">
            <MetadataIdentifier dataset={dataset}
                                tableIdx={tableIdx}/>
          </Tab>

          <Tab eventKey="reactionVariations" title="Reaction Variations values">
            <ReactionVariations tableIdx={tableIdx}/>
          </Tab>
        </Tabs>
      </div>
    </Col>
  )
}

FormNavigatorCol.propTypes = {
  activeTabKey: PropTypes.string.isRequired,
  setActiveTabKey: PropTypes.func.isRequired,
  tableIdx: PropTypes.number.isRequired
};

import React, {useState} from "react";
import PropTypes from "prop-types";
import {Tabs, Tab, Col, Card, Form, InputGroup} from "react-bootstrap";
import OutputTables from "./DataTables";
import {CheckIdentifier, MetadataIdentifier} from "./Identifier";
import OntologyManager from "./Ontology";
import SIunits from "./SIunits";
import {getDataset} from "../../../../utils/profileUtils";

const profileShape = PropTypes.shape({
  title: PropTypes.string,
  description: PropTypes.string,
  software: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  devices: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
  subjectInstances: PropTypes.object,
  subjects: PropTypes.array,
  predicates: PropTypes.array,
  identifiers: PropTypes.array,
  tables: PropTypes.array,
  ols: PropTypes.string
});


function ProfileBasics({profile, setProfile}) {
  const [software, setSoftware] = useState(profile.software);
  const [devices, setDevices] = useState(profile.devices);
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

ProfileBasics.propTypes = {
  profile: profileShape.isRequired,
  setProfile: PropTypes.func.isRequired
};

export default function FormNavigatorCol({profile, setProfile, options, datasets, activeTabKey, setActiveTabKey}) {
  const dataset = getDataset(profile, datasets);

  return (
    <Col md={5}>
      <div className="scroll">
        <Tabs activeKey={activeTabKey}
              onSelect={(k) => setActiveTabKey(k)}
              id="main-form-tabs"
              className="mb-3">

          <Tab eventKey="basics" title="Basics">
            <ProfileBasics profile={profile} setProfile={setProfile}/>
          </Tab>

          <Tab eventKey="ontology" title="Ontology">
            <OntologyManager profile={profile} setProfile={setProfile} options={options} datasets={datasets}
                             dataset={dataset}/>
          </Tab>

          <Tab eventKey="identifier" title="Identifier">
            <CheckIdentifier profile={profile} setProfile={setProfile} options={options} dataset={dataset}/>
          </Tab>

          <Tab eventKey="data" title="Data tables">
            <OutputTables profile={profile} setProfile={setProfile} options={options}/>
          </Tab>

          <Tab eventKey="metadata" title="Metadata">
            <MetadataIdentifier profile={profile} setProfile={setProfile} options={options} dataset={dataset}/>
          </Tab>

          <Tab eventKey="siUnits" title="SI Units">
            <SIunits profile={profile}/>
          </Tab>
        </Tabs>
      </div>
    </Col>
  )
}

FormNavigatorCol.propTypes = {
  profile: profileShape.isRequired,
  setProfile: PropTypes.func.isRequired,
  options: PropTypes.object,
  datasets: PropTypes.array,
  activeTabKey: PropTypes.string.isRequired,
  setActiveTabKey: PropTypes.func.isRequired
};

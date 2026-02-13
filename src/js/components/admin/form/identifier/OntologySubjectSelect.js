import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Form, Col, Row, OverlayTrigger, Popover} from 'react-bootstrap';
import {checkTIB, OntologyAsyncSelect, ontologySchemaToOption} from "../common/TibFetchService";
import Select from "react-select";

const labelToInstanceOption = (instanceOption) => {
  if (!instanceOption) {
    return null;
  }

  return {
    value: instanceOption,
    label: instanceOption
  }
}

const prepareInstanceOptions = (instanceOptions, key, subjects) => {
  if (!key || !instanceOptions || !instanceOptions[key]) {
    return [];
  }
  const instancesList = [...instanceOptions[key]];
  const nextNum = instancesList.reduce((acc, str) => {
    let num = parseInt(str.name.match(/\d+$/)?.[0] || NaN, 10);
    if (isNaN(num)) {
      return acc;
    }
    return Math.max(num, acc);
  }, 0);
  const oboId = subjects.find((sub) => sub.id === key).obo_id;
  const instancesListOptions = instancesList.map((x) => labelToInstanceOption(x.name));
  instancesListOptions.push({
    label: `New Instance: ${oboId} ${nextNum + 1}`,
    value: `${oboId} ${nextNum + 1}`
  });
  return instancesListOptions;
}

const OntologySubjectSelect = ({instance, updateOntology, dataset, subjects, datatypes, subjectInstances, options}) => {
  const [checkResult, setCheckResult] = useState(null); // null = not checked yet

  useEffect(checkTIB(setCheckResult), []);
  // Loading state
  if (checkResult === null) {
    return <p>Loading...</p>;
  }

  if (!checkResult) {
    return <p>We are very sorry, but the TIB Terminology Service is currently unavailable.</p>
  }
  const {rdf} = options;
  return (
    <>
      <Row>
        <Col>
          <Form.Group controlId={`OntologySubjectInput`}>
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Popover id="header-popover-select-info">
                  <Popover.Header as="h3">
                    Subject Term
                  </Popover.Header>
                  <Popover.Body>Adding a subject is optional. If nothing is selected, the subject will be the actual
                    measurement {dataset?.ols || 'OBI:0000070'}. When a new subject has been created, the predicates
                    with which the measurement is associated
                    with the new subject must be determined before the profile can be saved.
                  </Popover.Body>
                </Popover>
              }
            >
              <Form.Label column="sm">Subject Term:</Form.Label>
            </OverlayTrigger>
            <OntologyAsyncSelect
              additionalOptions={rdf}
              defaultOptions
              onChange={(event) =>
                updateOntology({
                  ontology: event?.value,
                  type: "subject",
                  instance: event ? `${event.value.obo_id} 1` : null
                })
              }
              placeholder={dataset?.ols ? `Measurement: ${dataset.ols}` : 'Measurement: Assay (OBI:0000070)'}
              value={ontologySchemaToOption(instance.subject?.id, subjects)}
            />
          </Form.Group>
        </Col>
      </Row>
      {instance.subject?.id &&
        <Row>
          <Col>
            <Form.Group controlId={`OntologySubjectInstanceInput`}>
              <OverlayTrigger
                placement="bottom"
                overlay={
                  <Popover id="header-popover-select-info">
                    <Popover.Header as="h3">
                      Subject Instance
                    </Popover.Header>
                    <Popover.Body>If there are multiple instances of the same subject, please select the current
                      instance for this
                      object/value in this section. However, it is important to manage the predicates in the way that
                      the
                      instances are connected to the measurement.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Form.Label column="sm">Subject Instance:</Form.Label>
              </OverlayTrigger>
              <Select
                isDisabled={!instance.subject}
                isLoading={false}
                isClearable={false}
                isRtl={false}
                name="instance"
                options={prepareInstanceOptions(subjectInstances, instance.subject?.id, subjects)}
                value={labelToInstanceOption(instance.subject?.subjectInstance)}
                onChange={(event) =>
                  updateOntology({
                    instance: event?.value
                  })
                }
              />
            </Form.Group>
          </Col>
        </Row>
      }
      <Row>
        <Col>
          <Form.Group controlId={`OntologyDatatypeInput`}>
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Popover id="header-popover-select-info">
                  <Popover.Header as="h3">
                    Unit/Datatype Term
                  </Popover.Header>
                  <Popover.Body>Adding a Unit/Datatype is optional. The datatype should be either a unit like "Voltage"
                    or a
                    datatype like "xsd:double"
                  </Popover.Body>
                </Popover>
              }
            >
              <Form.Label column="sm">Unit/Datatype Term:</Form.Label>
            </OverlayTrigger>
            <OntologyAsyncSelect
              defaultOptions
              additionalOptions={rdf}
              onChange={(event) =>
                updateOntology(
                  {
                    ontology: event?.value,
                    type: "datatype"
                  })
              }
              placeholder="Search for a datatype..."
              value={ontologySchemaToOption(instance.datatype?.id, datatypes)}
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  )
}

OntologySubjectSelect.propTypes = {
  instance: PropTypes.object,
  options: PropTypes.object,
  updateOntology: PropTypes.func,
  dataset: PropTypes.object,
  subjects: PropTypes.array,
  datatypes: PropTypes.array,
  subjectInstances: PropTypes.object
}

export default OntologySubjectSelect

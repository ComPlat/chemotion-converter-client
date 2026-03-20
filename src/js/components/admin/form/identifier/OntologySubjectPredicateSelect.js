import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Form, Col, Row, Container, Popover, OverlayTrigger} from 'react-bootstrap';
import {checkTIB, findOntologyById, OntologyAsyncSelect, ontologySchemaToOption} from "../common/TibFetchService";


const OntologySubjectPredicateSelect = ({
                                          updateSubjectInstances,
                                          subjects,
                                          predicates,
                                          subjectInstances,
                                          options,
                                          datasetId
                                        }) => {
  const [checkResult, setCheckResult] = useState(null); // null = not checked yet

  useEffect(checkTIB(setCheckResult), []);
  // Loading state
  if (checkResult === null) {
    return <p>Loading...</p>;
  }

  if (!checkResult) {
    return <p>We are very sorry, but the TIB Terminology Service is currently unavailable.</p>
  }

  if (Object.keys(subjectInstances).length === 0) {
    return <p>No subjects found.</p>;
  }
  const {rdf} = options;

  const mainForm = Object.entries(subjectInstances).map(([subjectId, instances]) => {
    const subject = findOntologyById(subjectId, subjects);

    return <div key={`ID_${subjectId}`}><Row>
      <Col>
        <h6 className="mb-0 mt-3">{subject.label}</h6>
        <small style={{display: 'block', margin: '-2px 0 0 2px'}}>{subject.obo_id}</small>
      </Col>
    </Row>
      {instances.map((instance) => {
        return <Row key={`${subjectId}__${instance.name}`}>
          <Col>
            <Form.Group controlId={`${subjectId}__${instance.name}`}>
              <OverlayTrigger
                placement="left"
                overlay={
                  <Popover id="header-popover-select-info">
                    <Popover.Header as="h3">
                      Ontology Term to describe the Predicate
                    </Popover.Header>
                    <Popover.Body>
                      <h5>What is a Predicate?</h5>

                      <p>In an RDF graph, a predicate describes the relationship between two things.
                        It connects a subject (what you’re talking about) to an object (what you’re saying about
                        it).</p>

                      <p>You can think of a predicate like a verb in a sentence.</p>

                      <p>Example:</p>
                      <ul>
                        <li>Subject → <br/><b>{datasetId}</b></li>

                        <li>Predicate → <br/><b>{instance.predicate}</b></li>

                        <li>Object → <br/><b>{instance.name}</b></li>
                      </ul>
                      The predicate “{instance.predicate}” tells you how the two entities are related.
                    </Popover.Body>
                  </Popover>
                }
              >
                <Form.Label column="sm">Predicate For <b>{instance.name}:</b></Form.Label>
              </OverlayTrigger>

              <OntologyAsyncSelect
                defaultOptions
                additionalOptions={rdf}
                isClearable={false}
                onChange={(event) => {
                  instance.predicate = event.value.id;
                  updateSubjectInstances(subjectInstances, event.value);
                }}
                placeholder="Search for a property..."
                value={ontologySchemaToOption(instance.predicate, predicates)}
              />
            </Form.Group>
          </Col>
        </Row>
      })}

    </div>
  })

  return (
    <Container>
      <Row>
        <Col><p>The predicate for the subject instances specifies how the instances are connected to the main
          class: {datasetId}.</p></Col>
      </Row>
      {mainForm}
    </Container>
  )
}

OntologySubjectPredicateSelect.propTypes = {
  options: PropTypes.object.isRequired,
  subjects: PropTypes.array.isRequired,
  predicates: PropTypes.array.isRequired,
  subjectInstances: PropTypes.object.isRequired,
  updateSubjectInstances: PropTypes.func.isRequired,
  datasetId: PropTypes.string.isRequired
}

export default OntologySubjectPredicateSelect

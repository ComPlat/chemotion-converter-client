import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Form, Col, Row, Container} from 'react-bootstrap';
import {checkTIB, findOntologyById, OntologyAsyncSelect, ontologySchemaToOption} from "../common/TibFetchService";


const OntologySubjectPredicateSelect = ({updateSubjectInstances, subjects, predicates, subjectInstances, options}) => {
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
              <Form.Label column="sm">Predicate For <b>{instance.name}:</b></Form.Label>
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
        <Col><p>The predicate for the subject instances specifies how the instances are connected to the actual
          measurement.</p></Col>
      </Row>
      {mainForm}
    </Container>
  )
}

OntologySubjectPredicateSelect.propTypes = {
  options: PropTypes.object,
  dataset: PropTypes.object,
  subjects: PropTypes.array,
  predicates: PropTypes.array,
  subjectInstances: PropTypes.object,
  updateSubjectInstances: PropTypes.func,
}

export default OntologySubjectPredicateSelect

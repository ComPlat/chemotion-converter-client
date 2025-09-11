import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Form, Col, Row} from 'react-bootstrap';
import {checkTIB, OntologyAsyncSelect, ontologySchemaToOption} from "../common/TibFetchService";


const OntologyTermSelect = ({term, updateOntology, predicates, options}) => {
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
    <Row>
      <Col>
        <Form.Group controlId={`OntologyTermInput`}>
          <Form.Label column="sm">Ontology Term to describe the Predicate:</Form.Label>
          <p><small> Assign an object ontology term to the property. If the selected term is already assigned
            to <b>one</b> field in the chosen dataset, the output layer and output field will be selected automatically.</small>
          </p>


          <OntologyAsyncSelect
            defaultOptions
            additionalOptions={rdf}
            onChange={(event) => {
              updateOntology({
                ontology: event?.value,
                type: "predicate"
              })
            }}
            placeholder="Search for a property..."
            value={ontologySchemaToOption(term?.id, predicates)}
          />
        </Form.Group>
      </Col>
    </Row>
  )
}

OntologyTermSelect.propTypes = {
  term: PropTypes.object,
  options: PropTypes.object,
  updateOntology: PropTypes.func,
  dataset: PropTypes.object,
  predicate: PropTypes.array
}

export default OntologyTermSelect

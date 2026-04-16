import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Col, Form, OverlayTrigger, Popover, Row} from 'react-bootstrap';
import {checkTIB, OntologyAsyncSelect, ontologySchemaToOption} from "../common/TibFetchService";


const OntologyPredicateSelect = ({term, updateOntology, predicates, options}) => {
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
          <OverlayTrigger
            placement="left"
            overlay={
              <Popover id="header-popover-select-info">
                <Popover.Header as="h3">
                  Ontology Term to describe the Predicate
                </Popover.Header>
                <Popover.Body>
                  <p><b>If left blank, the object is used as a connection between the subject and the value
                    (literal)</b></p>
                  <h5>What is a Predicate?</h5>

                  <p>In an RDF graph, a predicate describes the relationship between two things.
                    It connects a subject (what you’re talking about) to an object (what you’re saying about it).</p>

                  <p>You can think of a predicate like a verb in a sentence.</p>

                  <p>Example:
                    “Reaction1 usedPreparation PreparationA”</p>
                  <ul>
                    <li>Reaction1 → subject</li>

                    <li>usedPreparation → predicate</li>

                    <li>PreparationA → object</li>
                  </ul>
                  The predicate “usedPreparation” tells you how the two entities are related.
                </Popover.Body>
              </Popover>
            }
          >
            <Form.Label column="sm">Ontology Term to describe the Predicate [OPTIONAL]:</Form.Label>
          </OverlayTrigger>
          <OntologyAsyncSelect
            preferredType="property"
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

OntologyPredicateSelect.propTypes = {
  term: PropTypes.object,
  options: PropTypes.object,
  updateOntology: PropTypes.func,
  predicates: PropTypes.array
}

export default OntologyPredicateSelect

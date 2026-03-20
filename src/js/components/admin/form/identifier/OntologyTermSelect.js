import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {Form, Col, Row, Popover, OverlayTrigger} from 'react-bootstrap';
import {checkTIB, OntologyAsyncSelect, ontologySchemaToOption} from "../common/TibFetchService";


const OntologyTermSelect = ({term, updateOntology, objects, options}) => {
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
                  Ontology Term to describe the Object
                </Popover.Header>
                <Popover.Body>
                  <h5>What is a Object?</h5>

                  <p>In an RDF graph, the object is the value or entity that the subject is connected to.
                    A subject (what you’re talking about) is connected to an object (what you’re saying about it).</p>

                  <p>You can think of the object as the result or target of the relationship.</p>

                  <p>Example:
                    “Reaction1 usedPreparation PreparationA”</p>
                  <ul>
                    <li>Reaction1 → subject</li>

                    <li>usedPreparation → predicate</li>

                    <li>PreparationA → object</li>
                  </ul>
                  The object tells you what the subject is related to.


                  <p>Assign an object ontology term to the property. If the selected term is already assigned
                    to <b>one</b> field in the chosen dataset, the output layer and output field will be selected</p>
                  automatically.
                </Popover.Body>
              </Popover>
            }
          >
            <Form.Label column="sm">Ontology Term to describe the Object:</Form.Label>
          </OverlayTrigger>

          <OntologyAsyncSelect
            defaultOptions
            additionalOptions={rdf}
            onChange={(event) => {
              updateOntology({
                ontology: event?.value,
                type: "object"
              })
            }}
            placeholder="Search for a property..."
            value={ontologySchemaToOption(term?.id, objects)}
          />
        </Form.Group>
      </Col>
    </Row>
  )
}

OntologyTermSelect.propTypes = {
  term: PropTypes.object.isRequired,
  options: PropTypes.object.isRequired,
  updateOntology: PropTypes.func.isRequired,
  objects: PropTypes.array.isRequired
}

export default OntologyTermSelect

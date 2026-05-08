import React, {useMemo, useState} from "react"
import PropTypes from 'prop-types';
import {Button, Col, Form, Row, Tab, Tabs} from 'react-bootstrap';

import KeyInput from './identifier/KeyInput'
import KeySelect from './identifier/KeySelect'
import LineNumberInput from './identifier/LineNumberInput'
import MatchSelect from './identifier/MatchSelect'
import OperatorSelect from './common/OperatorSelect'
import OutputKeyInput from './identifier/OutputKeyInput'
import OutputLayerInput from './identifier/OutputLayerInput'
import OutputTableIndexSelect from './identifier/OutputTableIndexSelect'
import OntologyTermSelect from './identifier/OntologyTermSelect'
import OntologySubjectSelect from "./identifier/OntologySubjectSelect";
import TableIndexInput from './identifier/TableIndexInput'
import TableIndexSelect from './identifier/TableIndexSelect'
import ValueInput from './identifier/ValueInput'
import OntologyPredicateSelect from "./identifier/OntologyPredicateSelect";


function CommonIdentifierInput({
                                 index,
                                 identifier,
                                 fileMetadataOptions,
                                 tableMetadataOptions,
                                 inputTables,
                                 updateIdentifier
                               }) {

  return (
    <>
      <Row className="mb-3">
        {(identifier.type === 'fileMetadata' || identifier.type === 'tableMetadata') && (
          <Col>
            {fileMetadataOptions.length > 0 ? (
              <KeySelect
                index={index}
                identifier={identifier}
                fileMetadataOptions={fileMetadataOptions}
                tableMetadataOptions={tableMetadataOptions}
                updateIdentifier={updateIdentifier}
              />
            ) : (
              <KeyInput
                index={index}
                identifier={identifier}
                updateIdentifier={updateIdentifier}
              />
            )}
          </Col>
        )}
      </Row>

      {(identifier.type === 'tableHeader') && (
        <Row className="mb-3">
          <Col md={10}>
            {inputTables.length > 0 ? (
              <TableIndexSelect index={index} identifier={identifier} tables={inputTables}
                                updateIdentifier={updateIdentifier}/>
            ) : (
              <TableIndexInput index={index} identifier={identifier}
                               updateIdentifier={updateIdentifier}/>
            )}
          </Col>

          <Col md={2}>
            <LineNumberInput index={index} identifier={identifier} updateIdentifier={updateIdentifier}/>
          </Col>
        </Row>
      )}

    </>
  )

}

function IdentifierInput({
                           index,
                           identifier,
                           fileMetadataOptions,
                           tableMetadataOptions,
                           inputTables,
                           updateIdentifier
                         }) {
  const valueDisabled = identifier.match === 'any'

  return (
    <form>
      <CommonIdentifierInput
        index={index}
        identifier={identifier}
        fileMetadataOptions={fileMetadataOptions}
        tableMetadataOptions={tableMetadataOptions}
        inputTables={inputTables}
        updateIdentifier={updateIdentifier}
      />

      <Row className="mb-3">
        <Col md={4}>
          <MatchSelect index={index} identifier={identifier} updateIdentifier={updateIdentifier}/>
        </Col>
        <Col md={8}>
          <ValueInput index={index} identifier={identifier} updateIdentifier={updateIdentifier}
                      disabled={valueDisabled}/>
        </Col>
      </Row>

    </form>
  )

}

IdentifierInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  fileMetadataOptions: PropTypes.array,
  tableMetadataOptions: PropTypes.array,
  inputTables: PropTypes.array,
  updateIdentifier: PropTypes.func,
}

function DatatableIdentifierInput({
                                   index,
                                   identifier,
                                   fileMetadataOptions,
                                   tableMetadataOptions,
                                   inputTables,
                                   updateIdentifier,
                                   updateRegex = null,
                                 }) {
  const matchResult = useMemo(() => updateRegex && updateRegex({...identifier}), [Object.keys(identifier)]);


  return (
    <>
      <CommonIdentifierInput
        index={index}
        identifier={identifier}
        fileMetadataOptions={fileMetadataOptions}
        tableMetadataOptions={tableMetadataOptions}
        inputTables={inputTables}
        updateIdentifier={updateIdentifier}
      />

      <Form.Check
        type="checkbox"
        label="Enable Regular expression"
        checked={identifier.match === 'regex'}
        onChange={(e) => updateIdentifier(index, {match: e.currentTarget.checked ? 'regex' : 'any'})}
      />
      {identifier.match === 'regex' && (<Form.Group controlId={`valueInput${index}`}>
        <Form.Label column="lg">Regex</Form.Label>
        <Form.Control
          size="sm"
          value={identifier.value || ''}
          onChange={(event) => updateIdentifier(index, {value: event.target.value})}
        />
      </Form.Group>)}


      {matchResult &&
        (<Row><Col>
          {matchResult}
        </Col></Row>)
      }

    </>
  )

}

DatatableIdentifierInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  fileMetadataOptions: PropTypes.array,
  tableMetadataOptions: PropTypes.array,
  inputTables: PropTypes.array,

  updateIdentifier: PropTypes.func,
  updateRegex: PropTypes.func,
}



function MetadataIdentifierInput({
                                   index,
                                   identifier,
                                   fileMetadataOptions,
                                   tableMetadataOptions,
                                   inputTables,
                                   outputTables,
                                   updateIdentifier,
                                   updateIdentifierOntology,
                                   updateIdentifierOperation,
                                   removeIdentifierOperation,
                                   dataset,
                                   profile,
                                   options,
                                   updateRegex = null,
                                   addIdentifierOperation = null
                                 }) {
  const [activeOutputTab, setActiveOutputTab] = useState('dataset')

  return (
    <form>

      <DatatableIdentifierInput
        index={index}
        identifier={identifier}
        fileMetadataOptions={fileMetadataOptions}
        tableMetadataOptions={tableMetadataOptions}
        inputTables={inputTables}
        updateIdentifier={updateIdentifier}
        updateRegex={updateRegex}
      />

      {addIdentifierOperation && (
        <Row><Col>
          <Button
            className="mt-1"
            variant="success"
            size="sm"
            onClick={() => addIdentifierOperation(index)}
          >
            Add scalar operation
          </Button>
          <p></p>
        </Col></Row>
      )}

      {Array.isArray(identifier.operations) && identifier.operations.map((operation, opIndex) => (
        <Row key={opIndex} className="mb-3">
          <Form.Group as={Col} sm={4} controlId={`identifierOperationOperator${index}${opIndex}`}>
            <Form.Label column="sm">Operator</Form.Label>
            <OperatorSelect
              value={operation.operator}
              onChange={value => updateIdentifierOperation(index, opIndex, 'operator', value)}
            />
          </Form.Group>

          <Form.Group as={Col} sm={7} controlId={`identifierOperationValue${index}${opIndex}`}>
            <Form.Label column="sm">Value</Form.Label>
            <Form.Control
              size="sm"
              value={operation.value || ''}
              onChange={event => updateIdentifierOperation(index, opIndex, 'value', event.target.value)}
            />
          </Form.Group>

          <Col sm={1} className="d-flex align-items-end justify-content-end">
            <Button variant="danger" size="sm"
                    onClick={() => removeIdentifierOperation(index, opIndex)}>
              &times;
            </Button>
          </Col>
        </Row>
      ))}
      <h3>Output</h3>
      <Tabs activeKey={activeOutputTab}
            onSelect={(k) => setActiveOutputTab(k)}
            id="main-form-tabs"
            className="mb-3">

        <Tab eventKey="dataset" title="Dataset">
          <Form.Check
            type="checkbox"
            onChange={(e) => updateIdentifier(index, {'isDatasetOutput': e.target.checked})}
            checked={identifier.isDatasetOutput}
            label={`Enable output in the dataset`}/>
          {identifier.isDatasetOutput && (<Row className="mb-3">
            <Col sm={6}>
              <OutputLayerInput index={index} identifier={identifier}
                                updateIdentifier={updateIdentifier} dataset={dataset}/>
            </Col>
            <Col sm={6}>
              <OutputKeyInput index={index} identifier={identifier}
                              updateIdentifier={updateIdentifier} dataset={dataset}/>
            </Col>
          </Row>)}
        </Tab>

        <Tab eventKey="data" title="Datatables">
          <Form.Check
            type="checkbox"
            onChange={(e) => updateIdentifier(index, {'isDatatableOutput': e.target.checked})}
            checked={identifier.isDatatableOutput}
            label={`Enable output in datatables`}/>
          {identifier.isDatatableOutput && (<Row>
            <Col sm={6}>
              <OutputTableIndexSelect
                index={index}
                identifier={identifier}
                tables={outputTables}
                updateIdentifier={updateIdentifier}
              />
            </Col>
            <Col sm={6}>

              <Form.Check
                type="checkbox"
                onChange={(e) => updateIdentifier(index, {'isLoobDatatableOutput': e.target.checked})}
                checked={identifier.isLoobDatatableOutput || false}
                label={`If this option is checked, the value from the corresponding input table is used. If it is not checked, it uses the value selected by the origin identifier.`}/>

              <OutputKeyInput index={index} identifier={identifier}
                              updateIdentifier={updateIdentifier} dataset={dataset}/>
            </Col>
          </Row>)}
        </Tab>

        <Tab eventKey="ontology" title="Rdf Graph">
          <Form.Check
            type="checkbox"
            onChange={(e) => updateIdentifier(index, {'isRdfOutput': e.target.checked})}
            checked={identifier.isRdfOutput}
            label={`Enable output in rdf graph`}/>
          {identifier.isRdfOutput && (<>
            <p>We use the TIB Terminology Service to allow you to assign an ontology terms to
              properties.</p>
            <OntologyTermSelect term={identifier.object} predicate={identifier.predicate}
                                objects={profile.objects} options={options}
                                updateOntology={(a) => updateIdentifierOntology(index, a)}/>
            <OntologyPredicateSelect term={identifier.predicate}
                                     predicates={profile.predicates} options={options}
                                     updateOntology={(a) => updateIdentifierOntology(index, a)}/>
            <OntologySubjectSelect instance={identifier} dataset={dataset}
                                   subjects={profile.subjects} datatypes={profile.datatypes}
                                   subjectInstances={profile.subjectInstances} options={options}
                                   updateOntology={(a) => updateIdentifierOntology(index, a)}/>
          </>)}
        </Tab>
      </Tabs>

    </form>
  )

}

MetadataIdentifierInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  options: PropTypes.object,
  fileMetadataOptions: PropTypes.array,
  tableMetadataOptions: PropTypes.array,
  inputTables: PropTypes.array,
  outputTables: PropTypes.array,
  dataset: PropTypes.object,
  updateIdentifier: PropTypes.func,
  updateIdentifierOperation: PropTypes.func,
  removeIdentifierOperation: PropTypes.func,
  updateRegex: PropTypes.func,
  updateIdentifierOntology: PropTypes.func,
  addIdentifierOperation: PropTypes.func,
  profile: PropTypes.object,
}

export {IdentifierInput, MetadataIdentifierInput, DatatableIdentifierInput}

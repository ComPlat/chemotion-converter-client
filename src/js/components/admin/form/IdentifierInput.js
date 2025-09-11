import React, {Component} from "react"
import PropTypes from 'prop-types';
import {Button, Col, Form, Row} from 'react-bootstrap';

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

class IndentifierInput extends Component {

    render() {
        const {
            index, identifier, fileMetadataOptions, tableMetadataOptions,
            inputTables, outputTables, updateIdentifier, updateIdentifierOntology,
            updateIdentifierOperation, removeIdentifierOperation, dataset, profile, options,
        } = this.props
        const valueDisabled = identifier.match === 'any'

        return (
            <form>
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

                <Row className="mb-3">
                    <Col md={4}>
                        <MatchSelect index={index} identifier={identifier} updateIdentifier={updateIdentifier}/>
                    </Col>
                    <Col md={8}>
                        <ValueInput index={index} identifier={identifier} updateIdentifier={updateIdentifier}
                                    disabled={valueDisabled}/>
                    </Col>
                </Row>

                {identifier.optional && (<>
                        <Row>
                            <Col>
                                <h4>Output Dataset</h4>
                            </Col>
                        </Row>
                        <Row className="mb-3">
                            <Col sm={4}>
                                <OutputTableIndexSelect
                                    index={index}
                                    identifier={identifier}
                                    tables={outputTables}
                                    updateIdentifier={updateIdentifier}
                                />
                            </Col>
                            <Col sm={4}>
                                <OutputLayerInput index={index} identifier={identifier}
                                                  updateIdentifier={updateIdentifier} dataset={dataset}/>
                            </Col>
                            <Col sm={4}>
                                <OutputKeyInput index={index} identifier={identifier}
                                                updateIdentifier={updateIdentifier} dataset={dataset}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <h4>Output Ontology</h4>
                                <p>We use the TIB Terminology Service to allow you to assign an ontology terms to
                                    properties.</p>
                            </Col>
                        </Row>
                        <OntologyTermSelect term={identifier.predicate}
                                            predicates={profile.predicates} options={options}
                                            updateOntology={(a) => updateIdentifierOntology(index, a)}></OntologyTermSelect>
                        <OntologySubjectSelect instance={identifier} dataset={dataset}
                                               subjects={profile.subjects} datatypes={profile.datatypes}
                                               subjectInstances={profile.subjectInstances} options={options}
                                               updateOntology={(a) => updateIdentifierOntology(index, a)}></OntologySubjectSelect>
                    </>
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
            </form>
        )
    }

}

IndentifierInput.propTypes = {
    index: PropTypes.number,
    identifier: PropTypes.object,
    options: PropTypes.object,
    fileMetadataOptions: PropTypes.array,
    tableMetadataOptions: PropTypes.array,
    inputTables: PropTypes.array,
    outputTables: PropTypes.array,
    dataset: PropTypes.object,
    updateIdentifier: PropTypes.func,
    removeIdentifier: PropTypes.func,
    updateIdentifierOntology: PropTypes.func,
    profile: PropTypes.object,
}

export default IndentifierInput

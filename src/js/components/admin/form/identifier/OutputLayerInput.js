import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { sortBy } from 'lodash';

const OutputLayerInput = ({ index, identifier, updateIdentifier, dataset }) => {

  if (dataset && dataset['layers']) {
    const sls = sortBy(dataset['layers'], l => l.position);
    const dsOpt = sls && sls.map(e => ({ value: e.key, label: e.label }));

    return (
      <Form.Group controlId={`outputLayerInput${index}`}>
        <Form.Label>Output layer</Form.Label>
        <Select
          id={`outputLayerInput${index}`}
          isDisabled={false}
          isLoading={false}
          isClearable={false}
          isRtl={false}
          name="s-dataset"
          onChange={(event) => updateIdentifier(index, { outputLayer: event.value })}
          options={dsOpt}
          value={dsOpt.find(o => o.value == identifier.outputLayer)}
        />
      </Form.Group>
    )
  }

  return (
    <Form.Group controlId={`outputLayerInput${index}`}>
      <Form.Label>Output layer</Form.Label>
      <Form.Control
        size="sm"
        value={identifier.outputLayer || ''}
        onChange={(event) => updateIdentifier(index, { outputLayer: event.target.value })}
      />
    </Form.Group>
  )
}

OutputLayerInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func,
  dataset: PropTypes.object
}

export default OutputLayerInput

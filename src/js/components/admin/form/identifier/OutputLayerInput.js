import React, { Component } from "react"
import PropTypes from 'prop-types';
import Select from 'react-select';
import { sortBy } from 'lodash';

const OutputLayerInput = ({ index, identifier, updateIdentifier, dataset }) => {

  if (dataset && dataset['layers']) {
    const sls = sortBy(dataset['layers'], l => l.position);
    const dsOpt = sls && sls.map(e => ({ value: e.key, label: e.label }));

    return (
      <React.Fragment>
        <label className="sr-only" htmlFor={`outputLayerInput${index}`}>Output layer</label>
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
        <label className="mb-0" htmlFor={`outputLayerInput${index}`}><small>Output layer</small></label>
      </React.Fragment>
    )
  }
  return (
    <React.Fragment>
      <label className="sr-only" htmlFor={`outputLayerInput${index}`}>Output layer</label>
      <input
        type="text"
        id={`outputLayerInput${index}`}
        className="form-control input-sm"
        value={identifier.outputLayer || ''}
        onChange={(event) => updateIdentifier(index, { outputLayer: event.target.value })}
      />
      <label className="mb-0" htmlFor={`outputLayerInput${index}`}><small>Output layer</small></label>
    </React.Fragment>
  )
}

OutputLayerInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func,
  dataset: PropTypes.object
}

export default OutputLayerInput

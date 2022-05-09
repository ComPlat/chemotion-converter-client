import React, { Component } from "react"
import Select from 'react-select';
import { sortBy } from 'lodash';

const OutputLayerInput = ({ index, identifier, updateIdentifier, dataset }) => {

  if (dataset && dataset['layers']) {
    console.log(dataset['layers']);
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
        className="form-control form-control-sm"
        value={identifier.outputLayer}
        onChange={(event) => updateIdentifier(index, { outputLayer: event.target.value })}
      />
      <label className="mb-0" htmlFor={`outputLayerInput${index}`}><small>Output layer</small></label>
    </React.Fragment>
  )
}

export default OutputLayerInput

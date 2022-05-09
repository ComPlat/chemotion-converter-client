import React, { Component } from "react";
import Select from 'react-select';
import { sortBy } from 'lodash';

const OutputKeyInput = ({ index, identifier, updateIdentifier, dataset }) => {
  if (identifier.outputLayer && dataset && dataset['layers'] && dataset['layers'][identifier.outputLayer] && dataset['layers'][identifier.outputLayer]['fields']) {
    const dsOpt = dataset && dataset['layers'] &&  dataset['layers'][identifier.outputLayer] &&  dataset['layers'][identifier.outputLayer]['fields'] &&  dataset['layers'][identifier.outputLayer]['fields'].map(e => ({ value: e.field, label: e.label }));

    return (
      <React.Fragment>
        <label className="sr-only" htmlFor={`outputLayerInput${index}`}>Output key</label>
        <Select
          id={`outputKeyInput${index}`}
          isDisabled={false}
          isLoading={false}
          isClearable={false}
          isRtl={false}
          name="s-dataset"
          onChange={(event) => updateIdentifier(index, { outputKey: event.value })}
          options={dsOpt}
        />
        <label className="mb-0" htmlFor={`outputLayerInput${index}`}><small>Output key</small></label>
      </React.Fragment>
    )
  }

  return (
    <React.Fragment>
      <input
        type="text"
        id={`outputKeyInput${index}`}
        className="form-control form-control-sm"
        value={identifier.outputKey}
        onChange={(event) => updateIdentifier(index, { outputKey: event.target.value })}
      />
      <label className="mb-0" htmlFor={`outputLayerInput${index}`}><small>Output key</small></label>
    </React.Fragment>
  )
}

export default OutputKeyInput

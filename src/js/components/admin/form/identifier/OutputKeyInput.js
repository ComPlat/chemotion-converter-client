import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { sortBy } from 'lodash';

const OutputKeyInput = ({ index, identifier, updateIdentifier, dataset }) => {
  const fields = (dataset?.layers ?? {})[identifier.outputLayer]?.fields
  console.log(fields)

  return (
    <Form.Group controlId={`outputKeyInput${index}`}>
      <Form.Label>Output key</Form.Label>
      {fields !== undefined ? (
        <Select
          isDisabled={false}
          isLoading={false}
          isClearable={false}
          isRtl={false}
          name="s-dataset"
          onChange={(event) =>
            updateIdentifier(index, { outputKey: event.value })
          }
          options={fields.map((e) => ({ value: e.field, label: e.label }))}
          value={identifier.outputKey}
        />
      ) : (
        <Form.Control
          size="sm"
          value={identifier.outputKey || ""}
          onChange={(event) =>
            updateIdentifier(index, { outputKey: event.target.value })
          }
        />
      )}
    </Form.Group>
  )
}

OutputKeyInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func,
  dataset: PropTypes.object
}

export default OutputKeyInput

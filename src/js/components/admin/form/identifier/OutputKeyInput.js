import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { useAdminApp } from "../../AppContext";

const FieldDescription = ({ field, layer }) => {
  const { datasetUnits } = useAdminApp();

  if (!field) {
    return null;
  }

  const units = datasetUnits[field.option_layers];

  const details = () => {
    if (field.type === 'system-defined' && units) {
      return (
        <p>You can add an Metadata identifier for the unit. Default {units.label} unit is ({units.units[0]}). The output
          layer for the unit is <b>{layer.label}</b> and the key is <b>{field.label}(unit)</b></p>);
    }
    if (field.type === 'system-defined-unit' && units) {
      return (
        <p>The identifier must be one of the following <b>{units.label}</b> units: {units.units.join(', ')}</p>);
    }
  }

  return (
    <>
      <p>Field type:
        <b> {field.type}</b>
      </p>
      {details()}
    </>
  );
}

const OutputKeyInput = ({ index, identifier, updateIdentifier, dataset }) => {
  const layer = (dataset?.layers ?? {})[identifier.outputLayer];
  const { datasetUnits } = useAdminApp();
  const { dsOpt, currentField, value } = useMemo(() => {

    const fields = layer?.fields || [];
    const selectableFields = fields.reduce((acc, field) => {
      acc.push(field);
      if (field.type === 'system-defined') {
        const units = datasetUnits[field.option_layers];
        acc.push({
          ...field,
          type: 'system-defined-unit',
          label: `${field.label}(unit)`,
          field: `___unit___${field.field}`,
          enum: units.unit_keys
        });
      }
      return acc;
    }, []);
    const dsOpt = selectableFields.map((e) => ({ value: e.field, label: e.label, enum: e?.enum || null }))
    const currentField = selectableFields.find(o => o.field === identifier.outputKey);
    const value = currentField ? { value: currentField?.field, label: currentField?.label || '' } : null;
    return { dsOpt, currentField, value };
  }, [layer, identifier.outputKey])

  return (<>
    <Form.Group controlId={`outputKeyInput${index}`}>
      <Form.Label>Output key</Form.Label>
      {dsOpt ? (
        <Select
          isDisabled={false}
          isLoading={false}
          isClearable={false}
          isRtl={false}
          name="s-dataset"
          onChange={(event) =>
            updateIdentifier(index, { outputKey: event.value, outputEnum: event.enum })
          }
          options={dsOpt}
          value={value}
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
    <FieldDescription field={currentField} layer={layer}/>
  </>)
}

OutputKeyInput.propTypes = {
  index: PropTypes.number,
  identifier: PropTypes.object,
  updateIdentifier: PropTypes.func,
  dataset: PropTypes.object
}

export default OutputKeyInput

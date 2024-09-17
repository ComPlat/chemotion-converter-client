import React from "react"
import PropTypes from 'prop-types';
import { Col, Form, Row } from 'react-bootstrap';
import CreatableSelect from 'react-select/creatable';

const ExtendedHeaderInput = ({ optionKey, value, values, updateHeader }) => {
  let idx = values.indexOf(value);
  const options = values.map((x) => ({ value: x, label: x }));
  if (idx === -1) {
    if (value) options.unshift({ value: value, label: value });
    idx = 0;
  }

  return (
    <Form.Group as={Row} controlId={optionKey} className="align-items-baseline mb-1">
      <Form.Label as={Col} sm={4}>{optionKey}</Form.Label>
      <Col sm={8}>
        <CreatableSelect
          options={options}
          defaultValue={options[idx]}
          onChange={(v) => { updateHeader(optionKey, v.value) }} />
      </Col>
    </Form.Group>
  )
}

ExtendedHeaderInput.propTypes = {
  optionKey: PropTypes.string,
  value: PropTypes.string,
  values: PropTypes.array,
  updateHeader: PropTypes.func
}

export default ExtendedHeaderInput

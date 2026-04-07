import React from "react"
import PropTypes from 'prop-types';
import { Col, Form, Row } from 'react-bootstrap';
import CreatableSelect from 'react-select/creatable';

const ExtendedHeaderInput = ({ optionKey, value, values, updateHeader, leftElement }) => {
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
        <div className="d-flex gap-2 align-items-start">
          {leftElement}
          <div className="flex-grow-1">
            <CreatableSelect
              options={options}
              value={options[idx] || null}
              onChange={(v) => { updateHeader(optionKey, v?.value || "") }}
            />
          </div>
        </div>
      </Col>
    </Form.Group>
  )
}

ExtendedHeaderInput.propTypes = {
  optionKey: PropTypes.string,
  value: PropTypes.string,
  values: PropTypes.array,
  updateHeader: PropTypes.func,
  leftElement: PropTypes.node
}

export default ExtendedHeaderInput

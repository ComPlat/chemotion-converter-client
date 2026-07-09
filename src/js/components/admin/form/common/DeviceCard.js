import { Card, Form } from "react-bootstrap";
import CreatableSelect from 'react-select/creatable';
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

// DeviceSelect is the free-form counterpart to DatasetSelect (ontology).
// A "device" is a free string or a value picked from a drop-down supplied by an
// external client (e.g. an ELN). There is no online authority to validate it
// against, so — unlike DatasetSelect — this component performs NO network
// lookup, has no reachability/retry handling and no term resolution. The chosen
// value is passed straight back and ends up as file metadata / a profile
// identifier (metadata key "device") in the backend.
function DeviceSelect({ device, updateDevice, options }) {
  const [currentValue, setCurrentValue] = useState('');

  // Drop-down options (known devices). Empty -> the field is pure free text.
  const deviceOptions = useMemo(
    () => (options || []).map((d) => ({ value: d, label: d })),
    [options]
  );

  // Reflect the incoming value (string) as the select's current option.
  useEffect(() => {
    if (device) {
      setCurrentValue({ value: device, label: device });
    } else {
      setCurrentValue('');
    }
  }, [device]);

  const updateHandler = (value) => {
    if (!value) {
      setCurrentValue('');
      updateDevice(null);
      return;
    }
    setCurrentValue({ value, label: value });
    updateDevice(value);
  };

  return (
    <Form.Group>
      <Form.Label column="lg">Device</Form.Label>
      <p>
        Select a device or type a free value (e.g. the instrument name from your
        ELN). The value is stored as file metadata and can be used as a profile
        identifier.
      </p>
      <CreatableSelect
        isClearable={true}
        isRtl={false}
        name="device"
        options={deviceOptions}
        value={currentValue || ""}
        onChange={(event) => updateHandler(event?.value)}
      />
    </Form.Group>
  );
}

DeviceSelect.propTypes = {
  device: PropTypes.string,
  updateDevice: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
};

DeviceSelect.defaultProps = {
  device: null,
  options: [],
};

function DeviceCard({ device, updateDevice, options }) {
  return (
    <Card className="mt-3">
      <Card.Header>
        Device
      </Card.Header>
      <Card.Body>
        <DeviceSelect device={device} updateDevice={updateDevice} options={options} />
      </Card.Body>
    </Card>
  );
}

DeviceCard.propTypes = {
  device: PropTypes.string,
  updateDevice: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string),
};

DeviceCard.defaultProps = {
  device: null,
  options: [],
};

export {
  DeviceSelect,
  DeviceCard
}

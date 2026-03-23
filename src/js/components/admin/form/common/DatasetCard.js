import { Card, Form } from "react-bootstrap";
import Select from "react-select";
import React from "react";
import PropTypes from "prop-types";

export default function DatasetCard({ dataset, datasets, updateOntology }) {
  if (!datasets || datasets.length === 0) {
    return null;
  }

  const dsOpt = datasets.map((ds) => {
    return { value: ds?.ols, label: ds?.name };
  });
  const dsValue =
    dataset !== null && typeof dataset !== "undefined"
      ? {
          value: dataset?.ols,
          label: dataset?.name,
        }
      : "";

  return (
    <Card className="mt-3">
      <Card.Header>Dataset</Card.Header>
      <Card.Body>
        <Form.Group>
          <Form.Label column="lg">Datasets</Form.Label>
          <Select
            isDisabled={false}
            isLoading={false}
            isClearable={true}
            isRtl={false}
            name="dataset"
            options={dsOpt}
            value={dsValue}
            onChange={(event) => updateOntology(event?.value)}
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
}

DatasetCard.propTypes = {
  dataset: PropTypes.shape({
    ols: PropTypes.string,
    name: PropTypes.string,
  }),
  datasets: PropTypes.arrayOf(
    PropTypes.shape({
      ols: PropTypes.string,
      name: PropTypes.string,
    }),
  ).isRequired,
  updateOntology: PropTypes.func.isRequired,
};

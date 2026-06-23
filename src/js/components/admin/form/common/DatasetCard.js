import { Card, Form } from "react-bootstrap";
import CreatableSelect from 'react-select/creatable';
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { addNamespaceToOntology } from "./TibFetchService";
import { FormInput } from "lucide-react";
import { useAdminApp } from "../../AppContext";

let timeOutHandler = null;

function DatasetSelect({ dataset, updateOntology }) {
  const { datasets } = useAdminApp();
  const [currentValue, setCurrentValue] = useState('')
  const dsOpt = useMemo(() => {
    return datasets.map(ds => {
      return { value: ds?.ols, label: ds?.name };
    });
  }, []);

  useEffect(() => {

    if (typeof dataset === "string") {
      dataset = datasets.find((ds) => ds.ols === dataset) || {
        ols: dataset,
        name: dataset
      };
    }
    const value = dataset?.ols || dataset?.obo_id;
    if (value === currentValue?.value) return;
    setCurrentValue(dataset ? {
      value,
      label: dataset?.name || dataset.label,
    } : '');
  }, [dataset, dsOpt]);


  const updateHandler = (ontology) => {
    setCurrentValue({ value: ontology, label: ontology });
    if (timeOutHandler) {
      clearTimeout(timeOutHandler);
    }
    timeOutHandler = setTimeout(() => {
      timeOutHandler = null;
      fetch(`https://www.ebi.ac.uk/ols4/api/ontologies/CHMO/terms?obo_id=${ontology}&lang=en`).then(async (res) => {
        const { _embedded } = await res.json();
        let {
          iri,
          ontology_name,
          ontology_prefix,
          short_form,
          description,
          id,
          label,
          obo_id,
          type
        } = _embedded.terms[0];
        id = id ?? `${ontology_prefix}:properties:${iri}`;
        type = type ?? 'class';
        updateOntology(addNamespaceToOntology({
          iri,
          ontology_name,
          ontology_prefix,
          short_form,
          description,
          id,
          label,
          obo_id,
          type
        }));
        setCurrentValue({
          value: obo_id,
          label
        })
      }).catch(()=> {
        setCurrentValue('')
      });

    }, 200);
  }

  if (!datasets || datasets.length === 0) {
    return (
      <Form.Group>
        <Form.Label column="lg">Datasets</Form.Label>
      <p>You can select a CHMO ontology term or enter a valid CHMO OBO ID (e.g. for "thin-layer chromatography" enter "CHMO:0001007")</p>
        <Form.Control
          type="text"
          isDisabled={false}
          name="dataset"
          value={currentValue.value || currentValue || ""}
          onChange={(event) => updateHandler(event.target.value)}
        />
      </Form.Group>
    );
  }


  return (
    <Form.Group>
      <Form.Label column="lg">Datasets</Form.Label>
      <p>You can select a CHMO ontology term or enter a valid CHMO OBO ID (e.g. for "thin-layer chromatography" enter "CHMO:0001007")</p>
      <CreatableSelect
        isDisabled={false}
        isLoading={false}
        isClearable={true}
        isRtl={false}
        name="dataset"
        options={dsOpt}
        value={currentValue || ""}
        onChange={(event) => updateHandler(event?.value)}
      />
    </Form.Group>
  );
}

DatasetSelect.propTypes = {
  dataset: PropTypes.oneOfType([PropTypes.shape({
    ols: PropTypes.string,
    name: PropTypes.string
  }), PropTypes.string]),
  updateOntology: PropTypes.func.isRequired,
}

function DatasetCard({ dataset, updateOntology }) {

  return (
    <Card className="mt-3">
      <Card.Header>
        Dataset
      </Card.Header>
      <Card.Body>
        <DatasetSelect dataset={dataset} updateOntology={updateOntology}/>
      </Card.Body>
    </Card>
  );
}

DatasetCard.propTypes = {
  dataset: PropTypes.shape({
    ols: PropTypes.string,
    name: PropTypes.string
  }),
  updateOntology: PropTypes.func.isRequired,
}

export {
  DatasetSelect,
  DatasetCard
}
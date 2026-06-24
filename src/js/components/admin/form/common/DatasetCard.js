import { Card, Form, Button } from "react-bootstrap";
import CreatableSelect from 'react-select/creatable';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { addNamespaceToOntology } from "./TibFetchService";
import { RefreshCw } from "lucide-react";
import { useAdminApp } from "../../AppContext";

const OLS4_BASE_URL = 'https://www.ebi.ac.uk/ols4/api';
const API_ERROR_MESSAGE = 'The EBI OLS4 API is currently not reachable. Please check your internet connection and try again later.';

let timeOutHandler = null;

function DatasetSelect({ dataset, updateOntology }) {
  const { datasets } = useAdminApp();
  const [currentValue, setCurrentValue] = useState('')
  const [apiAvailable, setApiAvailable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const dsOpt = useMemo(() => {
    return datasets.map(ds => {
      return { value: ds?.ols, label: ds?.name };
    });
  }, []);

  // Check whether the EBI OLS4 API is reachable. Used on mount and by the retry button.
  const checkApi = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await fetch(`${OLS4_BASE_URL}/ontologies/CHMO`);
      setApiAvailable(res.ok);
    } catch (e) {
      setApiAvailable(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    checkApi();
  }, [checkApi]);

  useEffect(() => {
    let cancelled = false;

    const resolveDataset = async () => {
      let resolved = dataset;

      if (typeof resolved === "string") {
        if (!resolved) {
          setCurrentValue('');
          return;
        }
        const listed = datasets.find((ds) => ds.ols === resolved);
        if (listed) {
          resolved = listed;
        } else {
          // Already resolved to this id (e.g. right after a selection in the
          // upload dialog): keep the current label, skip the redundant lookup.
          if (currentValue?.value === resolved) return;
          // Freely entered CHMO ID (not in the dataset list): resolve its
          // term label via the OLS4 API so the field shows the translated name.
          try {
            const res = await fetch(`${OLS4_BASE_URL}/ontologies/CHMO/terms?obo_id=${resolved}&lang=en`);
            if (res.ok) {
              const { _embedded } = await res.json();
              const term = _embedded?.terms?.[0];
              if (term && !cancelled) {
                setCurrentValue({ value: term.obo_id, label: term.label });
                return;
              }
            }
          } catch (e) {
            // fall through to the raw-id fallback below
          }
          resolved = { ols: resolved, name: resolved };
        }
      }

      if (cancelled) return;
      const value = resolved?.ols || resolved?.obo_id;
      if (value === currentValue?.value) return;
      setCurrentValue(resolved ? {
        value,
        label: resolved?.name || resolved.label,
      } : '');
    };

    resolveDataset();
    return () => {
      cancelled = true;
    };
  }, [dataset, dsOpt]);


  const updateHandler = (ontology) => {
    if (timeOutHandler) {
      clearTimeout(timeOutHandler);
      timeOutHandler = null;
    }
    // Empty / cleared field: reset the value and the resulting table entry without
    // querying the API. Otherwise a request with obo_id=undefined would return
    // stale artefacts from previous runs.
    if (!ontology) {
      setCurrentValue('');
      updateOntology(null);
      return;
    }
    setCurrentValue({ value: ontology, label: ontology });
    timeOutHandler = setTimeout(() => {
      timeOutHandler = null;
      fetch(`${OLS4_BASE_URL}/ontologies/CHMO/terms?obo_id=${ontology}&lang=en`).then(async (res) => {
        if (!res.ok) {
          throw new Error(`EBI OLS4 API responded with status ${res.status}`);
        }
        setApiAvailable(true);
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
        setApiAvailable(false);
      });

    }, 200);
  }

  const retryButton = (
    <Button
      variant="outline-secondary"
      onClick={checkApi}
      disabled={isChecking}
      title="Retry connection to the EBI OLS4 API"
    >
      <RefreshCw size={16} />
    </Button>
  );

  if (!datasets || datasets.length === 0) {
    return (
      <Form.Group>
        <Form.Label column="lg">Datasets</Form.Label>
      <p>You can select a CHMO ontology term or enter a valid CHMO OBO ID (e.g. for "thin-layer chromatography" enter "CHMO:0001007") &rarr; requires online connection to the EBI OLS4 API.</p>
        <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
          <Form.Control
            type="text"
            disabled={!apiAvailable}
            name="dataset"
            style={{ flex: '1 1 auto' }}
            value={currentValue.value || currentValue || ""}
            onChange={(event) => updateHandler(event.target.value)}
          />
          {retryButton}
        </div>
        {!apiAvailable && (
          <p className="small text-danger mt-1">{API_ERROR_MESSAGE}</p>
        )}
      </Form.Group>
    );
  }


  return (
    <Form.Group>
      <Form.Label column="lg">Datasets</Form.Label>
      <p>You can select a CHMO ontology term or enter a valid CHMO OBO ID (e.g. for "thin-layer chromatography" enter "CHMO:0001007") &rarr; requires online connection to the EBI OLS4 API.</p>
      <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
        <div style={{ flex: '1 1 auto' }}>
          <CreatableSelect
            isDisabled={!apiAvailable}
            isLoading={false}
            isClearable={true}
            isRtl={false}
            name="dataset"
            options={dsOpt}
            value={currentValue || ""}
            onChange={(event) => updateHandler(event?.value)}
          />
        </div>
        {retryButton}
      </div>
      {!apiAvailable && (
        <p className="small text-danger mt-1">{API_ERROR_MESSAGE}</p>
      )}
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
import React from 'react';
import AsyncSelect from 'react-select/async';


const CHEMOTION_URL = 'https://chemotion.net/chemotion/#';

const GENERIC_PREDICATE = {
  "iri": "http://purl.obolibrary.org/obo/OBI_0000070",
  "namespace": "http://purl.obolibrary.org/obo/",
  "ontology_name": "chmo",
  "ontology_prefix": "CHMO",
  "short_form": "OBI_0000070",
  "description": [
    "A planned process that has the objective to produce information about a material entity (the evaluant) by examining it."
  ],
  "id": "OBI:property:http://purl.obolibrary.org/obo/OBI_0000070",
  "label": "assay",
  "obo_id": "OBI:0000070",
  "type": "property"
};

const GENERIC_SUBJECT_PREDICATE = {
  "iri": `${CHEMOTION_URL}has`,
  "namespace": `${CHEMOTION_URL}`,
  "ontology_name": "chemotion",
  "ontology_prefix": "CHEMOTION",
  "short_form": "CHEMOTION_has",
  "description": [
    "This is a generic predicate that leaves the type of connection undefined."
  ],
  "id": `CHEMOTION:property:${CHEMOTION_URL}has`,
  "label": "has",
  "obo_id": "CHEMOTION:has",
  "type": "property"
};

const findOntologyById = (ontologyId, ontologyList) => {
  return ontologyList.find((o) => o.id === ontologyId);
}

const addNamespaceToOntology = (ontology) => {
  const re = /(.+[/#])([^/#]+)/g;
  const [_all, namespace, _term] = re.exec(ontology.iri);
  return {
    ...ontology,
    namespace,

  };
}

const ontologySchemaToOption = (ontologyId, ontologyList = null) => {
  if (!ontologyId) return ontologyId;
  let ontologyJson;
  if (!ontologyList) {
    ontologyJson = ontologyId;
  } else {
    ontologyJson = findOntologyById(ontologyId, ontologyList);
  }

  return {
    value: ontologyJson,
    label: ontologyJson.label
  };
}

const fetchProperties = async (inputValue, create = true, typeFilter = null, additionalOptions = [], ontology = null) => {
  if (!inputValue) return [];
  inputValue = inputValue.replaceAll(':', '_');
  try {
    const response = await fetch(
      `https://api.terminology.tib.eu/api/select?q=${encodeURIComponent(inputValue)}${ontology ? '&ontology=' + ontology : ''}`
    );

    if (response.status !== 200) {
      return null;
    }

    const data = await response.json();

    if (!data.response?.docs) {
      return null;
    }

    let result = data.response.docs.filter((item) => Boolean(item.obo_id)).map((item) => {
      const ontolog = addNamespaceToOntology(item);
      return ontologySchemaToOption(ontolog);
    });

    if (additionalOptions) {
      const lInputValue = inputValue.toLocaleLowerCase().replaceAll(" ", "");
      const filteredAddedOptions = additionalOptions.filter((x) => x.obo_id.toLocaleLowerCase().includes(lInputValue)).map((x) => ontologySchemaToOption(x));
      result = filteredAddedOptions.concat(result);
    }

    if (typeFilter) {
      if (!Array.isArray(typeFilter)) {
        typeFilter = [typeFilter];
      }

      result = result.filter((x) => typeFilter.includes(x.value.type))
    }

    if (create) {
      const dataset = `chemotion`;
      const newTerm = [dataset.toUpperCase(), inputValue.split(':').at(-1)];
      const namespace = CHEMOTION_URL;
      const iri = `${namespace}${newTerm[1]}`;
      result.unshift({
        label: `Create new: ${newTerm[1]}`,
        value: {
          iri,
          namespace,
          "ontology_name": dataset.toLowerCase(),
          "ontology_prefix": newTerm[0],
          "short_form": newTerm.join('_'),
          "description": ["Local entry"],
          "id": `${newTerm[0]}:property:${iri}`,
          "label": newTerm[1],
          "obo_id": newTerm.join(':'),
          "type": "property"
        }
      })
    }

    return result;
  } catch (e) {
    return null;
  }
};


const checkTIB = (setCheckResult) => {
  return async () => {
    let isMounted = true;

    const _checkTIB = async () => {
      try {
        const result = await fetchProperties("JUST_A_RANDOM_STRING"); // returns true or false
        if (isMounted) {
          setCheckResult(result !== null);
        }
      } catch (error) {
        console.error("Error during check:", error);
        if (isMounted) {
          setCheckResult(false); // fallback
        }
      }
    };

    await _checkTIB();

    return () => {
      isMounted = false; // cleanup to avoid state updates on unmounted component
    };
  }
}

function OntologyAsyncSelect({
                               onChange,
                               placeholder,
                               value,
                               create = true,
                               isClearable = true,
                               typeFilter = null,
                               additionalOptions = []
                             }) {
  const batchStyle = {
    color: "#fff",
    borderRadius: "5px",
    padding: "2px 6px",
    fontSize: "0.7em",
    fontWeight: "bold",
  }

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={(a) => fetchProperties(a, create, typeFilter, additionalOptions)}
      onChange={(newValue) => {
        onChange(newValue);
      }}
      placeholder={placeholder}
      value={value}
      isClearable={isClearable}
      formatOptionLabel={(option) => (
        <div style={{position: "relative", paddingRight: "40px"}}>
          <div style={{display: "flex", flexDirection: "column"}}>
            <strong style={{
              maxWidth: "60%"
            }}>{option.label}</strong>
            <small style={{color: "#666"}}>{option.value.iri}</small>
            <small>{option.value.description.join(' ')}</small>

            <div style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              maxWidth: "40%"
            }}>
              <span style={{
                ...batchStyle,
                background: "#337ab7",
              }}>{option.value.ontology_prefix}</span>
              <span style={{
                ...batchStyle,
                background: "#5abedb",
              }}>{option.value.obo_id.split(':').at(-1)}</span>
            </div>
          </div>
        </div>
      )}
    />
  );
}

export {
  fetchProperties,
  checkTIB,
  addNamespaceToOntology,
  OntologyAsyncSelect,
  ontologySchemaToOption,
  findOntologyById,
  GENERIC_PREDICATE,
  GENERIC_SUBJECT_PREDICATE,
};
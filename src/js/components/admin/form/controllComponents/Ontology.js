import React from "react";
import PropTypes from "prop-types";
import {Card} from "react-bootstrap";
import DatasetCard from "../common/DatasetCard";
import {addNamespaceToOntology, GENERIC_PREDICATE} from "../common/TibFetchService";
import {cleanOntology} from "../../../../utils/identifierUtils";
import OntologySubjectPredicateSelect from "../identifier/OntologySubjectPredicateSelect";


export default function OntologyManager({dataset, datasets, profile, options, setProfile}) {

  const updateOntology = (ontology) => {
    if (typeof profile != 'undefined' && profile !== null) {
      if (!ontology) {
        profile.ols = null;
        profile.rootOntology = GENERIC_PREDICATE;
        setProfile(profile);
      } else {
        profile.ols = ontology;
        fetch(`https://www.ebi.ac.uk/ols4/api/ontologies/CHMO/terms?obo_id=${ontology}&lang=en`).then(async (res) => {
          const {_embedded} = await res.json();
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
          profile.rootOntology = addNamespaceToOntology({
            iri,
            ontology_name,
            ontology_prefix,
            short_form,
            description,
            id,
            label,
            obo_id,
            type
          });
        }).finally(() => {
          setProfile(profile);
        })
      }
    }
  }

  const updateSubjectInstances = (subjectInstances, predicate) => {
    const tempPprofile = {...profile, subjectInstances};
    tempPprofile[`predicates`].push(predicate);
    cleanOntology(tempPprofile);
    setProfile(tempPprofile);
  }

  return (<>
    <DatasetCard dataset={dataset} datasets={datasets} updateOntology={updateOntology}></DatasetCard>

    <Card className="mt-3">
      <Card.Header>Subject Instances</Card.Header>
      <Card.Body>
        <OntologySubjectPredicateSelect
          updateSubjectInstances={updateSubjectInstances}
          dataset={dataset}
          subjects={profile.subjects}
          predicates={profile.predicates}
          options={options}
          subjectInstances={profile.subjectInstances}
          datasetId={dataset?.name ?? 'Assay'}/>
      </Card.Body>
    </Card>
  </>)
}

OntologyManager.propTypes = {
  dataset: PropTypes.object,
  datasets: PropTypes.array,
  profile: PropTypes.shape({
    ols: PropTypes.string,
    rootOntology: PropTypes.object,
    subjects: PropTypes.array.isRequired,
    predicates: PropTypes.array.isRequired,
    subjectInstances: PropTypes.object.isRequired
  }).isRequired,
  options: PropTypes.object,
  setProfile: PropTypes.func.isRequired
};

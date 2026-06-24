import React from "react";
import PropTypes from "prop-types";
import {Card} from "react-bootstrap";
import { DatasetCard } from "../common/DatasetCard";
import {GENERIC_PREDICATE} from "../common/TibFetchService";
import {cleanOntology} from "../../../../utils/identifierUtils";
import OntologySubjectPredicateSelect from "../identifier/OntologySubjectPredicateSelect";
import {useAdminApp} from "../../AppContext";


export default function OntologyManager({dataset}) {
  const {datasets, options, profile, updateProfile: setProfile} = useAdminApp();

  const updateOntology = (ontology) => {
    if (typeof profile != 'undefined' && profile !== null) {
      if (!ontology) {
        profile.ols = null;
        profile.rootOntology = GENERIC_PREDICATE;
      } else {
        profile.ols = ontology.obo_id;
        profile.rootOntology = ontology;
      }
      setProfile(profile);
    }
  }

  const updateSubjectInstances = (subjectInstances, predicate) => {
    const tempPprofile = {...profile, subjectInstances};
    tempPprofile[`predicates`].push(predicate);
    cleanOntology(tempPprofile);
    setProfile(tempPprofile);
  }

  return (<>
    <DatasetCard dataset={dataset ?? profile?.ols} datasets={datasets} updateOntology={updateOntology}></DatasetCard>

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
  </>);
}

OntologyManager.propTypes = {
  dataset: PropTypes.object
};

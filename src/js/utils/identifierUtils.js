import React from "react";
import {getFileMetadataOptions, getProfileData, getTableMetadataOptions} from "./profileUtils";
import {v4 as uuidv4} from 'uuid';
import {addNamespaceToOntology, GENERIC_SUBJECT_PREDICATE} from "../components/admin/form/common/TibFetchService";

const initIdentifier = (profile, type, tableIdx = 0) => {
  const identifier = {
    type: type,
    match: 'any',
    value: ''
  }

  if (identifier.type === 'fileMetadata') {
    const fileMetadataOptions = getFileMetadataOptions(profile, tableIdx)
    if (fileMetadataOptions.length > 0) {
      identifier.key = fileMetadataOptions[0].key
      identifier.value = fileMetadataOptions[0].value
    } else {
      identifier.key = ''
    }
  } else if (identifier.type === 'tableMetadata') {
    const tableMetadataOptions = getTableMetadataOptions(profile, tableIdx)
    if (tableMetadataOptions.length > 0) {
      identifier.key = tableMetadataOptions[0].key
      identifier.tableIndex = tableMetadataOptions[0].tableIndex
      identifier.value = tableMetadataOptions[0].value
    } else {
      identifier.key = ''
      identifier.tableIndex = 0
    }
  } else if (identifier.type === 'tableHeader') {
    identifier.tableIndex = 0
    identifier.lineNumber = ''
  }

  return identifier
}

const additionalInfo = (operation) => {
  switch (operation.type) {
    case 'header_value':
      let line = parseInt(operation.line);
      if (!isNaN(line)) {
        line = ` @line ${line}`;
      } else {
        line = '';
      }
      return ` (Table # ${operation.table}${line}: Regex: "${operation.regex}")`;
    case 'metadata_value':
      return ` (Table # ${operation.table} ${operation.value})`;
    case 'column':
      return ` (Table # ${operation.column.tableIndex} Column # ${operation.column.columnIndex})`;
    default:
      return `: ${operation.value}`;
  }
}

const findOntologyInDataset = (dataset, ontology) => {
  const {id} = ontology;
  if (!dataset?.layers) {
    return null;
  }
  const fields = Object.entries(dataset?.layers).reduce((acc, [layarKey, layer]) => {
    return acc.concat(layer.fields.reduce((innnerAcc, field) => {
      if (field.ontology?.id === id) {
        innnerAcc.push([layarKey, field.field]);
      }
      return innnerAcc;
    }, []));
  }, []);
  if (fields.length === 1) {
    return fields;
  }

  return null;
}

const filterUnique = (ontologyList, whiteList) => {
  const uniqueWhiteList = [...new Set(whiteList)];
  return [
    ...new Map(ontologyList
      .filter((item) => uniqueWhiteList.includes(item.id))
      .map(item => [item.id, item]))
      .values()
  ];

}

const cleanOntology = (profile) => {
  const usedSubjects = profile.identifiers.map((id) => id.subject?.id).filter(Boolean);
  profile.subjects = filterUnique(profile.subjects, usedSubjects);
  const usedDatatypes = profile.identifiers.map((id) => id.datatype?.id).filter(Boolean);
  profile.datatypes = filterUnique(profile.datatypes, usedDatatypes);
  const usedObjects = profile.identifiers.map((id) => id.object?.id).filter(Boolean);
  profile.objects = filterUnique(profile.objects, usedObjects);

  profile.subjectInstances = profile.identifiers.reduce((acc, id) => {
    if (!id.subject) {
      return acc
    }
    if (!acc[id.subject.id]) {
      acc[id.subject.id] = [];
    }
    if (id.subject?.subjectInstance && !acc[id.subject.id].some((accItem) => accItem.name === id.subject.subjectInstance)) {
      const originElement = profile.subjectInstances[id.subject.id]?.find((profileItem) => profileItem.name === id.subject.subjectInstance);
      if (originElement) {
        acc[id.subject.id].push(originElement)
      } else {
        acc[id.subject.id].push({
          name: id.subject.subjectInstance,
          predicate: GENERIC_SUBJECT_PREDICATE.id
        });
      }
    }
    return acc;
  }, {});

  const usedPredicates = profile.identifiers
    .map((id) => id.predicate?.id).concat(
      Object.values(profile.subjectInstances).flat(Infinity).map((x) => x.predicate)
    ).filter(Boolean);
  profile.predicates.push(GENERIC_SUBJECT_PREDICATE);
  profile.predicates = filterUnique(profile.predicates, usedPredicates);
}

function BuildIdentifierHandler(profile, setProfile, dataset, tableIdx = 0, activeTabKey = 'metadata') {
  const handlers = {
    addIdentifier: (type, optional, options = {}) => {
      const identifier = initIdentifier(profile, type, tableIdx);
      identifier.show = true;
      identifier.optional = optional;
      identifier.id = options.id ?? uuidv4();
      if (!identifier.id.startsWith('#')) {
        identifier.id = `#${identifier.id}`;
      }
      identifier.editable = options.editable ?? true;

      if (identifier.optional) {
        identifier.outputTableIndex = 0;
        identifier.outputLayer = '';
        identifier.outputKey = '';
        identifier.predicate = null;
        identifier.subject = null;
        identifier.datatype = null;
        identifier.object = null;
      } else {
        identifier.match = 'exact';
      }

      for (const key of Object.keys(identifier)) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
          identifier[key] = options[key];
        }
      }
      if (activeTabKey !== 'reactionVariations') {
        profile.identifiers.push(identifier)
      }else {
        profile.reactionVariations.identifiers.push(identifier)
      }

      setProfile(profile)
    },

    updateIdentifier: (index, data) => {
      if (typeof index === 'string' && index.startsWith('#')) {
        index = profile.identifiers.findIndex((x) => x.id === index);
      }

      if (data['outputKey'] || data['outputLayer']) {
        const {outputLayer, outputKey} = {...profile.identifiers[index], ...data}
        const field = dataset?.layers[outputLayer]?.fields.find((x) => x.field === outputKey);
        if (field?.ontology) {
          const ontology = addNamespaceToOntology(field.ontology);
          handlers.updateIdentifierOntology(index, {type: 'object', ontology});
        }
      }

      if (index !== -1) {
        profile.identifiers[index] = Object.assign(profile.identifiers[index], data);
        cleanOntology(profile);
        setProfile(profile);
      }
    },

    updateIdentifierOntology: (index, data) => {
      if (index !== -1) {

        if (data.type && data.ontology) {
          profile[`${data.type}s`].push(data.ontology);
          profile.identifiers[index][data.type] = {'id': data.ontology.id};
          if (data.type === 'object') {
            const fieldPath = findOntologyInDataset(dataset, data.ontology);
            if (fieldPath) {
              [profile.identifiers[index].outputLayer, profile.identifiers[index].outputKey] = fieldPath[0];
            }
          }
        } else if (data.type && !data.ontology) {
          profile.identifiers[index][data.type] = null;
        }
        if (data.instance && profile.identifiers[index]['subject']) {
          profile.identifiers[index]['subject'] = {
            ...profile.identifiers[index]['subject'],
            subjectInstance: data.instance
          };

        }
        cleanOntology(profile);
        setProfile(profile);
      }
    },


    removeIdentifier: (index) => {
      if (typeof index === 'string' && index.startsWith('#')) {
        index = profile.identifiers.findIndex((x) => x.id === index);
      }
      if (index !== -1) {
        profile.identifiers.splice(index, 1);
        setProfile(profile);
      }
    },


    addIdentifierOperation: (index) => {
      if (index !== -1) {
        const operation = {
          operator: '+'
        }
        if (profile.identifiers[index].operations === undefined) {
          profile.identifiers[index].operations = []
        }
        profile.identifiers[index].operations.push(operation);
        setProfile(profile);
      }
    },

    updateIdentifierOperation: (index, opIndex, opKey, value) => {
      if (index !== -1) {
        profile.identifiers[index].operations[opIndex][opKey] = value
        setProfile(profile);
      }
    },

    removeIdentifierOperation: (index, opIndex) => {
      if (index !== -1) {
        profile.identifiers[index].operations.splice(opIndex, 1);

        // remove operations if it is empty
        if (profile.identifiers[index].operations.length === 0) {
          delete profile.identifiers[index].operations;
        }

        setProfile(profile);
      }
    },

    updateRegex: ({lineNumber, value, tableIndex, match}) => {
      if (match !== 'regex') {
        return <></>;
      }

      const regexPattern = value;
      lineNumber = parseInt(lineNumber);
      const profileData = getProfileData(profile, tableIdx);
      if (!profileData?.tables?.[tableIndex]) {
        return <></>;
      }
      let {header} = profileData.tables[tableIndex];

      if (!isNaN(lineNumber) && header.length + 1 > lineNumber) {
        header = [header[lineNumber - 1]];
      } else if (!String(regexPattern).startsWith('^') && !String(regexPattern).endsWith('$')) {
        header = [header.join('\n')];
      }
      try {
        const regex = new RegExp(regexPattern);
        const matchResult = header.map((x) => regex.exec(x)).filter(Boolean).map((res => res[1]));
        if (matchResult.length > 0) {
          return <p>Current match: <b>{matchResult[0]}</b> (<a target="_blank" href="https://regex101.com/">regex101</a>)
          </p>;
        }
      } catch {
      }
      return <></>;
    }
  };

  return handlers;
}

export {
  initIdentifier,
  additionalInfo,
  BuildIdentifierHandler,
  cleanOntology
}

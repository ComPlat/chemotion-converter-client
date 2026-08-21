import React from "react";
import {getFileMetadataOptions, getProfileData, getTableMetadataOptions} from "./profileUtils";
import {v4 as uuidv4} from 'uuid';
import {addNamespaceToOntology, GENERIC_SUBJECT_PREDICATE} from "../components/admin/form/common/TibFetchService";

// Placeholder of a composed template, e.g. "{{#a1b2}} clamped on {{#c3d4}}". Must
// stay in sync with COMPOSED_TOKEN_PATTERN in converter_app/converters.py.
const TEMPLATE_TOKEN_PATTERN = /\{\{(#[^{}]*)}}/g;

const initIdentifier = (profile, type, tableIdx = 0) => {
  const identifier = {
    type: type,
    match: 'any',
    value: ''
  }

  if (identifier.type === 'composed') {
    identifier.template = ''
    identifier.onMissing = 'skip'
    identifier.missingPlaceholder = ''
  }

  if (identifier.type === 'fileMetadata') {
    const fileMetadataOptions = getFileMetadataOptions(getProfileData(profile, tableIdx))
    if (fileMetadataOptions.length > 0) {
      identifier.key = fileMetadataOptions[0].key
      identifier.value = fileMetadataOptions[0].value
    } else {
      identifier.key = ''
    }
  } else if (identifier.type === 'tableMetadata') {
    const tableMetadataOptions = getTableMetadataOptions(getProfileData(profile, tableIdx))
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


const getSelectedMatch = ({identifier: {lineNumber, key, type, value, tableIndex, match}, profile, tableIdx}) => {

  if (type === 'fileMetadata') {
    const {metadata} = getProfileData(profile, tableIdx);
    return [metadata?.[key]];

  }
  if (type === 'tableMetadata') {
    const {metadata} = getProfileData(profile, tableIdx)?.tables?.[tableIndex] || {};
    return [metadata?.[key]];
  }
  if (type === 'tableHeader') {
    const {header} = getProfileData(profile, tableIdx)?.tables?.[tableIndex] || {};

    lineNumber = parseInt(lineNumber);

    if (!isNaN(lineNumber) && header.length + 1 > lineNumber) {
      return [header[lineNumber - 1]];
    }
    return header;
  }

  return []
}

/**
 * Splits a composed template into an ordered list of segments, either
 * {type: 'text', value} or {type: 'reference', id}. Parsing and serializing are
 * lossless, so the template string stays the only stored representation.
 */
const parseTemplate = (template) => {
  const source = String(template ?? '');
  const segments = [];
  let position = 0;

  for (const token of source.matchAll(TEMPLATE_TOKEN_PATTERN)) {
    if (token.index > position) {
      segments.push({type: 'text', value: source.slice(position, token.index)});
    }
    segments.push({type: 'reference', id: token[1]});
    position = token.index + token[0].length;
  }
  if (position < source.length) {
    segments.push({type: 'text', value: source.slice(position)});
  }

  return segments;
}

// Blocks that start with punctuation are attached to the block before them instead
// of being separated by a space.
const ATTACHED_TO_PREVIOUS_BLOCK = /^[,.;:!?%)\]]/;

/**
 * Turns segments back into a template string. Blocks are joined by a single space,
 * so nobody has to type leading or trailing spaces, and text blocks are trimmed.
 * References without an id are blocks the user has not filled in yet: they stay in
 * the editor but never reach the template.
 */
const serializeTemplate = (segments) => segments
  .map((segment) => (segment.type === 'reference'
    ? (segment.id ? `{{${segment.id}}}` : '')
    : String(segment.value ?? '').trim()))
  .filter(Boolean)
  .reduce((template, block) => {
    if (!template) {
      return block;
    }
    return `${template}${ATTACHED_TO_PREVIOUS_BLOCK.test(block) ? '' : ' '}${block}`;
  }, '');

const templateReferences = (template) => parseTemplate(template)
  .filter((segment) => segment.type === 'reference')
  .map((segment) => segment.id);

/**
 * Human readable description of an identifier, used to label the building blocks
 * of a composed metadata template.
 */
const identifierLabel = (identifier) => {
  if (!identifier) {
    return '';
  }
  const tableNumber = (identifier.tableIndex ?? 0) + 1;

  if (identifier.type === 'fileMetadata') {
    return `File metadata: ${identifier.key || '(no key)'}`;
  }
  if (identifier.type === 'tableMetadata') {
    return `Table #${tableNumber} metadata: ${identifier.key || '(no key)'}`;
  }
  if (identifier.type === 'composed') {
    return `Composed: ${identifier.outputKey || '(no output key)'}`;
  }
  const line = identifier.lineNumber ? ` line ${identifier.lineNumber}` : '';
  return `Table #${tableNumber} header${line}${identifier.value ? `: ${identifier.value}` : ''}`;
}

/**
 * Resolves the value an identifier would extract from the currently loaded
 * example file. Mirrors Converter.match_identifier on the server side, but only
 * for the active input file (profile.data[tableIdx]).
 *
 * @return the value as string or null if nothing matches
 */
const resolveIdentifierValue = ({identifier, profile, tableIdx = 0, visited = []}) => {
  if (identifier.type === 'composed') {
    const {value, isSkipped} = resolveTemplate({identifier, profile, tableIdx, visited});
    return isSkipped || !value.trim() ? null : value;
  }

  const candidates = getSelectedMatch({identifier, profile, tableIdx})
    .filter((candidate) => candidate !== undefined && candidate !== null);

  if (identifier.match !== 'regex') {
    return candidates.length > 0 ? String(candidates[0]) : null;
  }

  const pattern = String(identifier.value ?? '');
  // an anchored pattern is applied per header line, an unanchored one to the
  // whole header at once - same rule as Converter._solve_regex
  const searchIn = pattern.startsWith('^') || pattern.endsWith('$')
    ? candidates
    : [candidates.join('\n')];

  try {
    const regex = new RegExp(pattern);
    const [firstMatch] = searchIn.map((candidate) => regex.exec(String(candidate))).filter(Boolean);
    if (firstMatch) {
      return String(firstMatch[1] ?? firstMatch[0]).trim();
    }
  } catch {
    // an incomplete regex is a normal state while typing
  }

  return null;
}

/**
 * Builds the value of a composed identifier from the currently loaded example
 * file.
 *
 * @return {value, missing, isSkipped} where missing lists the ids of all
 *         references without a value and isSkipped tells whether the identifier
 *         would produce no output at all
 */
const resolveTemplate = ({identifier, profile, tableIdx = 0, visited = []}) => {
  const segments = parseTemplate(identifier.template);
  const nextVisited = [...visited, identifier.id];
  const missing = [];

  const value = segments.map((segment) => {
    if (segment.type === 'text') {
      return segment.value ?? '';
    }

    const reference = (profile?.identifiers ?? []).find((x) => x.id === segment.id);
    // a reference cycle resolves to nothing instead of recursing forever
    const resolved = reference && !nextVisited.includes(reference.id)
      ? resolveIdentifierValue({identifier: reference, profile, tableIdx, visited: nextVisited})
      : null;

    if (resolved === null || resolved === '') {
      missing.push(segment.id);
      return identifier.onMissing === 'placeholder' ? (identifier.missingPlaceholder ?? '') : '';
    }
    return resolved;
  }).join('');

  return {
    value,
    missing,
    isSkipped: missing.length > 0 && (identifier.onMissing ?? 'skip') === 'skip'
  };
}

/**
 * Collects all template references of a profile that point to an identifier
 * which does not exist (anymore).
 */
const findBrokenTemplateReferences = (profile) => {
  const knownIds = new Set((profile?.identifiers ?? []).map((x) => x.id));

  return (profile?.identifiers ?? [])
    .filter((identifier) => identifier.type === 'composed')
    .flatMap((identifier) => templateReferences(identifier.template)
      .filter((id) => !knownIds.has(id))
      .map((id) => ({identifier, id})));
}

function BuildIdentifierHandler(profile, setProfile, dataset, tableIdx = 0) {
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
        identifier.isDatasetOutput = true;
        identifier.isDatatableOutput = false;
        identifier.isRdfOutput = false;
        identifier.isLoobDatatableOutput = true;
        identifier.isFirstMatch = false;
        identifier.outputTableIndex = [];
        identifier.outputLayer = '';
        identifier.outputDatatableKey = '';
        identifier.outputKey = '';
        identifier.predicate = null;
        identifier.subject = null;
        identifier.datatype = null;
        identifier.object = null;

      } else {
        if (identifier.type === 'tableHeader') {
          identifier.lineNumber = 1;
        }
        identifier.match = 'exact';
      }

      for (const key of Object.keys(identifier)) {
        if (Object.prototype.hasOwnProperty.call(options, key)) {
          identifier[key] = options[key];
        }
      }
      profile.identifiers.push(identifier);

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

        if (profile.identifiers[index].type === 'tableHeader' &&
          !profile.identifiers[index].optional &&
          !profile.identifiers[index].lineNumber) {
          profile.identifiers[index] = Object.assign(profile.identifiers[index], {lineNumber: 1});
        }
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
        const usedBy = profile.identifiers.filter((x) => x.type === 'composed'
          && templateReferences(x.template).includes(profile.identifiers[index].id));

        if (usedBy.length > 0) {
          const names = usedBy.map((x) => identifierLabel(x)).join(', ');
          if (!window.confirm(`This metadata is used as a building block of: ${names}.\nRemove it anyway?`)) {
            return;
          }
        }

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

    updateRegex: ({lineNumber, key, type = 'tableHeader', value, tableIndex, match}) => {
      const identifier = {lineNumber, key, type, value, tableIndex, match};
      const resolved = resolveIdentifierValue({identifier, profile, tableIdx});

      if (match !== 'regex') {
        return <p>Current match: <b>{resolved?.substring(0, 100) ?? '-'}</b></p>;
      }
      if (resolved !== null) {
        return <p>Current match: <b>{resolved}</b> (<a target="_blank" href="https://regex101.com/">regex101</a>)
        </p>;
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
  cleanOntology,
  parseTemplate,
  serializeTemplate,
  templateReferences,
  identifierLabel,
  resolveIdentifierValue,
  resolveTemplate,
  findBrokenTemplateReferences
}

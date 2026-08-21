import React, { useState } from "react"
import PropTypes from 'prop-types';
import { Button, ListGroup } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

import IdentifierWithHeader from '../IdentifierHeader';
import { IdentifierOutputTabs } from '../IdentifierInput';
import ComposedMetadataModal from './ComposedMetadataModal';
import { parseTemplate, resolveTemplate } from '../../../../utils/identifierUtils';
import { useAdminApp } from "../../AppContext";

/**
 * Short version of a template for the collapsed row, e.g. "{anode} clamped on {carrier}"
 */
const templateSummary = (identifier, identifiers) => {
  const segments = parseTemplate(identifier.template);
  if (segments.length === 0) {
    return 'empty template';
  }

  return segments.map((segment) => {
    if (segment.type === 'text') {
      return segment.value;
    }
    const reference = identifiers.find((x) => x.id === segment.id);
    if (!reference) {
      return '{removed}';
    }
    return `{${reference.key || reference.outputKey || `table #${(reference.tableIndex ?? 0) + 1} header`}}`;
  }).join('');
}

function ComposedIdentifierInput({ identifier, index, dataset, outputTables, ih }) {
  const { profile, tableIdx } = useAdminApp((s) => ({ profile: s.profile, tableIdx: s.tableIdx }));
  const preview = resolveTemplate({ identifier, profile, tableIdx });

  return (
    <form>
      <p className="mb-2 mt-1">
        Current result: <b>{preview.isSkipped ? '(nothing is written)' : (preview.value || '—')}</b>
      </p>

      <IdentifierOutputTabs
        index={index}
        identifier={identifier}
        outputTables={outputTables}
        dataset={dataset}
        updateIdentifier={ih.updateIdentifier}
        updateIdentifierOntology={ih.updateIdentifierOntology}
      />
    </form>
  )
}

ComposedIdentifierInput.propTypes = {
  identifier: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  dataset: PropTypes.object,
  outputTables: PropTypes.array,
  ih: PropTypes.object.isRequired
}

function ComposedIdentifierForm({ identifiers, outputTables, dataset, ih }) {
  // tracked by id, not by index: removing another identifier shifts the indices
  const [editId, setEditId] = useState(null);
  const editIdentifier = identifiers.find((identifier) => identifier.id === editId);

  const addComposedIdentifier = () => {
    const id = `#${uuidv4()}`;
    ih.addIdentifier('composed', true, { id });
    setEditId(id);
  }

  return (
    <div className="mb-3">
      <div className="fw-bold">Composed from other metadata</div>
      <small className="text-muted">
        Build one value from several metadata entries and your own words, e.g.
        <code> {'{anode}'} clamped on {'{carrier metal}'}</code>.
      </small>

      {identifiers.some((identifier) => identifier.type === 'composed') && (
        <ListGroup className="mt-1">
          {identifiers.map((identifier, index) => (
            identifier.type === 'composed' && (
              <IdentifierWithHeader
                key={identifier.id ?? index}
                identifier={identifier}
                index={index}
                removeIdentifier={ih.removeIdentifier}
                onConfigure={() => setEditId(identifier.id)}
                configureTooltip="Open the builder: compose this value from other metadata and your own words"
                summary={templateSummary(identifier, identifiers)}
                identifierInputTag={
                  <ComposedIdentifierInput
                    identifier={identifier}
                    index={index}
                    dataset={dataset}
                    outputTables={outputTables}
                    ih={ih}
                  />}
              />
            )
          ))}
        </ListGroup>
      )}

      <Button className="mt-1" variant="success" size="sm" onClick={addComposedIdentifier}>
        Add composed metadata
      </Button>

      {editIdentifier && (
        <ComposedMetadataModal
          show
          onHide={() => setEditId(null)}
          identifier={editIdentifier}
          dataset={dataset}
          addIdentifier={ih.addIdentifier}
          updateIdentifier={ih.updateIdentifier}
          updateRegex={ih.updateRegex}
        />
      )}
    </div>
  )
}

ComposedIdentifierForm.propTypes = {
  identifiers: PropTypes.array.isRequired,
  outputTables: PropTypes.array,
  dataset: PropTypes.object,
  ih: PropTypes.object.isRequired
}

export default ComposedIdentifierForm

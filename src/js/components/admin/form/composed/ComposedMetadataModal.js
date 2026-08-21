import React, { useEffect, useState } from "react"
import PropTypes from 'prop-types';
import { Alert, Badge, Button, Col, Form, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import Select from 'react-select';
import { ArrowDown, ArrowUp, Pencil, X } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

import AppModal from '../../../../utils/modalWrapper';
import { DatatableIdentifierInput } from '../IdentifierInput';
import OutputKeyInput from '../identifier/OutputKeyInput';
import OutputLayerInput from '../identifier/OutputLayerInput';
import { useAdminApp } from "../../AppContext";
import {
  identifierLabel,
  parseTemplate,
  resolveIdentifierValue,
  resolveTemplate,
  serializeTemplate
} from '../../../../utils/identifierUtils';

// Identifier types that can serve as a building block of a template
const SOURCE_TYPES = [
  ['fileMetadata', 'file metadata'],
  ['tableMetadata', 'table metadata'],
  ['tableHeader', 'table header']
];

const NEW_SOURCE_PREFIX = 'new:';

// Spaces between the blocks are added on serialization, so the editor shows the text
// blocks without them.
const withKeys = (segments) => segments.map((segment) => ({
  ...segment,
  value: segment.type === 'text' ? String(segment.value ?? '').trim() : segment.value,
  key: uuidv4()
}));

/**
 * Long values (file names, paths) must not push the row controls out of the modal, so
 * the value is cut off and shown in full on hover.
 */
function ResolvedValue({ value }) {
  if (value === null) {
    return <Badge bg="warning">no value in the example file</Badge>;
  }

  return (
    <OverlayTrigger placement="top" overlay={<Tooltip id="composed-value-tooltip">{value}</Tooltip>}>
      <Badge bg="info" className="div-nowrap composed-value">{value}</Badge>
    </OverlayTrigger>
  )
}

ResolvedValue.propTypes = {
  value: PropTypes.string
}

/**
 * Options of the building block select: all identifiers of the profile grouped by
 * type, plus one entry per type to create a new source without leaving the builder.
 */
const buildingBlockOptions = (identifiers, composedId) => {
  const groups = SOURCE_TYPES.map(([type, label]) => ({
    label: `Based on ${label}`,
    options: identifiers
      .filter((identifier) => identifier.type === type)
      .map((identifier) => ({ value: identifier.id, label: identifierLabel(identifier) }))
  })).filter((group) => group.options.length > 0);

  const composed = identifiers.filter((identifier) => identifier.type === 'composed'
    && identifier.id !== composedId);
  if (composed.length > 0) {
    groups.push({
      label: 'Other composed metadata',
      options: composed.map((identifier) => ({
        value: identifier.id,
        label: identifierLabel(identifier)
      }))
    });
  }

  groups.push({
    label: 'Create a new source',
    options: SOURCE_TYPES.map(([type, label]) => ({
      value: `${NEW_SOURCE_PREFIX}${type}`,
      label: `+ new source based on ${label}`
    }))
  });

  return groups;
}

function SegmentActions({ onMoveUp, onMoveDown, onRemove }) {
  return (
    <div className="d-flex gap-1 justify-content-end">
      <Button variant="outline-secondary" size="sm" title="Move up"
              disabled={!onMoveUp} onClick={onMoveUp}>
        <ArrowUp size={12}/>
      </Button>
      <Button variant="outline-secondary" size="sm" title="Move down"
              disabled={!onMoveDown} onClick={onMoveDown}>
        <ArrowDown size={12}/>
      </Button>
      <Button variant="danger" size="sm" title="Remove" onClick={onRemove}>
        <X size={12}/>
      </Button>
    </div>
  )
}

SegmentActions.propTypes = {
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
  onRemove: PropTypes.func.isRequired
}

function ReferenceSegment({
                            options,
                            reference,
                            currentValue,
                            isExpanded,
                            onToggleExpand,
                            onSelect,
                            actions,
                            updateIdentifier,
                            updateRegex,
                            referenceIndex
                          }) {
  return (
    <>
      <Row className="align-items-center g-2">
        <Col md={5}>
          <Select
            options={options}
            value={reference ? { value: reference.id, label: identifierLabel(reference) } : null}
            placeholder="Select a metadata source …"
            onChange={(option) => onSelect(option.value)}
          />
        </Col>
        <Col md={4}>
          {reference ? (
            <ResolvedValue value={currentValue}/>
          ) : (
            <span className="text-muted small">not selected yet</span>
          )}
        </Col>
        <Col md={3}>
          <div className="d-flex gap-1 justify-content-end">
            <Button variant={isExpanded ? 'info' : 'outline-info'} size="sm" title="Edit this source"
                    disabled={!reference} onClick={onToggleExpand}>
              <Pencil size={12}/>
            </Button>
            {actions}
          </div>
        </Col>
      </Row>

      {isExpanded && reference && (
        <Row className="mt-2 mb-2">
          <Col>
            <div className="composed-source-editor">
              <DatatableIdentifierInput
                index={referenceIndex}
                identifier={reference}
                updateIdentifier={updateIdentifier}
                updateRegex={updateRegex}
              />
            </div>
          </Col>
        </Row>
      )}
    </>
  )
}

ReferenceSegment.propTypes = {
  options: PropTypes.array.isRequired,
  reference: PropTypes.object,
  currentValue: PropTypes.string,
  isExpanded: PropTypes.bool,
  onToggleExpand: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  actions: PropTypes.node,
  updateIdentifier: PropTypes.func.isRequired,
  updateRegex: PropTypes.func,
  referenceIndex: PropTypes.number
}

function ComposedMetadataModal({
                                 show,
                                 onHide,
                                 identifier,
                                 dataset,
                                 addIdentifier,
                                 updateIdentifier,
                                 updateRegex
                               }) {
  const { profile, tableIdx } = useAdminApp((s) => ({ profile: s.profile, tableIdx: s.tableIdx }));
  const [segments, setSegments] = useState([]);
  const [expandedKey, setExpandedKey] = useState(null);

  // The template string in the profile stays the single source of truth; the local
  // copy only adds stable keys so editing a text block does not lose the focus.
  useEffect(() => {
    if (show) {
      setSegments(withKeys(parseTemplate(identifier.template)));
      setExpandedKey(null);
    }
  }, [show, identifier.id]);

  const applySegments = (nextSegments) => {
    setSegments(nextSegments);
    updateIdentifier(identifier.id, { template: serializeTemplate(nextSegments) });
  }

  const replaceSegment = (index, data) => applySegments(segments.map(
    (segment, i) => (i === index ? { ...segment, ...data } : segment)
  ));

  const removeSegment = (index) => applySegments(segments.filter((_, i) => i !== index));

  const moveSegment = (index, offset) => {
    const nextSegments = [...segments];
    [nextSegments[index], nextSegments[index + offset]] = [nextSegments[index + offset], nextSegments[index]];
    applySegments(nextSegments);
  }

  const addSegment = (segment) => applySegments([...segments, { ...segment, key: uuidv4() }]);

  const selectReference = (index, value) => {
    if (!value.startsWith(NEW_SOURCE_PREFIX)) {
      replaceSegment(index, { id: value });
      return;
    }

    // create a source that only feeds this template: all output options are off
    const newId = `#${uuidv4()}`;
    addIdentifier(value.slice(NEW_SOURCE_PREFIX.length), true, {
      id: newId,
      isDatasetOutput: false,
      isDatatableOutput: false,
      isRdfOutput: false
    });
    replaceSegment(index, { id: newId });
    setExpandedKey(segments[index].key);
  }

  const options = buildingBlockOptions(profile.identifiers ?? [], identifier.id);
  const preview = resolveTemplate({
    identifier: { ...identifier, template: serializeTemplate(segments) },
    profile,
    tableIdx
  });
  const missingLabels = preview.missing
    .map((id) => identifierLabel((profile.identifiers ?? []).find((x) => x.id === id)) || id)
    .join(', ');

  return (
    <AppModal
      show={show}
      onHide={onHide}
      size="xl"
      title="Compose a metadata value"
      closeLabel="Close"
      showFooter
    >
      <small className="text-muted">
        <p className="mb-1">
          Assemble the value of one target field from other metadata and your own words. The blocks
          are separated by a single space automatically; a block that starts with punctuation, such
          as a comma, is attached to the block before it.
        </p>
        <p>
          Sources created here are ordinary metadata entries with all output options switched off, so
          they only feed this value. They stay editable in the metadata list as well.
        </p>
      </small>

      <h5 className="mt-3">Target field</h5>
      <Row>
        <Col sm={6}>
          <OutputLayerInput index={0} identifier={identifier} dataset={dataset}
                            updateIdentifier={(_, data) => updateIdentifier(identifier.id, data)}/>
        </Col>
        <Col sm={6}>
          <OutputKeyInput index={0} identifier={identifier} dataset={dataset}
                          updateIdentifier={(_, data) => updateIdentifier(identifier.id, data)}/>
        </Col>
      </Row>
      {!identifier.isDatasetOutput && (
        <Alert variant="warning" className="mt-2 mb-0 py-1 small">
          Output in the dataset is disabled for this entry. Enable it in the <b>Output</b> section of
          the metadata list, otherwise the composed value is not written to the dataset.
        </Alert>
      )}

      <h5 className="mt-4">Building blocks</h5>
      {segments.length === 0 && (
        <p className="text-muted small">No blocks yet — add a metadata source or a text block.</p>
      )}

      <div className="composed-canvas">
        {segments.map((segment, index) => {
          const actions = (
            <SegmentActions
              onMoveUp={index > 0 ? () => moveSegment(index, -1) : null}
              onMoveDown={index < segments.length - 1 ? () => moveSegment(index, 1) : null}
              onRemove={() => removeSegment(index)}
            />
          );

          if (segment.type === 'text') {
            return (
              <Row key={segment.key} className="align-items-center g-2 composed-segment">
                <Col md={9}>
                  <Form.Control
                    size="sm"
                    value={segment.value ?? ''}
                    placeholder="Your own words, e.g. clamped on"
                    onChange={(event) => replaceSegment(index, { value: event.target.value })}
                  />
                </Col>
                <Col md={3}>{actions}</Col>
              </Row>
            );
          }

          const reference = (profile.identifiers ?? []).find((x) => x.id === segment.id);
          const referenceIndex = (profile.identifiers ?? []).findIndex((x) => x.id === segment.id);

          return (
            <div key={segment.key} className="composed-segment">
              <ReferenceSegment
                options={options}
                reference={reference}
                referenceIndex={referenceIndex}
                currentValue={reference
                  ? resolveIdentifierValue({ identifier: reference, profile, tableIdx })
                  : null}
                isExpanded={expandedKey === segment.key}
                onToggleExpand={() => setExpandedKey(expandedKey === segment.key ? null : segment.key)}
                onSelect={(value) => selectReference(index, value)}
                actions={actions}
                updateIdentifier={updateIdentifier}
                updateRegex={updateRegex}
              />
            </div>
          );
        })}
      </div>

      <div className="d-flex gap-2 mt-2">
        <Button variant="success" size="sm" onClick={() => addSegment({ type: 'reference', id: '' })}>
          + Metadata
        </Button>
        <Button variant="secondary" size="sm" onClick={() => addSegment({ type: 'text', value: '' })}>
          + Text
        </Button>
      </div>

      <h5 className="mt-4">If a block has no value</h5>
      <Row className="align-items-end">
        <Col md={6}>
          <Form.Select
            size="sm"
            value={identifier.onMissing ?? 'skip'}
            onChange={(event) => updateIdentifier(identifier.id, { onMissing: event.target.value })}
          >
            <option value="skip">Write nothing at all</option>
            <option value="empty">Leave the gap empty</option>
            <option value="placeholder">Insert a placeholder text</option>
          </Form.Select>
        </Col>
        {identifier.onMissing === 'placeholder' && (
          <Col md={6}>
            <Form.Control
              size="sm"
              value={identifier.missingPlaceholder ?? ''}
              placeholder="e.g. unknown"
              onChange={(event) => updateIdentifier(identifier.id, {
                missingPlaceholder: event.target.value
              })}
            />
          </Col>
        )}
      </Row>

      <h5 className="mt-4">Result</h5>
      <Alert variant={preview.isSkipped ? 'warning' : 'light'} className="mb-1">
        <code>{preview.value || '—'}</code>
        {preview.missing.length > 0 && (
          <div className="small mt-2">
            No value in the current example file for: {missingLabels}
            {preview.isSkipped && <b> — nothing will be written for this field.</b>}
          </div>
        )}
      </Alert>
      <small className="text-muted">
        The preview uses the example file and input table currently selected on the left. For looped
        output tables the value is built per input table during the conversion.
      </small>
    </AppModal>
  )
}

ComposedMetadataModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  identifier: PropTypes.object.isRequired,
  dataset: PropTypes.object,
  addIdentifier: PropTypes.func.isRequired,
  updateIdentifier: PropTypes.func.isRequired,
  updateRegex: PropTypes.func
}

export default ComposedMetadataModal

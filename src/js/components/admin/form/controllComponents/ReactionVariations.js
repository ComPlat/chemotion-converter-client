import React, {useCallback, useEffect, useState} from "react";
import PropTypes from "prop-types";
import {Button, Card, Table} from "react-bootstrap";
import Select from 'react-select';
import {DatatableIdentifierInput} from "../IdentifierInput";
import {useAdminApp} from "../../AppContext";
import {getFileMetadataOptions, getInputTables, getTableMetadataOptions} from "../../../../utils/profileUtils";
import {initIdentifier} from "../../../../utils/identifierUtils";
import {v4 as uuidv4} from 'uuid';

function ReactionVariationsRow({activeButton = null, onRemove = null, identifiers, element, onEdit}) {
  const identifierText = (id) => {
    if (!id) return 'add identifier';
    const identifier = identifiers.find((iden) => iden.id === id);
    if (!identifier) return '';

    if (identifier.type === "fileMetadata") {
      return `File metadata: ${identifier.key} -> ${identifier.value ?? ''}`;
    }
    if (identifier.type === "tableMetadata") {
      return `Table #${identifier.tableIndex} metadata: ${identifier.key} ${identifier.value ?? ''}`;
    }
    return `Table #${identifier.tableIndex} headers: ${identifier.value} ${identifier.lineNumber ? 'Line: ' + identifier.lineNumber : ''}`;
  }
  return (<tr>
    {element.map((x, i) => {
        return <td key={i}><Button variant={x ? "outline-info" : activeButton === i ? "warning" : "outline-warning"}
                                   onClick={() => onEdit(i, x)}
                                   className="identifier-variation-btn">{identifierText(x)}</Button>
          {i === 0 && onRemove &&
            <Button className="variation-row-remove-btn" variant="danger" onClick={onRemove}>X</Button>}
        </td>
      }
    )}
  </tr>);
}

ReactionVariationsRow.propTypes = {
  identifiers: PropTypes.shape({}).isRequired,
  element: PropTypes.arrayOf(PropTypes.string).isRequired,
  onEdit: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
  activeButton: PropTypes.number,
};

ReactionVariationsRow.defaultProps = {
  activeButton: null,
  onRemove: null
}

function ReactionVariationsOverView({reactionVariations, handleRemove, handleOnEdit, handleAdd}) {
  return (<>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4>Variation sample values</h4>
      <Button onClick={handleAdd}>
        + Add
      </Button>
    </div>

    <Table striped bordered hover>
      <thead>
      <tr>
        <th className="identifier-variation-header">Sample</th>
        <th className="identifier-variation-header">Amount</th>
        <th className="identifier-variation-header">Unit</th>
      </tr>
      </thead>
      <tbody>
      {reactionVariations.elements.map((x, i) => {
        return <ReactionVariationsRow
          key={i}
          identifiers={reactionVariations.identifiers}
          element={x}
          onRemove={() => {
            handleRemove(i);
          }}
          onEdit={(buttonIdx) => {
            handleOnEdit(i, buttonIdx);
          }}
        />
      })}

      </tbody>
    </Table>
  </>);
}

ReactionVariationsOverView.propTypes = {
  reactionVariations: PropTypes.shape({
    identifiers: PropTypes.shape({}).isRequired,
    elements: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired
  }).isRequired,
  handleOnEdit: PropTypes.func.isRequired,
  handleRemove: PropTypes.func.isRequired,
  handleAdd: PropTypes.func.isRequired
};

function ReactionVariationEditView({activeRow, tableIdx, activeButton, reactionVariations, handleOnEdit}) {
  const tabOptions = [
    {value: "fileMetadata", label: "Based on file metadata"},
    {value: "tableMetadata", label: "Based on table metadata"},
    {value: "tableHeader", label: "Based on table headers"},
  ];
  const activeId = activeRow[activeButton];
  const [active, setActive] = useState(tabOptions[0]);
  const {profile, updateProfile: setProfile} = useAdminApp();
  const [identifier, _setIdentifier] = useState(null)

  const setIdentifier = (identifier) => {
    _setIdentifier(identifier);
    setProfile(profile);
  }

  useEffect(() => {
    if (!activeId) {
      activeRow[activeButton] = uuidv4();
      setProfile(profile);
    }

  }, [activeId, activeButton, activeRow])

  const findIdentifier = useCallback((byId) => {
    return reactionVariations.identifiers.find((x) => x.id === byId);
  }, [reactionVariations.identifiers]);

  useEffect(() => {
    if (activeId) {
      let cIdentifier = findIdentifier(activeId);
      if (!cIdentifier || cIdentifier.type !== active.value) {
        if (cIdentifier) {
          reactionVariations.identifiers = reactionVariations.identifiers.filter((x) => x.id !== activeId)
        }
        cIdentifier = initIdentifier(profile, active.value, tableIdx);
        cIdentifier.id = activeId;
        reactionVariations.identifiers.push(cIdentifier);
        cIdentifier.optional = false;
        setIdentifier(cIdentifier);
      } else {
        _setIdentifier(cIdentifier);
      }
    }
  }, [activeId, active])


  const inputTables = getInputTables(profile, tableIdx);
  const fileMetadataOptions = getFileMetadataOptions(profile, tableIdx);
  const tableMetadataOptions = getTableMetadataOptions(profile, tableIdx);

  const updateIdentifier = useCallback((data) => {
    const newIdentifier = Object.assign(identifier, data)
    setIdentifier(newIdentifier);
  }, [identifier]);


  return (<>
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4>Edit Variation identifier</h4>
      <Button variant="warning" onClick={() => handleOnEdit(-1, -1)}>
        Close
      </Button>
    </div>
    <Table>
      <tbody><ReactionVariationsRow
        activeButton={activeButton}
        identifiers={reactionVariations.identifiers}
        element={activeRow}
        onEdit={(buttonIdx, id) => {
          if (id) {
            const newIdentifierType = findIdentifier(id)?.type;
            const newTypeOption = tabOptions.find((x) => x.value === newIdentifierType);
            setActive(newTypeOption);
          }
          handleOnEdit(-1, buttonIdx);
        }}/></tbody>
    </Table>
    <h5>Edit {activeButton === 0 ? "Sample name" : activeButton === 1 ? "Amount value" : "Unit"} Identifier</h5>
    <Select
      value={active}
      onChange={setActive}
      options={tabOptions}
    />
    {identifier && <DatatableIdentifierInput
      index={0}
      identifier={identifier}
      inputTables={inputTables}
      fileMetadataOptions={fileMetadataOptions}
      tableMetadataOptions={tableMetadataOptions}
      updateIdentifier={(x, y) => updateIdentifier(y)}
    />}
  </>)
    ;
}

ReactionVariationEditView.propTypes = {
  reactionVariations: PropTypes.shape({
    identifiers: PropTypes.shape({}).isRequired,
    elements: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired
  }).isRequired,
  handleOnEdit: PropTypes.func.isRequired,
  activeRow: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeButton: PropTypes.number.isRequired,
  tableIdx: PropTypes.number.isRequired
};


function ReactionVariations({tableIdx}) {
  const {profile, updateProfile: setProfile} = useAdminApp();
  const [activeRow, setActiveRow] = useState(null);
  const [activeElement, setActiveElement] = useState(null);

  const handleAdd = useCallback(() => {
    profile.reactionVariations.elements.push([null, null, null]);
    setProfile(profile);
  }, [profile]);

  const handleRemove = useCallback((idx) => {
    const ids = profile.reactionVariations.elements[idx].filter(Boolean);
    profile.reactionVariations.elements.splice(idx, 1);
    profile.reactionVariations.identifiers = profile.reactionVariations.identifiers.filter((x) => !ids.includes(x.id));
    setProfile(profile);
  }, [profile]);

  const handleOnEdit = useCallback((rowIdx, colIdx) => {
    if (colIdx === -1) {
      setActiveRow(null);
      setActiveElement(null);
      return;
    }
    if (rowIdx > -1) {
      setActiveRow(profile.reactionVariations.elements[rowIdx]);
    }
    setActiveElement(colIdx);
  }, []);
  return (
    <Card className="mt-3">
      <Card.Header>Reaction Variations</Card.Header>
      <Card.Body>
        <small>
          <div className="text-muted">
            Here you can define autofill values for reaction variations.
            Each entry must be provided as a triplet:
            <ul>
              <li>the sample (identified by its external name)</li>
              <li>the amount (numeric value)</li>
              <li>the unit (l, mol, g, etc.)</li>
            </ul>
            This feature is only applicable if the analysis is linked to a reaction variation.
          </div>
        </small>


        {activeRow ?
          <ReactionVariationEditView activeRow={activeRow}
                                     tableIdx={tableIdx}
                                     reactionVariations={profile.reactionVariations}
                                     activeButton={activeElement}
                                     handleOnEdit={handleOnEdit}/> :
          <ReactionVariationsOverView handleAdd={handleAdd} handleRemove={handleRemove}
                                      reactionVariations={profile.reactionVariations}
                                      handleOnEdit={handleOnEdit}/>
        }
      </Card.Body>
    </Card>);
}

ReactionVariations.propTypes = {
  tableIdx: PropTypes.number.isRequired
}

export default ReactionVariations;
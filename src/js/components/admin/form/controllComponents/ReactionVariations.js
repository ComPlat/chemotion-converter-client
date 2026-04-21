import React, {useCallback, useState} from "react";
import PropTypes from "prop-types";
import {Card, Button, Tabs, Table, Tab} from "react-bootstrap";
import IdentifierForm from "../IdentifierForm";
import IdentifierInput from "../IdentifierInput";

function ReactionVariationsRow({activeButton = null, identifiers, element, onEdit}) {
  return (<tr>
    {element.map((x, i) => <td key={i}><Button variant={x ? "info" : activeButton === i ? "warning" : "outline-warning"}
                                               onClick={() => onEdit(i)}
                                               className="identifier-variation-btn">{x || "add identifier"}</Button>
    </td>)}
  </tr>);
}

ReactionVariationsRow.propTypes = {
  identifiers: PropTypes.shape({}).isRequired,
  element: PropTypes.arrayOf(PropTypes.string).isRequired,
  onEdit: PropTypes.func.isRequired,
  activeButton: PropTypes.number,
};

ReactionVariationsRow.defaultProps = {
  activeButton: null
}

function ReactionVariationsOverView({reactionVariations, handleOnEdit, handleAdd}) {
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
        <th className="identifier-variation-header">Value</th>
        <th className="identifier-variation-header">Unit</th>
      </tr>
      </thead>
      <tbody>
      {reactionVariations.elements.map((x, i) => {
        return <ReactionVariationsRow
          key={i}
          identifiers={reactionVariations.identifiers}
          element={x}
          onEdit={(buttonIdx) => {
            handleOnEdit(i, buttonIdx)
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
  handleAdd: PropTypes.func.isRequired
};

function ReactionVariationEditView({activeRow, profile, activeButton, reactionVariations, handleOnEdit}) {
  const [activeType, setActiveType] = useState('tableMetadata')
  const identifier = reactionVariations.identifiers.find((x) => x.uuid !== activeButton);

  const tabs = [['Based on file metadata', 'fileMetadata'],
    ['Based on table metadata', 'tableMetadata'],
    ['Based on table headers', 'tableHeader']].map(([label, type]) => (

    <IdentifierInput
                    index={0}
                    optional={false}
                    options={options}
                    identifier={identifier}
                    profile={profile}
                    fileMetadataOptions={fileMetadataOptions}
                    tableMetadataOptions={tableMetadataOptions}
                    inputTables={inputTables}
                    outputTables={outputTables}
                    dataset={dataset}
                    updateIdentifier={updateIdentifier}
                    removeIdentifier={removeIdentifier}
                    updateIdentifierOperation={updateIdentifierOperation}
                    updateIdentifierOntology={updateIdentifierOntology}
                    removeIdentifierOperation={removeIdentifierOperation}
                    updateRegex={updateRegex}
                    addIdentifierOperation={addIdentifierOperation}
                  />
  ))


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
        onEdit={(buttonIdx) => {
          handleOnEdit(-1, buttonIdx);
        }}
      /></tbody>
    </Table>
    <Tabs activeKey={activeType}
          onSelect={(k) => setActiveType(k)}
          id="main-form-tabs"
          className="mb-3">

      <Tab eventKey="fileMetadata" title="File metadata">
        <p>Based on file metadata</p>
      </Tab>

      <Tab eventKey="tableMetadata" title="Table metadata">
        <p>Based on table metadata</p>
      </Tab>

      <Tab eventKey="tableHeader" title="Table header">
        <p>Based on table header</p>
      </Tab>
    </Tabs>
  </>);
}

ReactionVariationEditView.propTypes = {
  reactionVariations: PropTypes.shape({
    identifiers: PropTypes.shape({}).isRequired,
    elements: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired
  }).isRequired,
  handleOnEdit: PropTypes.func.isRequired,
  activeRow: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeButton: PropTypes.number.isRequired
};


function ReactionVariations({profile, setProfile}) {
  const [activeRow, setActiveRow] = useState(null);
  const [activeElement, setActiveElement] = useState(null);

  const handleAdd = useCallback(() => {
    profile.reactionVariations.elements.push([null, null, null]);
    setProfile(profile);
  }, []);

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
          <p className="text-muted">
            Here you can set reaction variations autofill values. The values must be set as triplets:
            one finds the sample by its external name, one is the amount, and the last one is the unit.
            This is only useful if the analyses contain a datafile.
          </p>
        </small>


        {activeRow ?
          <ReactionVariationEditView activeRow={activeRow}
                                     reactionVariations={profile.reactionVariations}
                                     activeButton={activeElement}
                                     profile={profile}
                                     handleOnEdit={handleOnEdit}/> :
          <ReactionVariationsOverView handleAdd={handleAdd} reactionVariations={profile.reactionVariations}
                                      handleOnEdit={handleOnEdit}/>
        }
      </Card.Body>
    </Card>);
}

ReactionVariations.propTypes = {
  profile: PropTypes.object.isRequired,
  setProfile:
  PropTypes.func.isRequired
};

export default ReactionVariations;
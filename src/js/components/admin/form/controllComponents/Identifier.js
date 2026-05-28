import {Button, Card, Collapse} from "react-bootstrap";
import IdentifierForm from "../IdentifierForm";
import React, {useState} from "react";
import PropTypes from "prop-types";
import {
  getFileMetadataOptions,
  getInputTables,
  getTableMetadataOptions
} from "../../../../utils/profileUtils";
import {BuildIdentifierHandler} from "../../../../utils/identifierUtils";
import {useAdminApp} from "../../AppContext";


function CheckIdentifier({dataset, tableIdx}) {
  const {profile, updateProfile: setProfile} = useAdminApp();

  const inputTables = getInputTables(profile, tableIdx);
  const fileMetadataOptions = getFileMetadataOptions(profile, tableIdx);
  const tableMetadataOptions = getTableMetadataOptions(profile, tableIdx);

  const ih = BuildIdentifierHandler(profile, setProfile, dataset, tableIdx);

  return (<Card className="mt-3">
    <Card.Header>Identifiers</Card.Header>
    <Card.Body>
      {
        [['Based on file metadata', 'fileMetadata'],
          ['Based on table metadata', 'tableMetadata'],
          ['Based on table headers', 'tableHeader']].map(([label, type]) => (
          <IdentifierForm
            key={type}
            label={label}
            type={type}
            optional={false}
            identifiers={profile.identifiers}
            fileMetadataOptions={fileMetadataOptions}
            tableMetadataOptions={tableMetadataOptions}
            inputTables={inputTables}
            outputTables={profile.tables}
            dataset={dataset}
            addIdentifier={ih.addIdentifier}
            updateIdentifier={ih.updateIdentifier}
            removeIdentifier={ih.removeIdentifier}
            addIdentifierOperation={ih.addIdentifierOperation}
            updateIdentifierOperation={ih.updateIdentifierOperation}
            updateIdentifierOntology={ih.updateIdentifierOntology}
            removeIdentifierOperation={ih.removeIdentifierOperation}
            updateRegex={ih.updateRegex}
          />
        ))
      }
      <small>
        <p className="text-muted">
          The identifiers you create here are used to find the correct profile for uploaded files.
        </p>
        <ul className="text-muted">
          <li>
            The <code>Value</code> will be compared to the selected metadata or to the header of a table. If
            you select <code>Regex</code>, you can enter a regular expression as value.
          </li>
          <li>If you provide a line number, only this line of the header will be used. If line number is
            ommited, the whole header is compared (or searched with the Regex).
          </li>
        </ul>
      </small>
    </Card.Body>
  </Card>)
}

CheckIdentifier.propTypes = {
  dataset: PropTypes.object,
  tableIdx: PropTypes.number.isRequired
};


function MetadataIdentifier({dataset, tableIdx}) {
  const {profile, updateProfile: setProfile, options} = useAdminApp();

  const inputTables = getInputTables(profile, tableIdx);
  const fileMetadataOptions = getFileMetadataOptions(profile, tableIdx);
  const tableMetadataOptions = getTableMetadataOptions(profile, tableIdx);

  const ih = BuildIdentifierHandler(profile, setProfile, dataset, tableIdx);
  const [open, setOpen] = useState(false);

  return (<>
    <Card className="mt-3">
      <Card.Header>Info
        <Button
          className="m-lg-2"
        variant="outline-dark"
        onClick={() => setOpen(!open)}
        aria-controls="card-content"
        aria-expanded={open}
      >
          <b>{open ? '-' : '+'}</b>
      </Button>
      </Card.Header>
      <Collapse in={open}>
        <Card.Body>
          <small>
            <p className="text-muted">
              The metadata you define here are extracted from the input file and added to the output tables.
            </p>
            <ul className="text-muted">
              <li>
                As above, the <code>Value</code> will be compared to the selected metadata or to the header of a
                table. If you select <code>Regex</code>, you can enter a regular expression as value.
              </li>
              <li>Also, if you provide a line number, only this line of the header will be used. If line number is
                ommited, the whole header is compared (or searched with the Regex).
              </li>
              <li>
                If groups are used in the regular expression (e.g. <code>Key: (.*?)</code>) only the first group
                will be extracted as metadata.
              </li>
              <li>
                If you enter an <code>Output key</code> the matched value will be added to the output tables. If
                you set an <code>Output table</code> explicitely, it will only be added to this table, otherwise
                it will be added to all output tables.
              </li>
              <li>
                The <code>Output layer</code> input is used for additional processing in the Chemotion ELN.
              </li>
            </ul>
          </small>
        </Card.Body>
      </Collapse>
    </Card>
    <Card className="mt-3">
      <Card.Header>Metadata</Card.Header>
      <Card.Body>
        {
          [['Based on file metadata', 'fileMetadata'],
            ['Based on table metadata', 'tableMetadata'],
            ['Based on table headers', 'tableHeader']].map(([label, type]) => (
            <IdentifierForm
              key={type}
              label={label}
              type={type}
              optional={true}
              identifiers={profile.identifiers}
              fileMetadataOptions={fileMetadataOptions}
              tableMetadataOptions={tableMetadataOptions}
              inputTables={inputTables}
              outputTables={profile.tables}
              dataset={dataset}
              options={options}
              addIdentifier={ih.addIdentifier}
              updateIdentifier={ih.updateIdentifier}
              removeIdentifier={ih.removeIdentifier}
              addIdentifierOperation={ih.addIdentifierOperation}
              updateIdentifierOperation={ih.updateIdentifierOperation}
              updateIdentifierOntology={ih.updateIdentifierOntology}
              removeIdentifierOperation={ih.removeIdentifierOperation}
              updateRegex={ih.updateRegex}
            />
          ))
        }
      </Card.Body>
    </Card>
  </>)
}

MetadataIdentifier.propTypes = {
  dataset: PropTypes.object,
  tableIdx: PropTypes.number.isRequired
};

export {
  CheckIdentifier,
  MetadataIdentifier
}

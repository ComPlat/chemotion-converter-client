import {Card, Col, Nav, NavDropdown, OverlayTrigger, Popover, Row} from "react-bootstrap";
import PropTypes from 'prop-types';
import React, {useState} from "react";
import FileHeaderPresenter from "../HeaderPresenter";
import {AgGridReact} from "ag-grid-react";
import TruncatedTextWithTooltip from "./TruncatedTextWithTooltip";
import {BuildIdentifierHandler} from "../../../../utils/identifierUtils";

const columnShape = PropTypes.shape({
  key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string
});

const inputTableShape = PropTypes.shape({
  metadata: PropTypes.object,
  header: PropTypes.arrayOf(PropTypes.string),
  rows: PropTypes.arrayOf(PropTypes.array),
  columns: PropTypes.arrayOf(columnShape)
});

const profileShape = PropTypes.shape({
  data: PropTypes.shape({
    metadata: PropTypes.object,
    tables: PropTypes.arrayOf(inputTableShape)
  })
});

function FileHeader({setActiveTabKey, header, tableIndex, profile, setProfile}) {
  const { addIdentifier, updateRegex } = BuildIdentifierHandler(profile, setProfile, null);
  return <FileHeaderPresenter addIdentifier={(value) => {
    setActiveTabKey('metadata');
    addIdentifier('tableHeader', true, {match: "regex", value, tableIndex})
  }} header={header} updateRegex={(value) => {
    return updateRegex({lineNumber: null, tableIndex, value, match: 'regex'});
  }} profile={profile} setProfile={setProfile} tableIndex={tableIndex}
  ></FileHeaderPresenter>
}

function DataGrid({table}) {
  const columnDefs = table.columns.map(column => ({
    field: column.key,
    headerName: column.name
  }));

  const defaultColDef = {
    resizable: true,
    lockPosition: true
  };

  const rowData = table.rows.map(row =>
    Object.fromEntries(row.map((value, idx) => [idx, value]))
  );

  const onGridReady = (params) => {
    const api = params.api;
  };


  return (
    <div className="ag-theme-alpine">
      <AgGridReact
        enableColResize
        columnDefs={columnDefs}
        rowData={rowData}
        defaultColDef={defaultColDef}
        domLayout='autoHeight'
        suppressRowHoverHighlight={true}
        onGridReady={onGridReady}
      />
    </div>
  );
}

FileHeader.propTypes = {
  setActiveTabKey: PropTypes.func.isRequired,
  header: PropTypes.arrayOf(PropTypes.string),
  tableIndex: PropTypes.number.isRequired,
  profile: profileShape.isRequired,
  setProfile: PropTypes.func.isRequired
};

DataGrid.propTypes = {
  table: inputTableShape.isRequired
};


function Metadata({metadata}) {
  return (
    <Card>
      <Card.Body>
        <Row as="dl">
          {Object.keys(metadata).map((key, index) => (
            <React.Fragment key={index}>
              <TruncatedTextWithTooltip text={key}/>
              <Col as="dd" lg={7}>{metadata[key] || ' '}</Col>
            </React.Fragment>
          ))}
        </Row>
      </Card.Body>
    </Card>
  )
}

Metadata.propTypes = {
  metadata: PropTypes.object.isRequired
};

function TabContents({setActiveTabKey, profile, setProfile, activeTable, activeKey}) {
  return (
    <div className="mt-3">
      {activeTable && (
        <div key={`tab-content-${activeKey}`}>
          {/* Metadata Section */}
          {activeTable.metadata && Object.keys(activeTable.metadata).length > 0 && (
            <div className="mt-3">
              <h4>Input table metadata</h4>
              <Metadata metadata={activeTable.metadata}/>
            </div>
          )}

          {/* Header Section */}
          {activeTable.header && activeTable.header.length > 0 && (
            <div className="mt-3">
              <h4>
                Input table header
                <OverlayTrigger
                  placement="bottom"
                  overlay={
                    <Popover id="header-popover-select-info">
                      <Popover.Header as="h3">
                        How to generate Identifier
                      </Popover.Header>
                      <Popover.Body>
                        To generate an identifier, please highlight the
                        value you wish to extract. Then press the “New
                        Identifier” button in the appearing dialog. Please
                        remember to check the regular expression and ensure
                        it produces the correct output.
                      </Popover.Body>
                    </Popover>
                  }
                >
                    <span
                      style={{
                        borderRadius: '10px',
                        display: 'inline-block',
                        marginLeft: '5px',
                      }}
                      className="ml-3 btn btn-outline-info btn-sm"
                    >
                      Hint
                    </span>
                </OverlayTrigger>
              </h4>
              <FileHeader setActiveTabKey={setActiveTabKey} profile={profile} setProfile={setProfile} header={activeTable.header} tableIndex={activeKey}></FileHeader>
            </div>
          )}

          {/* Data Section */}
          {activeTable.rows && activeTable.rows.length > 0 && (
            <div className="mt-3">
              <h4>Input table data</h4>
              <DataGrid table={activeTable}/>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

TabContents.propTypes = {
  setActiveTabKey: PropTypes.func.isRequired,
  profile: profileShape.isRequired,
  setProfile: PropTypes.func.isRequired,
  activeTable: inputTableShape,
  activeKey: PropTypes.number.isRequired
};

function InputTables({profile, setProfile, setActiveTabKey}) {
  const handleSelect = (selectedKey) => {
    setActiveKey(Number(selectedKey));
  };


  const tabs = (profile.data.tables.map((table, idx) => (
    <NavDropdown.Item eventKey={idx} key={idx}>
      {`Input table # ${idx}`}
    </NavDropdown.Item>
  )));

  // state
  const [activeKey, setActiveKey] = useState(0);

  return (<Col md={7}>
    {profile.data
      ? (
        <div className="scroll">
          <h4>Input file metadata</h4>
          {Object.keys(profile.data.metadata).length > 0 && (<Metadata metadata={profile.data.metadata}></Metadata>)}
          <h4 className="mt-3">Input tables</h4>
          <Nav
            variant="tabs"
            activeKey={activeKey}
            onSelect={handleSelect}
            id="nav-tab-example"
          >
            <NavDropdown title={`Input table # ${activeKey}`} id="nav-dropdown">
              {tabs}
            </NavDropdown>
          </Nav>
          <TabContents setActiveTabKey={setActiveTabKey} profile={profile} setProfile={setProfile} activeTable={profile.data.tables[activeKey]} activeKey={activeKey}></TabContents>
        </div>
      ) : (
        <p>
          <em>The profile does not contain the initial uploaded data.</em>
        </p>
      )}
  </Col>);
}

InputTables.propTypes = {
  profile: profileShape.isRequired,
  setProfile: PropTypes.func.isRequired,
  setActiveTabKey: PropTypes.func.isRequired
}

export default InputTables

import {Button, Card, Col, Nav, NavDropdown, OverlayTrigger, Popover, Row} from "react-bootstrap";
import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from "react";
import FileHeaderPresenter from "../HeaderPresenter";
import {AgGridReact} from "ag-grid-react";
import TruncatedTextWithTooltip from "./TruncatedTextWithTooltip";
import {BuildIdentifierHandler} from "../../../../utils/identifierUtils";
import {getProfileData} from "../../../../utils/profileUtils";
import {useAdminApp} from "../../AppContext";

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

const profileDataShape = PropTypes.shape({
  metadata: PropTypes.object,
  tables: PropTypes.arrayOf(inputTableShape)
});

const profileShape = PropTypes.shape({
  data: PropTypes.oneOfType([
    profileDataShape,
    PropTypes.arrayOf(profileDataShape)
  ])
});

function FileHeader({header, tableIndex, tableIdx}) {
  const {activeTabKey, setActiveTabKey, profile, updateProfile} = useAdminApp();
  const {addIdentifier, updateRegex} = BuildIdentifierHandler(profile, updateProfile, null, tableIdx);

  return <FileHeaderPresenter addIdentifier={(value) => {
    setActiveTabKey('metadata');
    addIdentifier('tableHeader', true, {match: "regex", value, tableIndex})
  }} header={header} updateRegex={(value) => {
    return updateRegex({type: 'tableHeader', tableIndex, value, match: 'regex'});
  }} tableIndex={tableIndex}
                              dataIndex={tableIdx}
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
  header: PropTypes.arrayOf(PropTypes.string),
  tableIndex: PropTypes.number.isRequired,
  tableIdx: PropTypes.number.isRequired
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

function TabContents({activeTable, activeKey, tableIdx}) {
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
              <FileHeader header={activeTable.header} tableIndex={activeKey} tableIdx={tableIdx}></FileHeader>
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
  activeTable: inputTableShape,
  activeKey: PropTypes.number.isRequired,
  tableIdx: PropTypes.number.isRequired
};

function InputTables({tableIdx, setTableIdx, onDeleteInputFile}) {
  const {profile} = useAdminApp();
  const profileData = useMemo(()=> getProfileData(profile, tableIdx), [tableIdx]);

  const handleSelect = (selectedKey) => {
    setActiveKey(Number(selectedKey));
  };

  const handleSourceSelect = (selectedKey) => {
    setTableIdx(Number(selectedKey));
  };

  const tabs = useMemo(()=>(profileData?.tables ?? []).map((table, idx) => (
    <NavDropdown.Item eventKey={idx} key={idx}>
      {`Input table # ${idx}`}
    </NavDropdown.Item>
  )), [tableIdx]);

  // state
  const [activeKey, setActiveKey] = useState(0);

  useEffect(() => {
    if (Array.isArray(profile.data) && tableIdx >= profile.data.length) {
      setTableIdx(0);
      return;
    }

    if (!Array.isArray(profile.data) && tableIdx !== 0) {
      setTableIdx(0);
    }
  }, [profile.data, setTableIdx, tableIdx]);

  useEffect(() => {
    if (!profileData?.tables?.length) {
      setActiveKey(0);
      return;
    }

    if (activeKey >= profileData.tables.length) {
      setActiveKey(0);
    }
  }, [activeKey, profileData]);

  return (<Col md={7}>
    {profileData
      ? (
        <div className="scroll">
          <h4>Input file metadata</h4>
          {Array.isArray(profile.data) && profile.data.length > 1 && (
            <Nav
              variant="tabs"
              activeKey={tableIdx}
              onSelect={handleSourceSelect}
              id="nav-data-source"
              className="mb-3"
            >
              <NavDropdown title={profile.data[tableIdx].metadata.file_name} id="nav-data-source-dropdown">
                {profile.data.map((dataEntry, idx) => (
                  <NavDropdown.Item eventKey={idx} key={idx}
                                    className="d-flex justify-content-between align-items-center">
                    <span>{profile.data[idx].metadata.file_name}</span>

                    <Button
                      variant="danger"
                      size="sm"
                      className="ms-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteInputFile(idx);
                      }}
                    >
                      ✕
                    </Button>

                  </NavDropdown.Item>
                ))}
              </NavDropdown>
            </Nav>
          )}
          {Object.keys(profileData.metadata).length > 0 && (<Metadata metadata={profileData.metadata}></Metadata>)}
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
          <TabContents activeTable={profileData.tables[activeKey]} activeKey={activeKey}
                       tableIdx={tableIdx}></TabContents>
        </div>
      ) : (
        <p>
          <em>The profile does not contain the initial uploaded data.</em>
        </p>
      )}
  </Col>);
}

InputTables.propTypes = {
  tableIdx: PropTypes.number.isRequired,
  setTableIdx: PropTypes.func.isRequired,
  onDeleteInputFile: PropTypes.func.isRequired
}

export default InputTables

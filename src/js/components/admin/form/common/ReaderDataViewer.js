import React, { Component } from "react"
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { Tabs, Tab } from 'react-bootstrap';

class RenderDataViewer extends Component {

    constructor(props) {
        super(props);
    }

    renderMetadata(metadata) {
        return (
            <div className="panel panel-default">
                <div className="panel-body">
                    <dl className="dl-horizontal mb-0">
                        {
                            Object.keys(metadata).map((key, index) => {
                                return (
                                    <React.Fragment key={index}>
                                        <dt>{key}:</dt>
                                        <dd>{metadata[key] || ' '}</dd>
                                    </React.Fragment>
                                )
                            })
                        }
                    </dl>
                </div>
            </div>
        )
    }

    renderHeader(header) {
        return (
            <pre>
        {
            header.map((line, index) => {
                return <code key={index}>{line}</code>
            })
        }
      </pre>
        )
    }

    renderDataGrid(table) {
        const columnDefs = table.columns.map(column => ({
            field: column.key,
            headerName: column.name
        }))

        const defaultColDef = {
            resizable: true,
            lockPosition: true
        };

        const rowData = table.rows.map(row => {
            return Object.fromEntries(row.map((value, idx) => {
                return [idx, value]
            }))
        })

        return (
            <div className="ag-theme-alpine">
                <AgGridReact
                    enableColResize
                    columnDefs={columnDefs}
                    rowData={rowData}
                    defaultColDef={defaultColDef}
                    domLayout='autoHeight'
                    suppressRowHoverHighlight={true}
                    onGridReady={this.props.onGridReady}
                />
            </div>
        )
    }

    render() {
        const { profile_data } = this.props

        const tabContents = [];
        if (profile_data) {
            profile_data.tables.forEach((table, idx) => {
                tabContents.push(
                    <Tab key={`tableTab${idx}`} eventKey={idx} title={`Input table # ${idx}`}>
                        {
                            table.metadata !== undefined && Object.keys(table.metadata).length > 0 &&
                            <div className="mt-20">
                                <h4>Input table metadata</h4>
                                {this.renderMetadata(table.metadata)}
                            </div>
                        }
                        {
                            table.header !== undefined && table.header.length > 0 &&
                            <div className="mt-20">
                                <h4>Input table header</h4>
                                {this.renderHeader(table.header)}
                            </div>
                        }
                        {
                            table.rows !== undefined && table.rows.length > 0 &&
                            <div className="mt-20">
                                <h4>Input table data</h4>
                                {this.renderDataGrid(table)}
                            </div>
                        }
                    </Tab>
                );
            });
        }

        return (
            <div>
                    {
                        profile_data ? <div>
                            <h4>Input file metadata</h4>
                            {Object.keys(profile_data.metadata).length > 0 && this.renderMetadata(profile_data.metadata)}
                            <h4>Input tables</h4>
                            <Tabs defaultActiveKey={0} id="uncontrolled-tab-example">
                                {tabContents}
                            </Tabs>
                        </div> : <p>
                            <em>The profile does not contain the initial uploaded data.</em>
                        </p>
                    }
            </div>
        )
    }

}

RenderDataViewer.propTypes = {
    status: PropTypes.string,
    profile_data: PropTypes.object,
    onGridReady: PropTypes.func
}

export default RenderDataViewer

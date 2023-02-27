import React, {Component} from "react"
import PropTypes from 'prop-types';
import {Tabs, Tab} from 'react-bootstrap';

import {
    addIdentifier, updateIdentifierOperation, removeIdentifier, newIdentifier,
    removeIdentifierOperation, updateIdentifier, addIdentifierOperation, addTable
} from '../../../utils/identifierUtils'

import IdentifierForm from './IdentifierForm'
import IdentifierInput from "./IdentifierInput";
import ConverterApi from "../../../api/ConverterApi";
import RenderDataViewer from "./common/ReaderDataViewer";

class ReaderForm extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedFile: null,
            hide_info: false,
            profileCheck: null,
            err: {}
        }

        for (let func of [addIdentifier, updateIdentifierOperation, removeIdentifier, removeIdentifierOperation, updateIdentifier, addIdentifierOperation]) {
            this[func.name] = (function () {
                let args = Array.from(arguments)
                const reader = Object.assign({}, this.props.reader)
                args.push(reader, this.props.updateReader)
                func.apply(this, args)
            }).bind(this)
        }

        this.updateFile = this.updateFile.bind(this)

        this.removeTable = this.removeTable.bind(this)
        this.moveTable = this.moveTable.bind(this)
        this.updateTable = this.updateTable.bind(this)
        this.updateStartTable = this.updateStartTable.bind(this)
        this.updateSepTable = this.updateSepTable.bind(this)
        this.checkFile = this.checkFile.bind(this)


    }

    addTable() {
        const reader = Object.assign({}, this.props.reader)
        addTable('match', false, reader, this.props.updateReader)
    }

    removeTable(i) {
        const reader = Object.assign({}, this.props.reader)
        reader.tables.splice(i, 1)
        this.props.updateReader(reader)
    }

    moveTable(i, newI) {
        const reader = Object.assign({}, this.props.reader)
        let temp = reader.tables[i]
        reader.tables[i] = reader.tables[newI]
        reader.tables[newI] = temp
        this.props.updateReader(reader)
    }

    updateFile(event) {
        var fr = new FileReader();
        fr.onload = () => {
            this.setState({
                selectedFileContent: fr.result,
                selectedFile: event.target.files[0]
            })
        }

        fr.readAsText(event.target.files[0]);
    }

    Noname


    updateStartTable(index, valueMap) {
        this.updateTable(index, {'start': valueMap})
    }

    updateSepTable(index, valueMap) {
        this.updateTable(index, {'seperator': valueMap})
    }

    updateTable(index, valueMap) {
        const reader = Object.assign({}, this.props.reader)
        if (index !== -1) {
            this._updateTable(reader.tables[index], valueMap)

            this.props.updateReader(reader)
        }
    }

    _updateTable(elem, valueMap) {
        // TODO Error management
        if (!elem || typeof elem !== 'object' || typeof valueMap !== 'object') return
        for (const [key, value] of Object.entries(valueMap)) {
            if (typeof value === 'object') {
                this._updateTable(elem[key], value)
            } else if (key in elem) {
                elem[key] = value
            } else {
                // TODO Error management
            }
        }
    }

    checkFile() {
        const {selectedFile} = this.state


        this.setState({
            isLoading: true
        })

        ConverterApi.fetchTables(selectedFile)
            .then(data => {
                if (data) {

                    this.setState({
                        profileCheck: data,
                    })
                }
            })
            .catch(error => {
                if (error.status === 413) {
                    this.setState({
                        error: true, errorMessage: 'The uploaded file is too large.', isLoading: false
                    })
                } else {
                    error.text().then(errorMessage => {
                        this.setState({
                            error: true, errorMessage: JSON.parse(errorMessage).error, isLoading: false
                        })
                    })
                }
            })
    }

    render() {
        const {reader} = this.props
        const {err, profileCheck} = this.state

        return (<div className="row">
            <div className="col-md-7 scroll">
                <h4>Upload Template File</h4>
                <div className="form-group">
                    <input type="file" className="form-control form-control-file" id="fileUpload"
                           onChange={this.updateFile}/>
                </div>

                {
                    this.state.selectedFileContent &&
                    <div>
                        <div className="container-fluid">
                            <div className="alert alert-info row">
                                <h3>Check Reader</h3>
                                <p className="col-md-10">To check the reader result you have to save the reader
                                    fist.</p>
                                <button className="col-md-2 btn btn-default"
                                        onClick={this.checkFile}>Check
                                </button>
                            </div>
                        </div>
                        <Tabs defaultActiveKey={0} id="uncontrolled-tab-example">
                            <Tab eventKey={0} title={`Uploaded File`}>
                                <pre className="file-preview">
                                {
                                    this.state.selectedFileContent.split('\n').map((line, index) => {
                                        return <code key={index}>{line}</code>
                                    })
                                }
                                </pre>
                            </Tab>
                            {profileCheck &&
                                <Tab eventKey={1} title={`File Check Result`}>
                                    <RenderDataViewer profile_data={profileCheck} onGridReady={() => {
                                    }}/>
                                </Tab>
                            }
                        </Tabs>
                    </div>
                }

            </div>
            <div className="col-md-5">
                <div className="scroll">

                    <Tabs defaultActiveKey={0} id="LEft-form-control-tab">
                        <Tab eventKey={0} title={`Basic Info`}>
                            <div className="panel panel-default">
                                <div className="panel-heading">
                                    Reader
                                </div>
                                <div className="panel-body">
                                    <div>
                                        <label>Title</label>
                                        <input type="text" className="form-control input-sm" onChange={event => {
                                            reader.title = event.currentTarget.value
                                            this.props.updateReader(reader)
                                        }} value={reader.title}/>
                                        <small className="text-muted">Please add a title for this reader.</small>
                                        <label>Description</label>
                                        <textarea className="form-control input-sm" onChange={event => {
                                            reader.description = event.currentTarget.value
                                            this.props.updateReader(reader)
                                        }}>{reader.description || ''}</textarea>
                                        <small className="text-muted">Optional add a title for this reader.</small>
                                        <small>
                                            <p className="text-muted">
                                                A reader is a component in the converter that performs an initial
                                                parsing of the input file. Consequently, each reader can be used by
                                                several converter profiles. The task of the reader is to extract the
                                                necessary metadata and the data tables from the file. The metadata
                                                should be available in a key value system and all data tables should be
                                                numerically evaluable.
                                            </p>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </Tab>

                        <Tab eventKey={1} title={`General Form`}>
                            <div className="panel panel-default">
                                <div className="panel-heading">Identifiers</div>
                                <div className="panel-body">
                                    <label>Based on file extentions</label>
                                    <input type="text" className="form-control input-sm" placeholder={".txt, .csv, ..."}
                                           onChange={event => {
                                               reader.identifiers.meta.file_extension = event.currentTarget.value
                                               this.props.updateReader(reader)
                                           }}
                                           value={reader.identifiers.meta.file_extension || ''}/>
                                    <small className="text-muted">Please enter all reader file extentions</small>
                                    {
                                        <IdentifierForm
                                            key={'tableHeader'}
                                            label={'Based on file content'}
                                            type={'file'}
                                            optional={false}
                                            identifiers={reader.identifiers.content}
                                            fileMetadataOptions={[]}
                                            tableMetadataOptions={[]}
                                            inputTables={[]}
                                            outputTables={reader.tables}
                                            dataset={{}}
                                            addIdentifier={this.addIdentifier}
                                            updateIdentifier={this.updateIdentifier}
                                            removeIdentifier={this.removeIdentifier}
                                            addIdentifierOperation={this.addIdentifierOperation}
                                            updateIdentifierOperation={this.updateIdentifierOperation}
                                            removeIdentifierOperation={this.removeIdentifierOperation}
                                        />

                                    }
                                    <small>
                                        <p className="text-muted">
                                            Whether a reader is used for a file is decided by the identifiers. On the
                                            one hand on the basis of the file extension. On the other hand on the basis
                                            of the content in specific lines.
                                        </p>
                                        <ul className="text-muted">
                                            <li>
                                                The file
                                                extensions <code>{reader.identifiers.meta.file_extension}</code> should
                                                be a comma seperated list of all allowed file extentions.
                                            </li>
                                            <li>
                                                The content based identifier must be all satisfied.
                                                <ul className="text-muted">
                                                    <li><code>Any value</code> can be used to have amin number of lines.
                                                    </li>
                                                    <li><code>Regex</code> can be selected to use rearguard
                                                        expressions <a href="https://regex101.com/"
                                                                       target="_blank">(help)</a>.
                                                    </li>
                                                    <li><code>Exect value</code> should be an exact match of the line.
                                                    </li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </small>
                                </div>
                            </div>

                            <div className="panel panel-default">
                                <div className="panel-heading">Delimiters</div>
                                <div className="panel-body">

                                    <legend>Enter Table Delimiter</legend>
                                    <button className="btn btn-success" onClick={() => {
                                        reader.delimiters.table_delimiters.push(newIdentifier('global'))
                                        this.props.updateReader(reader)
                                    }}>Add new Table Delimiter
                                    </button>

                                    {

                                        reader.delimiters.table_delimiters.map((opt, opt_idx) => {
                                            return (<div key={`table_delimiters_${opt_idx}`} className="row">
                                                <div className="col-sm-11">
                                                    <IdentifierInput
                                                        index={opt_idx}
                                                        optional={true}
                                                        identifier={opt}
                                                        fileMetadataOptions={[]}
                                                        tableMetadataOptions={[]}
                                                        inputTables={[]}
                                                        dataset={{}}
                                                        updateIdentifier={(idx, valueMap) => {
                                                            Object.assign(reader.delimiters.table_delimiters[opt_idx], valueMap)
                                                            this.props.updateReader(reader)
                                                        }}></IdentifierInput>
                                                </div>
                                                <div className="col-sm-1">
                                                    <button className="btn btn-sm btn-danger" style={{marginTop: 15}}
                                                            onClick={() => {
                                                                reader.delimiters.table_delimiters.splice(opt_idx, 1)
                                                                this.props.updateReader(reader)
                                                            }}>Delete
                                                    </button>
                                                </div>
                                            </div>)
                                        })
                                    }

                                    <fieldset>
                                        <legend>Enter Line Delimiter</legend>
                                        <div className="row">
                                            <div className="col-sm-6">
                                                <h4>Please select all Delimiters</h4>

                                                {
                                                    reader.delimiters.options.map((opt, opt_idx) => {
                                                        return (
                                                            <div key={`delimiters_${opt_idx}`}
                                                                 className="checkbox mb-10 mt-10">
                                                                <label
                                                                    htmlFor={`id_delimiters_${opt.name}`}><input
                                                                    checked={opt.active} onChange={(event) => {
                                                                    reader.delimiters.options[opt_idx].active = event.currentTarget.checked
                                                                    this.props.updateReader(reader)
                                                                }
                                                                }
                                                                    type="checkbox" name={`delimiters_${opt.name}`}
                                                                    id={`id_delimiters_${opt.name}`}
                                                                    value="track"/>{opt.name}
                                                                    <code>{opt.symbol}</code></label><br/>
                                                            </div>)
                                                    })
                                                }
                                            </div>
                                            <div className="col-sm-6">
                                                <h4>Delimiter options</h4>
                                                <div className="checkbox mb-10 mt-10">
                                                    <label htmlFor="id_delimiters_quotes">
                                                        <input
                                                            checked={reader.delimiters.ignore_within_quotes}
                                                            onChange={(event) => {
                                                                reader.delimiters.ignore_within_quotes = event.currentTarget.checked
                                                                this.props.updateReader(reader)
                                                            }
                                                            }
                                                            type="checkbox" name="delimiters_quotes"
                                                            id="id_delimiters_quotes"
                                                            value="track"/>Ignore delimiters within quotes
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        {reader.delimiters.options.at(-1).active &&
                                            <IdentifierInput
                                                index={1}
                                                optional={true}
                                                identifier={reader.delimiters.free_identifier}

                                                fileMetadataOptions={[]}
                                                tableMetadataOptions={[]}
                                                inputTables={[]}

                                                dataset={{}}
                                                updateIdentifier={(idx, valueMap) => {
                                                    Object.assign(reader.delimiters.free_identifier, valueMap)
                                                    reader.delimiters.options.at(-1).symbol = reader.delimiters.free_identifier.value
                                                    this.props.updateReader(reader)
                                                }}
                                            />
                                        }
                                    </fieldset>
                                    <small>
                                        <p className="text-muted">
                                            There are two types of delimiters. The <code>Table Delimiter</code> is an
                                            identifier to separate the file in different Tables. The <code>Line
                                            Delimiter</code> is used to separate rows into keys and values, and to
                                            separate values for data table rows.
                                        </p>
                                    </small>
                                </div>
                            </div>

                            <div className="panel panel-default">
                                <div className="panel-heading">Comments</div>
                                <div className="panel-body">
                                    <legend>Line-commend start symbol</legend>
                                    <IdentifierInput
                                        index={1}
                                        optional={true}
                                        identifier={reader.commend.line_commend}

                                        fileMetadataOptions={[]}
                                        tableMetadataOptions={[]}
                                        inputTables={[]}

                                        dataset={{}}
                                        updateIdentifier={(idx, valueMap) => {
                                            Object.assign(reader.commend.line_commend, valueMap)
                                            this.props.updateReader(reader)
                                        }}
                                    />
                                    <small>
                                        <p className="text-muted">
                                            Everything that comes after a line-commend identifier in a line is ignored.
                                            Leave the entry empty if the file type has no line-commend identifiers.
                                        </p>
                                    </small>
                                    <legend>Multi-line-commend start symbol</legend>
                                    <IdentifierInput
                                        index={3}
                                        optional={true}
                                        identifier={reader.commend.multi_line_commend_start}

                                        fileMetadataOptions={[]}
                                        tableMetadataOptions={[]}
                                        inputTables={[]}

                                        dataset={{}}
                                        updateIdentifier={(idx, valueMap) => {
                                            Object.assign(reader.commend.multi_line_commend_start, valueMap)
                                            this.props.updateReader(reader)
                                        }}
                                    />
                                    <legend>Multi-line-commend end symbol</legend>
                                    <IdentifierInput
                                        index={2}
                                        optional={true}
                                        identifier={reader.commend.multi_line_commend_end}

                                        fileMetadataOptions={[]}
                                        tableMetadataOptions={[]}
                                        inputTables={[]}

                                        dataset={{}}
                                        updateIdentifier={(idx, valueMap) => {
                                            Object.assign(reader.commend.multi_line_commend_end, valueMap)
                                            this.props.updateReader(reader)
                                        }}
                                    />
                                    <small>
                                        <p className="text-muted">
                                            Everything that comes inbetween the start multi-line-commend identifier and
                                            the end multi-line-commend identifier is ignored.
                                            The only exception is if the lines between the multi-line-commend identifier
                                            fit a data table. Leave both entry empty if the file type has no
                                            multy-line-commend identifiers.
                                            If the start multi-line-commend identifier and the end multi-line-commend
                                            are equal you can leave the end multi-line-commend identifier empty.
                                        </p>
                                    </small>

                                </div>
                            </div>
                        </Tab>
                        <Tab eventKey={2} title={`Tables Form`}>
                            <div className="panel panel-info">

                                <div className="panel-heading">
                                    <div className="btn-group pull-right">
                                        <button type="button" className="btn btn-default btn-xs "
                                                onClick={() => this.setState({'hide_info': !this.state.hide_info})}>{this.state.hide_info ? 'Show' : 'Hide'} Info
                                        </button>
                                    </div>
                                    {`General Info`}
                                </div>
                                <div className="panel-body">
                                    {
                                        !this.state.hide_info &&
                                        <div>
                                            <small>
                                                <p className="text-muted">
                                                    In addition to metadata, a reader also extracts so called table
                                                    data. In order to extract table data, you need to create table
                                                    template descriptions.
                                                </p>
                                                <p className="text-muted">Each template includes</p>
                                                <ul className="text-muted">
                                                    <li>
                                                            <code>Min. number of columns</code>: A minimum number of columns, i.e. the number of values after separating the input row by the delimiters.<br/>Empty values are ignored if <code>Can the table include empty values</code> is unchecked.

                                                    </li>
                                                    <li>
                                                            <code>Max. number of columns</code>: A maximum number of columns, i.e. the number of values after separating the input row by the delimiters.<br/>Empty values are ignored if <code>Can the table include empty values</code> is unchecked.
                                                    </li>
                                                    <li>
                                                            <code>Columns with string values</code>: Usually all values should be numeric. This value is comma seperated list of values in the tables which are not numeric.
                                                    </li>
                                                    <li>
                                                            <code>Number Regular Expression</code>: This input needs you to input a regular expression to parse the numeric values within a table. All values must fit to this expression except the ons in <code>Columns with string values</code>. The value in the first regex group will be used in the table. Click here if you need <a target="_blank" href="https://regex101.com/">help</a>
                                                    </li>
                                                    <li>
                                                            <code>Does the table have a column header row?</code>: If the first row of the table are the header you need to check this box.
                                                    </li>
                                                    <li>
                                                            <code>Does the table have a row header column?</code>: If the first column of the table are the header of the rows you need to check this box.
                                                    </li>
                                                    <li>
                                                            <code>Can the table include empty values?</code>: If checked all empty values between the delimiters are ignored.
                                                    </li>
                                                    <li>
                                                            <code>Check if the table has a start identifier</code>: If tables have start identifier check this box. the identifier are not included into the table
                                                    </li>
                                                </ul>
                                            </small>
                                        </div>
                                    }
                                    <div className="mb-20">
                                        <button type="button" className="btn-lg btn btn-success btn-sm"
                                                onClick={() => this.addTable()}>Add type table
                                        </button>
                                    </div>
                                </div>
                            </div>


                            {
                                reader.tables.map((table, table_idx) => {
                                    return (
                                        <div className="panel panel-default" key={`table_${table_idx + 1}`}>
                                            <div className="panel-heading">
                                                <div className="btn-group pull-right">
                                                    <button type="button" className="btn btn-default btn-xs "
                                                            disabled={table_idx === 0}
                                                            onClick={() => this.moveTable(table_idx, table_idx - 1)}>up
                                                    </button>
                                                    <button type="button" className="btn btn-default btn-xs "
                                                            disabled={table_idx + 1 === reader.tables.length}
                                                            onClick={() => this.moveTable(table_idx, table_idx + 1)}>down
                                                    </button>
                                                    <button type="button" className="btn btn-danger btn-xs "
                                                            onClick={() => this.removeTable(table_idx)}>Remove
                                                    </button>
                                                </div>
                                                {`Table type #${table_idx + 1}`}
                                            </div>
                                            <div className="panel-body">
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <label>Min. number of columns</label>
                                                        <input className="form-control input-sm" type='number' min="0"
                                                               onChange={(event) => {
                                                                   table.min_number_of_col = Math.max(0, event.target.value)
                                                                   table.max_number_of_col = Math.max(table.max_number_of_col, table.min_number_of_col)
                                                                   this.props.updateReader(reader)

                                                               }}
                                                               value={table.min_number_of_col}/>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <label>Max. number of columns</label>
                                                        <input className="form-control input-sm" type='number'
                                                               min={table.min_number_of_col}
                                                               onChange={(event) => {
                                                                   table.max_number_of_col = Math.max(2, event.target.value)
                                                                   table.min_number_of_col = Math.min(table.max_number_of_col, table.min_number_of_col)
                                                                   this.props.updateReader(reader)

                                                               }}
                                                               value={table.max_number_of_col}/>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <label>Columns with string values</label>
                                                        {err.allow_str_col &&
                                                            <p className="alert alert-danger">{err.allow_str_col}</p>
                                                        }
                                                        <input className="form-control input-sm" type='text'
                                                               onChange={(event) => {
                                                                   const val_str = event.target.value.replace(/[^,\d]/, "")
                                                                   const val_list = val_str.replace(/,$/, "").split(',')
                                                                   err.allow_str_col = null
                                                                   for (const val of val_list) {
                                                                       const parsedVal = parseInt(val)
                                                                       if (table.max_number_of_col < parsedVal) {
                                                                           err.allow_str_col = `All string columns must be less or equal then ${table.max_number_of_col}`
                                                                           this.setState({err: err})
                                                                           return
                                                                       } else if (isNaN(parsedVal)) {
                                                                           err.allow_str_col = 'This should be a list of all columns indexes (integer) which could contain a string Value seperated by comma.'
                                                                           this.setState({err: err})
                                                                           return
                                                                       }
                                                                   }
                                                                   table.allow_str_col = val_str
                                                                   this.props.updateReader(reader)

                                                               }}
                                                               value={table.allow_str_col}/>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm-4">
                                                        <div className="checkbox">
                                                            <label htmlFor={`${table_idx}_has_col_header_row_id`}>
                                                                <input type="checkbox"
                                                                       checked={table.has_col_header_row}
                                                                       onChange={(event) => {
                                                                           table.has_col_header_row = event.target.checked
                                                                           this.props.updateReader(reader)
                                                                       }}
                                                                       id={`${table_idx}_has_col_header_row_id`}/>
                                                                Does the table have a column header row?
                                                            </label>
                                                        </div>
                                                        <div className="checkbox">
                                                            <label htmlFor={`${table_idx}_has_row_header_col_id`}>
                                                                <input type="checkbox"
                                                                       checked={table.has_row_header_col}
                                                                       onChange={(event) => {
                                                                           table.has_row_header_col = event.target.checked
                                                                           this.props.updateReader(reader)
                                                                       }}
                                                                       id={`${table_idx}_has_row_header_col_id`}/>
                                                                Does the table have a row header column?
                                                            </label>
                                                        </div>
                                                        <div className="checkbox">
                                                            <label htmlFor={`${table_idx}_allow_empty_col_id`}>
                                                                <input type="checkbox"
                                                                       checked={table.allow_empty_col}
                                                                       onChange={(event) => {
                                                                           table.allow_empty_col = event.target.checked
                                                                           this.props.updateReader(reader)
                                                                       }}
                                                                       id={`${table_idx}_allow_empty_col_id`}/>
                                                                Can the table include empty values?
                                                            </label>
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-4">
                                                        <label>Number Regular Expression</label>
                                                        <input className="form-control input-sm" type='text'
                                                               onChange={(event) => {
                                                                   table.number_value_regex = event.target.value
                                                                   this.props.updateReader(reader)

                                                               }}
                                                               value={table.number_value_regex}/>
                                                    </div>

                                                    <div className="col-sm-4">
                                                        <small>
                                                            <p className="text-muted">
                                                                This input contains all index of columns with string
                                                                values. The first column has the index 0. If <code>Is
                                                                there a row header column</code>
                                                                is checked the first index in this list is used as
                                                                column header.
                                                            </p>
                                                        </small>
                                                    </div>

                                                </div>


                                                <div className="checkbox">
                                                    <label htmlFor={`${table_idx}_has_start_identifierl_id`}>
                                                        <input type="checkbox"
                                                               checked={table.has_start_identifier}
                                                               onChange={(event) => {
                                                                   table.has_start_identifier = event.target.checked
                                                                   this.props.updateReader(reader)
                                                               }}
                                                               id={`${table_idx}_has_start_identifierl_id`}/>Check if
                                                        the
                                                        table
                                                        has a start identifier
                                                    </label>
                                                </div>

                                                {table.has_start_identifier &&
                                                    <IdentifierInput
                                                        index={table_idx}
                                                        optional={true}
                                                        identifier={table.start_identifier}

                                                        fileMetadataOptions={[]}
                                                        tableMetadataOptions={[]}
                                                        inputTables={[]}

                                                        dataset={{}}
                                                        updateIdentifier={(idx, valueMap) => {
                                                            Object.assign(reader.tables[idx].start_identifier, valueMap)
                                                            this.props.updateReader(reader)
                                                        }}
                                                    />
                                                }

                                            </div>
                                            <div className="panel-body">
                                                <small>

                                                </small>

                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </Tab>
                    </Tabs>
                </div>
                <div className="row" style={{position: 'fixed', right: '50px', bottom: '20px', width: '363px'}}>
                    <form onSubmit={(event) => {
                        event.preventDefault()
                        this.props.storeReader(true)
                    }}>
                        <button className="m-10 btn btn-success col-md-5">Save and done
                        </button>
                    </form>
                    <div className="col-md-1"></div>
                    <form onSubmit={(event) => {
                        event.preventDefault()
                        this.props.storeReader(false)
                    }}>
                        <button className="m-10 btn btn-success col-md-5">Save and continue
                        </button>
                    </form>
                </div>
            </div>
        </div>)
    }
}

ReaderForm.propTypes = {
    status: PropTypes.string,
    reader: PropTypes.object,
    options: PropTypes.object,
    updateReader: PropTypes.func,
    storeReader: PropTypes.func,
    error: PropTypes.bool,
    errorMessage: PropTypes.string
}

export default ReaderForm

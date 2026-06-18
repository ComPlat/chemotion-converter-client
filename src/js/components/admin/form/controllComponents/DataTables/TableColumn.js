import React from "react"
import PropTypes from 'prop-types';
import {Button, Col, Form, Row, OverlayTrigger, Popover} from 'react-bootstrap';

import ColumnInput from '../../table/ColumnInput'
import ColumnSelect from '../../table/ColumnSelect'
import OperatorSelect from '../../common/OperatorSelect'
import Select from "react-select";


function TableColumn({
                       table,
                       label,
                       columnKey,
                       operationsKey,
                       inputColumns,
                       updateTable,
                       addOperation,
                       updateOperation,
                       updateOperationDescription,
                       removeOperation,
                       tableMetadataOptions,
                       inputTables
                     }) {
  const updateRegex = (idx, regexPattern, line) => {
    line = parseInt(line)
    let header = inputTables[idx]['header']
    if (!isNaN(line) && header.length + 1 > line) {
      header = header[line - 1]
    }
    try {
      const regex = new RegExp(regexPattern);
      const match = regex.exec(header);
      let matchStr = null;
      if (match.length > 1) {
        matchStr = match[1]
      }
      const val = parseFloat(matchStr)
      if (!isNaN(val)) {
        return val
      }
    } catch {
    }
    return ''
  }

  const getSelectedMetadataOption = (opKey) => {
    return tableMetadataOptions.find((mOpt) => mOpt.key === opKey)
  }

  const is_extra_type = (operation) => operation.type === 'metadata_value' || operation.type === 'header_value'
  return (
    <>
      <Form.Group className="mb-2">
        <Form.Label column="lg">{label}</Form.Label>
        {inputColumns.length > 0 ? (
          <ColumnSelect
            column={table[columnKey]}
            columnList={inputColumns}
            onChange={column => updateTable(columnKey, column)}
          />
        ) : (
          <ColumnInput
            column={table[columnKey]}
            onChange={column => updateTable(columnKey, column)}
          />
        )}
      </Form.Group>

      {table[operationsKey] && table[operationsKey].map((operation, index) => {
        const selectedMetadataOption = operation.type === 'metadata_value' ? getSelectedMetadataOption(operation.value) : null;
        return (
          <Row key={`operation-table-${operationsKey}-${index}`}
               className={"mb-2 align-items-end alert" + (is_extra_type(operation) ? " alert-warning" : "")}>
            {is_extra_type(operation) && (
              <p>
                Please note that, if the value is not available,
                the following calculation could result in an unexpected outcome!
              </p>)}
            <Col sm={2}>
              <OperatorSelect value={operation.operator}
                              onChange={value => updateOperation(operationsKey, index, 'operator', value)}/>
            </Col>

            {operation.type === 'column' && (
              <Col sm={9}>
                {inputColumns.length > 0 ? (
                  <ColumnSelect
                    column={operation.column}
                    columnList={inputColumns}
                    onChange={column => updateOperation(operationsKey, index, 'column', column)}
                  />
                ) : (
                  <ColumnInput
                    column={operation.column}
                    onChange={column => updateOperation(operationsKey, index, 'column', column)}
                  />
                )}
              </Col>
            )}

            {operation.type === 'value' && (
              <Col sm={9}>
                <Form.Control
                  size="sm"
                  value={operation.value || ''}
                  onChange={event => updateOperation(operationsKey, index, 'value', event.target.value)}
                />
              </Col>
            )}

            {operation.type === 'metadata_value' && (
              <Col sm={9}>
                <Select
                  value={selectedMetadataOption}
                  onChange={selected => {
                    updateOperation(operationsKey, index, 'metadata', selected.key);
                  }}
                  options={tableMetadataOptions}
                >
                </Select>
              </Col>
            )}

            {(operation.type === 'header_value') && (
              <>
                <Col sm={10}>
                  <Form.Control
                    size="sm"
                    value={operation.line || ''}
                    placeholder='Line'
                    onChange={event => {
                      updateOperation(operationsKey, index, 'line', event.target.value);
                    }}
                  />
                </Col>
                <Col sm={11}>
                  <Form.Control
                    size="sm"
                    value={operation.regex || ''}
                    placeholder='Regex'
                    onChange={event => {
                      updateOperation(operationsKey, index, 'regex', event.target.value);
                    }}
                  />
                </Col>
              </>
            )}

            <Col sm={1} className="d-flex align-items-start justify-content-end">
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeOperation(operationsKey, index)}
              >
                &times;
              </Button>
            </Col>


            {(operation.type === 'header_value') && (<Col sm={12}>
              <Form.Check
                inline
                checked={operation.ignore_missing_values}
                id={`checkbox-${operation.type}`}
                label={`If selected, this operation will be ignored if a numerical value cannot be found in the data file. Conversely, if the box is left unchecked and the value cannot be found, the missing data will result in an empty data results file.`}
                onChange={event => {
                  updateOperation(operationsKey, index, 'ignore_missing_values', event.target.checked);
                }}
              />
              <Form.Label column={true}>
                <strong>Current
                  Value:</strong> {updateRegex(operation.table, operation.regex, operation.line)}
              </Form.Label>
            </Col>)}

            {(operation.type === 'metadata_value' && selectedMetadataOption) && (
              <Col sm={12}>
                <Form.Check
                  inline
                  checked={operation.ignore_missing_values}
                  id={`checkbox-${operation.type}`}
                  label={`If selected, this operation will be ignored if a numerical value cannot be found in the data file. Conversely, if the box is left unchecked and the value cannot be found, the missing data will result in an empty data results file.`}
                  onChange={event => {
                    updateOperation(operationsKey, index, 'ignore_missing_values', event.target.checked);
                  }}
                />
                <Form.Label column={true}>
                  <strong>Current
                    Value:</strong> {parseFloat(selectedMetadataOption.value)}
                </Form.Label>
              </Col>)}

          </Row>
        );
      })}


      {table[`${operationsKey}Description`] && table[`${operationsKey}Description`][0] &&
        <Form.Group controlId="operation-description" className="mt-3">

          <OverlayTrigger
            placement="bottom"
            overlay={<Popover id="metadata-popover">
              <Popover.Header as="h3">Description JCAMP comment </Popover.Header>
              <Popover.Body>
                Here you can enter an explanation of how the mathematical operations manipulate the data. This
                explanation is then added to the JCAMP file as a comment.
              </Popover.Body>
            </Popover>}
          >
            <Form.Label column="lg">Operations description</Form.Label>
          </OverlayTrigger>
          <pre className={"text-muted"}>{table[`${operationsKey}Description`][0]}</pre>
          <Form.Control as="textarea" size="sm" rows="3"
                        onChange={event => updateOperationDescription(operationsKey, event.currentTarget.value)}
                        value={table[`${operationsKey}Description`][1] ?? ""}/>
          <Form.Text>Please add a description for the operations.</Form.Text>
        </Form.Group>
      }


      <div className="d-flex gap-2 mt-1 mb-3">
        <Button
          variant="success"
          size="sm"
          onClick={() => addOperation(operationsKey, 'column')}
        >
          Add column operation
        </Button>
        <Button
          variant="success"
          size="sm"
          onClick={() => addOperation(operationsKey, 'value')}
        >
          Add scalar operation
        </Button>
        <OverlayTrigger
          placement="bottom"
          overlay={<Popover id="metadata-popover">
            <Popover.Header as="h3"> Attention: Use with caution! </Popover.Header>
            <Popover.Body>
              There is a risk of data corruption when using user-provided or free-text metadata for
              calculations.
              We recommend using only unmodifiable metadata, such as numerical result fields directly
              from the device.
            </Popover.Body>
          </Popover>}
        >
          <Button
            variant="warning"
            size="sm"
            onClick={() => addOperation(operationsKey, 'metadata_value')}
          >
            Add table metadata operation
          </Button>
        </OverlayTrigger>
        <OverlayTrigger
          placement="bottom"
          overlay={<Popover id="header-popover">
            <Popover.Header as="h3"> Attention: Use with caution! </Popover.Header>
            <Popover.Body>
              There is a risk of data corruption when using user-provided or free-text metadata for
              calculations.
              We recommend using only unmodifiable metadata, such as numerical result fields directly
              from the device.
            </Popover.Body>
          </Popover>}
        >
          <Button
            variant="warning"
            size="sm"
            onClick={() => addOperation(operationsKey, 'header_value')}
          >
            Add table header operation
          </Button>
        </OverlayTrigger>
      </div>
    </>
  )
}

TableColumn.propTypes = {
  table: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  columnKey: PropTypes.string.isRequired,
  operationsKey: PropTypes.string.isRequired,
  inputColumns: PropTypes.array.isRequired,
  updateTable: PropTypes.func.isRequired,
  addOperation: PropTypes.func.isRequired,
  updateOperation: PropTypes.func.isRequired,
  updateOperationDescription: PropTypes.func.isRequired,
  removeOperation: PropTypes.func.isRequired,
  tableMetadataOptions: PropTypes.array.isRequired,
  inputTables: PropTypes.array.isRequired
}

export default TableColumn

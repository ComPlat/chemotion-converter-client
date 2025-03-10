import React, { Component } from "react"
import PropTypes from 'prop-types';
import {Button, Col, Form, Row, OverlayTrigger, Popover, Alert} from 'react-bootstrap';

import ColumnInput from './table/ColumnInput'
import ColumnSelect from './table/ColumnSelect'
import OperatorSelect from './common/OperatorSelect'


class TableColumn extends Component {

  render() {
    const {
      table, label, columnKey, operationsKey, inputColumns, updateTable,
      addOperation, updateOperation, removeOperation, tableMetadataOptions, inputTables
    } = this.props

    return (
      <>
        <Form.Group className="mb-2">
          <Form.Label>{label}</Form.Label>
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

        {table[operationsKey] && table[operationsKey].map((operation, index) => (
          <Row key={index} className="mb-2 align-items-end">
            {(operation.type === 'metadata_value' || operation.type === 'header_value') && (
              <Alert variant="warning">
                Please note that the following calculation will be ignored if the value is not available!
              </Alert>)}
            <Col sm={2}>
              <OperatorSelect value={operation.operator}
                onChange={value => updateOperation(operationsKey, index, 'operator', value)} />
            </Col>

            {operation.type == 'column' && (
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

            {operation.type == 'value' && (
              <Col sm={9}>
                <Form.Control
                  size="sm"
                  value={operation.value || ''}
                  onChange={event => updateOperation(operationsKey, index, 'value', event.target.value)}
                />
              </Col>
            )}

            {operation.type == 'metadata_value' && (
              <Col sm={9}>
                <Form.Select
                    size="sm"
                    value={operation.metadata || ''}
                    onChange={event => {
                            updateOperation(operationsKey, index, 'metadata',
                                `${event.target.value}:${tableMetadataOptions[event.target.value].key}
                                :${tableMetadataOptions[event.target.value].tableIndex}`);
                        }
                    }
                  >
                    {tableMetadataOptions.map((option, optionIndex) => (
                      <option key={optionIndex} value={optionIndex}>{option.label}</option>
                    ))}
                </Form.Select>
              </Col>
            )}

            {(operation.type == 'header_value') && (
            <>
              <Col sm={3}>
                <Form.Select
                size="sm"
                value={operation.table || ''}
                onChange={event => {
                    updateOperation(operationsKey, index, 'table', event.target.value);
                  }
                }
              >
                {inputTables.map((table, tableIndex) => (
                  <option key={tableIndex} value={tableIndex}>Input table #{tableIndex}</option>
                ))}
              </Form.Select>
              </Col>
              <Col sm={3}>
                <Form.Control
                  size="sm"
                  value={operation.line || ''}
                  placeholder='Line'
                  onChange={event => {
                      updateOperation(operationsKey, index, 'line', event.target.value);
                    }
                  }
                />
              </Col>
              <Col sm={3}>
                <Form.Control
                  size="sm"
                  value={operation.regex || ''}
                  placeholder='Regex'
                  onChange={event => {
                      updateOperation(operationsKey, index, 'regex', event.target.value);
                    }
                  }
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
          </Row>
        ))}

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
                There is a risk of data corruption when using user-provided or free-text metadata for calculations.
                We recommend using only unmodifiable metadata, such as numerical result fields directly from the device.
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
            overlay={<Popover  id="header-popover">
              <Popover.Header as="h3"> Attention: Use with caution! </Popover.Header>
              <Popover.Body>
                There is a risk of data corruption when using user-provided or free-text metadata for calculations.
                We recommend using only unmodifiable metadata, such as numerical result fields directly from the device.
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

}

TableColumn.propTypes = {
  table: PropTypes.object,
  label: PropTypes.string,
  columnKey: PropTypes.string,
  operationsKey: PropTypes.string,
  inputColumns: PropTypes.array,
  updateTable: PropTypes.func,
  updateHeader: PropTypes.func,
  addOperation: PropTypes.func,
  updateOperation: PropTypes.func,
  removeOperation: PropTypes.func,
  tableMetadataOptions: PropTypes.array,
  inputTables: PropTypes.array
}

export default TableColumn

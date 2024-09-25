import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Button, Col, Form, Row } from 'react-bootstrap';

import ColumnInput from './table/ColumnInput'
import ColumnSelect from './table/ColumnSelect'
import OperatorSelect from './common/OperatorSelect'


class TableColumn extends Component {

  render() {
    const {
      table, label, columnKey, operationsKey, inputColumns, updateTable,
      addOperation, updateOperation, removeOperation
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
  removeOperation: PropTypes.func
}

export default TableColumn

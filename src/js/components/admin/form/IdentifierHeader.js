import React, { Component } from "react"
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

class IdentifierHeader extends Component {

  render() {
    const { identifier, show, onToggle, onRemove } = this.props

    return (
      <div className="d-flex justify-content-between align-items-baseline">
        <div>
          <code>
            { identifier.tableIndex !== undefined && `Input table #${identifier.tableIndex} ` }
            { identifier.key }
            { identifier.lineNumber !== undefined && `Line ${identifier.lineNumber}`}
          </code>
          {identifier.outputKey && (
            <>
              <span className="mx-1">&#8594;</span>
              <code>
                { identifier.outputLayer && `${identifier.outputLayer}/`}
                { identifier.outputKey }
              </code>
            </>
          )}
        </div>

        <div className="d-flex gap-1">
          <Button
            variant="info"
            size="sm"
            onClick={() => onToggle()}
          >
            { show ? 'Hide' : 'Show' }
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onRemove()}
          >
            Remove
          </Button>
        </div>
      </div>
    )
  }
}

IdentifierHeader.propTypes = {
  identifier: PropTypes.object,
  show: PropTypes.bool
}

export default IdentifierHeader

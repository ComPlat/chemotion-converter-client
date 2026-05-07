import React from "react"
import PropTypes from 'prop-types';
import {Button} from 'react-bootstrap';
import {Pin, PinOff} from "lucide-react";

function IdentifierHeader({identifier, show, onToggle, onRemove}) {
  return (
    <div className="d-flex justify-content-between align-items-baseline">
      <div>
        <code>
          {identifier.tableIndex !== undefined && `Input table #${identifier.tableIndex} `}
          {identifier.key}
          {identifier.lineNumber !== undefined && `Line ${identifier.lineNumber}`}
        </code>
        {identifier.outputKey && (
          <>
            <span className="mx-1">&#8594;</span>
            <code>
              {identifier.outputLayer && `${identifier.outputLayer}/`}
              {identifier.outputKey}
            </code>
          </>
        )}
      </div>

      <div className="d-flex gap-1">

        {show ? <Button
          variant="info"
          size="sm"
          onClick={() => onToggle()}
        ><Pin size={10} /></Button> : <Button
          variant="dark"
          size="sm"
          onClick={() => onToggle()}
        ><PinOff size={10} /></Button>}

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

IdentifierHeader.propTypes = {
  identifier: PropTypes.object,
  show: PropTypes.bool,
  onToggle: PropTypes.func,
  onRemove: PropTypes.func
}

export default IdentifierHeader

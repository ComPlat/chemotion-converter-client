import React, {useState} from "react"
import PropTypes from 'prop-types';
import {Button, ListGroup, Collapse} from 'react-bootstrap';
import {Pin, PinOff} from "lucide-react";

function IdentifierHeader({identifier, show, onToggle, onRemove}) {
  return (
    <div className="d-flex justify-content-between align-items-baseline">
      <div>
        <code>
          {identifier.tableIndex !== undefined && `Input table #${identifier.tableIndex + 1} `}
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


function IdentifierWithHeader({identifierInputTag, index, identifier, removeIdentifier}) {
  const [show, setShow] = useState(false);
  const [hovered, setHovered] = useState(false);
  return ( <ListGroup.Item key={index}
                              onMouseEnter={() => setHovered(true)}
                              onMouseLeave={() => setHovered(false)}>
                <IdentifierHeader
                  identifier={identifier}
                  show={show}
                  onToggle={() => setShow(!show)}
                  onRemove={() => removeIdentifier(index)}
                />
                <Collapse in={show || hovered}>
                  <div>
                    {identifierInputTag}
                  </div>
                </Collapse>
              </ListGroup.Item>)
}


IdentifierHeader.propTypes = {
  identifier: PropTypes.object,
  show: PropTypes.bool,
  onToggle: PropTypes.func,
  onRemove: PropTypes.func
}

export default IdentifierWithHeader

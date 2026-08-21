import React, {useState} from "react"
import PropTypes from 'prop-types';
import {Button, ListGroup, Collapse, OverlayTrigger, Tooltip} from 'react-bootstrap';
import {Pin, PinOff, Settings} from "lucide-react";

function IdentifierHeader({
                            identifier, show, onToggle, onRemove,
                            onConfigure = null, configureTooltip = 'Open the builder', summary = null
                          }) {
  return (
    <div className="d-flex justify-content-between align-items-baseline">
      <div>
        <code>
          {summary ?? (<>
            {identifier.tableIndex !== undefined && `Input table #${identifier.tableIndex + 1} `}
            {identifier.key}
            {identifier.lineNumber !== undefined && `Line ${identifier.lineNumber}`}
          </>)}
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

        {onConfigure && (
          <OverlayTrigger
            placement="left"
            overlay={<Tooltip id="configure-identifier-tooltip">{configureTooltip}</Tooltip>}
          >
            <Button
              variant="outline-primary"
              size="sm"
              aria-label={configureTooltip}
              onClick={() => onConfigure()}
            ><Settings size={12}/></Button>
          </OverlayTrigger>
        )}

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


function IdentifierWithHeader({
                                identifierInputTag, index, identifier, removeIdentifier,
                                onConfigure = null, configureTooltip = undefined, summary = null
                              }) {
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
                  onConfigure={onConfigure}
                  configureTooltip={configureTooltip}
                  summary={summary}
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
  onRemove: PropTypes.func,
  onConfigure: PropTypes.func,
  configureTooltip: PropTypes.string,
  summary: PropTypes.node
}

IdentifierWithHeader.propTypes = {
  identifierInputTag: PropTypes.node,
  index: PropTypes.number,
  identifier: PropTypes.object,
  removeIdentifier: PropTypes.func,
  onConfigure: PropTypes.func,
  configureTooltip: PropTypes.string,
  summary: PropTypes.node
}

export default IdentifierWithHeader

import React, { useState, useEffect, useMemo } from "react"
import PropTypes from 'prop-types';
import { Button, ListGroup, Collapse , OverlayTrigger, Tooltip} from 'react-bootstrap';
import { Pin, PinOff , Settings} from "lucide-react";
import { debounce } from "lodash";

function IdentifierHeader({ identifier, show, onToggle, onRemove, hovered, setHovered }) {
  if (!setHovered) setHovered = () => null;
  if (!onToggle) onToggle = () => null;
  if (!onRemove) onRemove = () => null;

  const setHoveredDeb = useMemo(
    () => debounce(() => setHovered(true), 200),
    []
  );

  const handleMouseEnter = () => {
    setHoveredDeb();
  };

  const handleMouseLeave = () => {
    setHoveredDeb.cancel();
    setHovered(false);
  };

  useEffect(() => {
    return () => setHoveredDeb.cancel();
  }, [setHovered]);
function IdentifierHeader({
                            identifier, show, onToggle, onRemove,
                            onConfigure = null, configureTooltip = 'Open the builder', summary = null
                          }) {
  return (
    <div className="d-flex justify-content-between align-items-baseline"
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
         onClick={() => onToggle()}>
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
        ><Pin size={10}/></Button> : <Button
          variant="dark"
          size="sm"
          onClick={() => onToggle()}
        ><PinOff size={10}/></Button>}

        {show && <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          Remove
        </Button>}
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

  const getStyle = () => {
    if (show) {
      return {};
    }
    return {
      position: 'fixed',
      top: 0,
      left: 0,
      width: "33vw",
      maxHeight: "66vh",
      zIndex: 10,
      backgroundColor: 'white',
      borderWidth: '0px 1px 1px',
      borderStyle: 'none solid solid',
      borderColor: 'transparent rgb(222, 226, 230) rgb(222, 226, 230)',
      borderImage: 'none',
      padding: '0 12px',
      margin: '10px',
    };
  }

  return (<ListGroup.Item key={index} style={{ position: "relative" }}>
    <IdentifierHeader
      setHovered={setHovered}
      identifier={identifier}
      show={show}
      hovered={hovered}
                  onToggle={() => setShow(!show)}
                  onRemove={() => removeIdentifier(index)}
                  onConfigure={onConfigure}
                  configureTooltip={configureTooltip}
                  summary={summary}
                />
                <Collapse style={getStyle()} in={show || hovered}>
      <div>
      {!show && <div><h3>Click to open:</h3>
        <IdentifierHeader
      setHovered={setHovered}
      identifier={identifier}
      show={show}
      hovered={hovered}
      onToggle={() => setShow(!show)}
      onRemove={() => removeIdentifier(index)}
    /></div>}
        {identifierInputTag}
      </div>
    </Collapse>
  </ListGroup.Item>)
}


IdentifierHeader.propTypes = {
  identifier: PropTypes.object,
  show: PropTypes.bool,
  hovered: PropTypes.bool,
  onToggle: PropTypes.func,
  onRemove: PropTypes.func,
  setHovered: PropTypes.func
}

IdentifierHeader.defaultProps = {
  setHovered: null,
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

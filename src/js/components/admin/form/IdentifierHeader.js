import React, { useState, useEffect, useMemo } from "react"
import PropTypes from 'prop-types';
import { Button, ListGroup, Collapse } from 'react-bootstrap';
import { Pin, PinOff } from "lucide-react";
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
  return (
    <div className="d-flex justify-content-between align-items-baseline"
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
         onClick={() => onToggle()}>
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


function IdentifierWithHeader({ identifierInputTag, index, identifier, removeIdentifier }) {
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
}

export default IdentifierWithHeader

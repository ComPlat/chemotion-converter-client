import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Tooltip, OverlayTrigger, Col } from "react-bootstrap";

const TruncatedTextWithTooltip = ({ text }) => {
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    if (textRef.current) {
      const { scrollWidth, offsetWidth } = textRef.current;
      setIsTruncated(scrollWidth > offsetWidth);
    }
  }, [text]);

  const content = (
    <Col as="dt" lg={5}>
      <div ref={textRef} className='div-nowrap'>{text}:</div>
    </Col>
  );

  if (!isTruncated) {
    return content;
  }

  return (
    <OverlayTrigger placement="top-start"
      overlay={(
        <Tooltip id="tooltip-truncated">
          {text}
        </Tooltip>
      )}
    >
      {content}
    </OverlayTrigger>
  );
};

TruncatedTextWithTooltip.propTypes = {
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default TruncatedTextWithTooltip;

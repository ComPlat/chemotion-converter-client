import React, { useRef, useState, useEffect } from "react";
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

  return (
    <OverlayTrigger placement="top-start"
      overlay={isTruncated ? (
        <Tooltip id="tooltip-truncated">
          {text}
        </Tooltip>
      ) : (<></>) }
    >
      <Col as="dt" lg={5}>
        <div ref={textRef} className='div-nowrap'>{text}:</div>
      </Col>
    </OverlayTrigger>
  );
};

export default TruncatedTextWithTooltip;

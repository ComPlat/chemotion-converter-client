import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Button, ButtonGroup, Container, Form, Modal, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { getProfileData } from "../../../utils/profileUtils";
import { useAdminApp } from "../AppContext";

const integerRegex = '[+-]?\\d+';
const floatRegex = '[+-]?(?:\\d*[,.]\\d+|\\d+)(?:[eE][+-]?\\d+)?';
const emailRegex = '[\\w.%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}';
const defaultRegex = '.+';
const regexList = [integerRegex, floatRegex, emailRegex, defaultRegex];

export default function FileHeaderPresenter({ header, addIdentifier, updateRegex, tableIndex, dataIndex }) {
  const { profile, updateProfile: setProfile } = useAdminApp((s) => ({
    profile: s.profile,
    updateProfile: s.updateProfile
  }));
  const [selection, setSelection] = useState(["", ""]);
  const [selectionElement, setSelectionElement] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const [menuErrorMsg, setMenuErrorMsg] = useState(null);
  const [activeLine, setActiveLine] = useState(null);
  const [showTableHeaderModal, setShowTableHeaderModal] = useState(false);
  const [seperator, setSeperator] = useState("");

  const menuRef = useRef(null);
  const paragraphRef = useRef(null);

  const [multilineMode, setMultilineMode] = useState(false);
  const [multilineSelection, _setMultilineSelection] = useState([]);

  const multilineSelectionReg = useMemo(() => multilineSelection.map(({ feature }) => feature).join('[\\s\\S]*'), [multilineSelection]);
  const multilineSelectionRes = useMemo(() => updateRegex(multilineSelectionReg), [multilineSelectionReg]);

  const setNewSelection = (selection = ["", ""], selectionContainer = null) => {
    setSelection(selection);
    if (selectionContainer) {
      setSelectionElement(selectionContainer);
    } else {
      setSelectionElement(null)
    }
  };

  const setMultilineSelection = ({ idx, feature }) => {
    if (!multilineSelection.some((oldFeature) =>oldFeature.idx === idx)) {
      multilineSelection.push({ idx, feature });
      const newMultilineSelection = [...multilineSelection].sort((a, b) => a.idx - b.idx);
      _setMultilineSelection(newMultilineSelection);
    }
  }
  const escapeRegex = str => str.replace(/[/.*+?^${}()|[\]\\]/g, "\\$&").replace(/\t/g, '\\s*');

  function buildRegexWithSnippet(line, [prefix, snippet]) {
    // Escape regex special chars in both


    const escapedLine = escapeRegex(line);

    const regexMath = regexList.find(x => {
      return snippet.match(new RegExp(`^${x}$`))
    });

    const escapedPrefix = escapeRegex(prefix);
    const escapedSnippet = escapeRegex(snippet);
    const escapedSuffix = escapedLine.substring(escapedPrefix.length + escapedSnippet.length);
    // Replace the snippet in the escaped line with a capturing group
    const pattern = `${escapedPrefix}(${regexMath})${escapedSuffix.replace(/\d/g, '\\d')}`;

    // Create a regex that matches the full line (anchored)
    return `^${pattern}$`;
  }

  const hidePopover = () => {
    setNewSelection();
    setMenuPos(null);
  }

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection.rangeCount) return null;
      const selectedText = selection.toString().trim();

      if (selectedText) {
        const range = selection.getRangeAt(0);

        const rect = range.getBoundingClientRect();
        const container = range.startContainer;
        const containerEnd = range.endContainer;

        const preRange = range.cloneRange();

        preRange.selectNodeContents(container);
        preRange.setEnd(range.startContainer, range.startOffset);

        const preSelectedText = preRange.toString();

        if (!paragraphRef.current.contains(container) || container.parentElement.tagName.toLowerCase() !== 'code') {
          // Selection is outside → ignore
          hidePopover();
          return;
        }

        if (containerEnd === container) {
          setNewSelection([preSelectedText, selectedText], container);
          setMenuErrorMsg("");
        } else {
          setNewSelection();
          setMenuErrorMsg("Generating an identifier is only possible for single-line selections.");
        }


        setMenuPos({
          x: rect.left + rect.width / 2, y: rect.top - 10 + window.scrollY,
        });
      } else {
        hidePopover();
      }
    };

    const handleScroll = () => {
      hidePopover();
    }

    document.addEventListener("mouseup", handleMouseUp);
    Array.from(document.getElementsByClassName('scroll')).forEach((e) => e.addEventListener("scroll", handleScroll));
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
      Array.from(document.getElementsByClassName('scroll')).forEach((e) => e.removeEventListener("scroll", handleScroll));
    }
  }, []);

  const handleOptionClick = (commit = true) => {
    const res = buildRegexWithSnippet(selectionElement?.textContent, selection);
    hidePopover();
    if (commit) {
      addIdentifier(res);
    }
    return res;
  };

  const menuContent = () => {
    if (menuErrorMsg) {
      return <p className="mb-1 p-2" style={{
        backgroundColor: '#f8f8f8', fontStyle: 'bold',
      }}>{menuErrorMsg}</p>;
    }
    if (multilineMode) {
      const canBeAdded = !multilineSelection.some((oldFeature) =>oldFeature.idx === selectionElement?.parentElement.dataset.idx);
      return <>
        <p className="mb-1 p-2" style={{
          backgroundColor: '#f8f8f8', fontStyle: 'bold',

        }}>Generate metadata identifier</p>
        {canBeAdded ? <div className="p-2">
          To add <span className="fw-bold"> {selection[1]}</span> as additional feature to your regex,
          simply click <Button
          size="sm"
          onClick={() => {
            const feature = escapeRegex(selection[1]);
            const newFeature = {
              idx: selectionElement?.parentElement.dataset.idx,
              feature
            };

            setMultilineSelection(newFeature);
            hidePopover();
          }}
          variant="info"
        >Add</Button>
        </div>
          : <div className="p-2">A feature from line {parseInt(selectionElement?.parentElement.dataset.idx) + 1} is already used!</div>
        }
      </>
    }
    return <>
      <p className="mb-1 p-2" style={{
        backgroundColor: '#f8f8f8', fontStyle: 'bold',

      }}>Generate metadata identifier</p>
      <div className="p-2">
        <p>To create a new metadata identifier for the value <span className="fw-bold"> {selection[1]}</span>,
          simply click <Button
            size="sm"
            onClick={() => handleOptionClick()}
            variant="info"
          >
            New Identifier
          </Button>. However, if the line itself does not provide sufficient information to identify the value, you can
          also click <Button
            size="sm"
            onClick={() => {
              setMultilineMode(true);
              const res = buildRegexWithSnippet(selectionElement?.textContent, selection);
              const feature = res.substring(1, res.length - 1);
              const newFeature = {
                idx: selectionElement?.parentElement.dataset.idx,
                feature
              };
              setMultilineSelection(newFeature);
              hidePopover();
            }}
            variant="info"
          >
            New multiline Identifier
          </Button> to include information from the preceding lines in the selection of the value. </p>
      </div>
    </>

  }

  const useAsColumnHeader = (line) => {
    const headers = line.split(seperator);

    const updatedProfile = { ...profile };
    const profileData = getProfileData(profile, dataIndex);
    if (!profileData?.tables?.[tableIndex]) {
      return;
    }

    if (Array.isArray(profile.data)) {
      updatedProfile.data = [...profile.data];
      updatedProfile.data[dataIndex] = {
        ...profileData,
        tables: [...profileData.tables]
      };
      updatedProfile.data[dataIndex].tables[tableIndex] = {
        ...profileData.tables[tableIndex],
        columns: profileData.tables[tableIndex].columns.map((column, i) => ({
          ...column,
          name: headers[i] ?? column.name,
        })),
      };
    } else {
      updatedProfile.data = { ...profileData };
      updatedProfile.data.tables = [...profileData.tables];
      updatedProfile.data.tables[tableIndex] = {
        ...profileData.tables[tableIndex],
        columns: profileData.tables[tableIndex].columns.map((column, i) => ({
          ...column,
          name: headers[i] ?? column.name,
        })),
      };
    }

    setProfile(updatedProfile);
  };
  const profileData = getProfileData(profile, dataIndex);
  const headers = activeLine !== null && seperator ? header[activeLine].split(seperator) : [];

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();

      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;

      const newValue =
        seperator.substring(0, start) + "\t" + seperator.substring(end);

      setSeperator(newValue);

      // restore cursor position
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 1;
      }, 0);
    }
  };

  return (<div className="relative p-8 text-lg leading-relaxed">
    <Modal show={showTableHeaderModal} onHide={() => {
      setActiveLine(null);
      setShowTableHeaderModal(false);
    }
    }>
      <Modal.Header closeButton>Set Table Header</Modal.Header>
      <Modal.Body>
        The input row you have selected, which should be used as a table header:<br/>
        <pre>{header[activeLine]}</pre>
        <br/>
        <p>Specify a character or combination of characters to be used to separate the row into the different column
          headers</p>
        <p>Common seperator:</p>
        <ButtonGroup>
          <Button onClick={() => setSeperator(' ')}>space</Button>
          <Button onClick={() => setSeperator('\t')}>tab</Button>
          <Button onClick={() => setSeperator(';')}>semicolon</Button>
          <Button onClick={() => setSeperator(',')}>comma</Button>
        </ButtonGroup>
        <Form.Group>
          <Form.Label column="sm">Seperator</Form.Label>
          <Form.Control onKeyDown={handleKeyDown} value={seperator} onChange={(e) => setSeperator(e.target.value)}
                        type="text"
                        placeholder="Enter seperator"/>
        </Form.Group>
        {seperator && (<>
          <p className="mt-3">The result would look like:</p>
          <Container fluid className="overflow-auto">
            <Table striped bordered hover>
              <thead>
              <tr>
                {profileData?.tables?.[tableIndex]?.columns.map((column, i) => <th
                  key={column.key ?? i}>{headers[i] ?? column.name}</th>)}
              </tr>
              </thead>
              <tbody/>
            </Table>
          </Container>
        </>)}
      </Modal.Body>
      <Modal.Footer><Button disabled={!seperator} variant="info" onClick={() => {
        useAsColumnHeader(header[activeLine]);
        setActiveLine(null);
        setShowTableHeaderModal(false);
      }}>Use as header</Button></Modal.Footer>
    </Modal>

    {multilineMode && (<Alert variant="warning" style={{
      position: 'fixed', zIndex: 501, right: '3px', top: '118px', width: '42vw', minWidth: '400px', bottom: '20px'
    }}><b className="alert-heading">Multiline mode enabled.</b>
      <p>In this mode, you can create an identifier that identifies a value from the header based on features from
        multiple lines. To exit this mode, you must either press Cancel or create the Identifier.</p>
      <p>Select additional regex features from previous lines for more precise matching.</p>
      <p>Current regex is: <b>{multilineSelectionReg}</b></p>
      {multilineSelectionRes}
      {multilineSelectionRes ? <Button variant="success"
              size="sm"
              onClick={() => {
                addIdentifier(multilineSelectionReg);
                _setMultilineSelection([]);
                setMultilineMode(false);
                hidePopover();
              }}>Create Identifier</Button> : <p>Your regex does not find any string.</p>}
      <Button variant="danger"
              size="sm"
              onClick={() => {
                _setMultilineSelection([]);
                setMultilineMode(false);
                hidePopover();
              }}
      >Cancel</Button></Alert>)}

    <pre>
        <div ref={paragraphRef}>
          {header.map((line, index) => {
            return <React.Fragment key={index}>{(<>
							<span className="code-line-index"
                    id={index}
                    onMouseEnter={() => setActiveLine(index)}
                    onMouseLeave={() => !showTableHeaderModal && setActiveLine(null)}
              >
                              {activeLine === index ? (<OverlayTrigger placement="bottom"
                                                                       overlay={<Tooltip id="code-line-tooltip">
                                                                         Use this line as column header
                                                                       </Tooltip>}>
                                <Button size="sm" variant="info"
                                        onClick={() => setShowTableHeaderModal(true)}>    &darr;</Button>


                              </OverlayTrigger>) : (<span>{index + 1}</span>)}
							</span>
              <code className={activeLine === index ? "active-header-select" : ""} data-idx={index}>{line}</code><br/>
            </>)}</React.Fragment>
          })}
        </div>
      </pre>

    {menuPos && (<div
      ref={menuRef}
      className="bg-white border border-gray-300 rounded-xl shadow-sm gap-2 text-sm"
      style={{
        position: "absolute",
        borderRadius: '8px',
        top: menuPos.y,
        left: Math.max(menuPos.x, 210),
        transform: "translate(-50%, -100%)",
        maxWidth: '400px'
      }}
    >{menuContent()}</div>)}
  </div>);
}

FileHeaderPresenter.propTypes = {
  header: PropTypes.arrayOf(PropTypes.string).isRequired,
  addIdentifier: PropTypes.func.isRequired,
  updateRegex: PropTypes.func.isRequired,
  tableIndex: PropTypes.number.isRequired,
  dataIndex: PropTypes.number.isRequired,
};

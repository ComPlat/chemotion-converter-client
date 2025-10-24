import React, {useState, useEffect, useRef} from "react";
import {Alert, Button} from "react-bootstrap";

const integerRegex = '[+-]?\\d+';
const floatRegex = '[+-]?(?:\\d*[,.]\\d+|\\d+)(?:[eE][+-]?\\d+)?';
const emailRegex = '[\\w.%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}';
const defaultRegex = '.+';
const regexList = [integerRegex, floatRegex, emailRegex, defaultRegex];

export default function FileHeaderPresenter({header, addIdentifier, updateRegex}) {
  const [selection, setSelection] = useState(["", ""]);
  const [selectionElement, setSelectionElement] = useState(null);
  const [menuPos, setMenuPos] = useState(null);
  const [menuErrorMsg, setMenuErrorMsg] = useState(null);

  const menuRef = useRef(null);
  const paragraphRef = useRef(null);

  const [multilineMode, setMultilineMode] = useState(false);
  const [multilineSelection, setMultilineSelection] = useState("");
  const [multilineSelectionIndex, setMultilineSelectionIndex] = useState(-1);

  const setNewSelection = (selection = ["", ""], selectionContainer = null) => {
    setSelection(selection);
    if (selectionContainer) {
      setSelectionElement(selectionContainer);
    } else {
      setSelectionElement(null)
    }
  };

  const escapeRegex = str => str.replace(/[/.*+?^${}()|[\]\\]/g, "\\$&");

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

        if (!paragraphRef.current.contains(container)) {
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
          x: rect.left + rect.width / 2,
          y: rect.top - 10 + window.scrollY,
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
        backgroundColor: '#f8f8f8',
        fontStyle: 'bold',
      }}>{menuErrorMsg}</p>;
    }
    if (multilineMode) {
      return <>
        <p className="mb-1 p-2" style={{
          backgroundColor: '#f8f8f8',
          fontStyle: 'bold',

        }}>Generate identifier</p>
        <div className="p-2">
          To add <span className="fw-bold"> {selection[1]}</span> as additional feature to your regex,
          simply click <Button
          size="sm"
          onClick={() => {
            const newFeature = escapeRegex(selection[1]);
            setMultilineSelection(`${newFeature}[\\s\\S]*\\n${multilineSelection}`);
            setMultilineSelectionIndex(selectionElement?.parentElement.dataset.idx);
            hidePopover();
          }
          }
          variant="info"
        >Add</Button>
        </div>
      </>
    }
    return <>
      <p className="mb-1 p-2" style={{
        backgroundColor: '#f8f8f8',
        fontStyle: 'bold',

      }}>Generate identifier</p>
      <div className="p-2">

        <p>To create a new selector for the value <span className="fw-bold"> {selection[1]}</span>,
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
              setMultilineSelection(res.substring(1, res.length - 1));
              hidePopover();
              setMultilineSelectionIndex(selectionElement?.parentElement.dataset.idx);
            }}
            variant="info"
          >
            New multiline Identifier
          </Button> to include information from the preceding lines in the selection of the value. </p>


      </div>
    </>

  }

  return (
    <div className="relative p-8 text-lg leading-relaxed">

      {multilineMode && (
        <Alert variant="warning" style={{
          position: 'fixed',
          zIndex: 10,
          right: '3px',
          top: '118px',
          width: '42vw',
          minWidth: '400px',
          bottom: '20px'
        }}><b className="alert-heading">Multiline mode enabled.</b>
          <p>In this mode, you can create an identifier that identifies a value from the header based on features from multiple lines. To exit this mode, you must either press Cancel or create the Identifier.</p>
          <p>Select additional regex features from previous lines for more precise matching.</p>
          <p>Current regex is: <b>{multilineSelection}</b></p>
          {updateRegex(multilineSelection)}
          <Button variant="success"
                  size="sm"
                  onClick={() => {
                    addIdentifier(multilineSelection);
                    setMultilineSelection("");
                    setMultilineMode(false);
                    hidePopover();
                  }}>Create Identifier</Button>
          <Button variant="danger"
                  size="sm"
                  onClick={() => {
                    setMultilineSelection("");
                    setMultilineMode(false);
                    hidePopover();
                  }}
          >Cancel</Button></Alert>)}

      <pre>
        <div ref={paragraphRef}>
          {header.map((line, index) => {
            return <React.Fragment key={index}>{(!multilineMode || index < multilineSelectionIndex) &&
              (<code data-idx={index}>{line}</code>)
            }</React.Fragment>
          })}
        </div>
        {header.map((line, index) => {
          return <React.Fragment key={index}>{(multilineMode && index >= multilineSelectionIndex) &&
            (<code style={{color: '#aaa'}} data-idx={index}>{line}</code>)
          }</React.Fragment>
        })}
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
    </div>
  );
}

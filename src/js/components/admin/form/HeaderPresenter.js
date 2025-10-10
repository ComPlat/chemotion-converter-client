import React, {useState, useEffect, useRef} from "react";

const integerRegex = '[+-]?\\d+';
const floatRegex = '[+-]?(?:\\d*[,.]\\d+|\\d+)(?:[eE][+-]?\\d+)?';
const emailRegex = '[\\w.%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}';
const defaultRegex = '.+';
const regexList = [integerRegex, floatRegex, emailRegex, defaultRegex];

export default function FileHeaderPresenter({header, addIdentifier}) {
  const [selection, setSelection] = useState("");
  const [selectionLine, setSelectionLine] = useState("");
  const [menuPos, setMenuPos] = useState(null);
  const [menuErrorMsg, setMenuErrorMsg] = useState(null);
  const menuRef = useRef(null);
  const paragraphRef = useRef(null);
  const setNewSelection = (selection = "", selectionContainer = null) => {
    setSelection(selection);
    if (selectionContainer) {
      setSelectionLine(selectionContainer.textContent);
    } else {
      setSelectionLine("")
    }
  };

  function buildRegexWithSnippet(line, snippet) {
    // Escape regex special chars in both
    const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regexMath = regexList.find(x => {
      return snippet.match(new RegExp(`^${x}$`))
    });
    const escapedLine = escapeRegex(line);
    const escapedSnippet = escapeRegex(snippet);
    const escapedSplitLine = escapedLine.split(escapedSnippet, 2);
    // Replace the snippet in the escaped line with a capturing group
    const pattern = `${escapedSplitLine[0]}(${regexMath})${escapedSplitLine[1].replace(/\d/g, '\\d')}`;

    // Create a regex that matches the full line (anchored)
    return `^${pattern}$`;
  }

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const container = range.startContainer;
        const containerEnd = range.endContainer;

        if (!paragraphRef.current.contains(container)) {
          // Selection is outside → ignore
          setNewSelection();
          setMenuPos(null);
          return;
        }

        if (containerEnd === container) {
          setNewSelection(selectedText, container);
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
        setNewSelection();
        setMenuPos(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleOptionClick = () => {
    const res = buildRegexWithSnippet(selectionLine, selection);
    setNewSelection();
    addIdentifier(res);
    setMenuPos(null);
  };

  const menuContent = () => {
    if (menuErrorMsg) {
      return <p>{menuErrorMsg}</p>;
    }
    return <><p className="mb-1">Generate identifier for:</p>
      <p className="fw-bold"> {selection}</p>
      <button
        onClick={() => handleOptionClick()}
        className="btn btn-info"
      >
        New Identifier
      </button>
    </>

  }

  return (
    <div className="relative p-8 text-lg leading-relaxed">

      <pre ref={paragraphRef}>
        {header.map((line, index) => (
          <code key={index}>{line}</code>
        ))}
      </pre>

      {menuPos && (<div
        ref={menuRef}
        className="bg-white border border-gray-300 rounded-xl shadow-sm p-2 gap-2 text-sm"
        style={{
          position: "absolute",
          top: menuPos.y,
          left: menuPos.x,
          transform: "translate(-50%, -100%)",
        }}
      >{menuContent()}</div>)}
    </div>
  );
}

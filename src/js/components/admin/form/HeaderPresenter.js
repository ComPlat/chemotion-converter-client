import React, {useState, useEffect, useRef} from "react";

export default function FileHeaderPresenter({header}) {
  const [selection, setSelection] = useState("");
  const [menuPos, setMenuPos] = useState(null);
  const [menuErrorMsg, setMenuErrorMsg] = useState(null);
  const menuRef = useRef(null);
  const paragraphRef = useRef(null);

  useEffect(() => {
    const handleMouseUp = (e) => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const container = range.startContainer;
        const containerEnd = range.endContainer;

        if (!paragraphRef.current.contains(container)) {
          // Selection is outside → ignore
          setSelection("");
          setMenuPos(null);
          return;
        }

        if (containerEnd === container) {
          setSelection(selectedText);
          setMenuErrorMsg("");
        } else {
          setSelection("");
          setMenuErrorMsg("Generating an identifier is only possible for single-line selections.");
        }


        setMenuPos({
          x: rect.left + rect.width / 2,
          y: rect.top - 10 + window.scrollY,
        });
      } else {
        setSelection("");
        setMenuPos(null);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleOptionClick = (option) => {
    console.log(`${option} on:`, selection);
    setSelection("");
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

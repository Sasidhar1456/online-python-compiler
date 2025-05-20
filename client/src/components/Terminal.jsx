import React, { useEffect, useRef } from "react";

export default function Terminal({
  output,
  awaitingInput,
  inputValue,
  setInputValue,
  sendInput,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (awaitingInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [awaitingInput]);

  return (
    <div className="h-full flex flex-col">
      {awaitingInput && (
        <div className="p-2 bg-gray-800">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendInput();
            }}
            className="w-full bg-black text-green-400 font-mono p-1 focus:outline-none"
            placeholder="Type input here and press Enter..."
          />
        </div>
      )}
      <div className="flex-grow whitespace-pre-wrap p-2">{output.trim() === "" ? "The output will be displayed here." : output}</div>
    </div>
  );
}

import React, { useEffect } from "react";

export default function Terminal({
  output,
  awaitingInput,
  inputValue,
  setInputValue,
  sendInput,
  inputRef,
}) {
  useEffect(() => {
    if (awaitingInput && inputRef?.current) {
      inputRef.current.focus();
    }
  }, [awaitingInput, inputRef]);

  const outputLines = output.split("\n");

  return (
    <div className="h-full flex flex-col bg-black text-green-400 font-mono p-2">
      <div className="flex-grow whitespace-pre-wrap">
        {outputLines.slice(0, -1).map((line, index) => (
          <div key={index}>{line}</div>
        ))}

        <div className="flex items-center flex-wrap">
          <span>{outputLines[outputLines.length - 1]}</span>

          {awaitingInput && (
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendInput();
              }}
              className="bg-black text-green-400 font-mono p-1 focus:outline-none ml-1 flex-1"
              placeholder=""
            />
          )}
        </div>
      </div>
    </div>
  );
}

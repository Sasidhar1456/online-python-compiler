import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Editor from "./components/Editor.jsx";
import Terminal from "./components/Terminal.jsx";

const socket = io("https://online-python-compiler-production.up.railway.app");

export default function App() {
  const [output, setOutput] = useState("The output will be displayed here.");
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [inputValue, setInputValue] = useState("");
  const codeRef = useRef("");
  const inputRef = useRef(null); // ✅ Add ref to manage focus from parent

  useEffect(() => {
    socket.on("stdout", (data) => {
      setOutput((prev) => prev + data);
      if (data.trim().endsWith(":")) {
        setAwaitingInput(true);
        setTimeout(() => {
          if (inputRef.current) inputRef.current.focus(); // ✅ Always focus on input
        }, 100);
      }
    });

    socket.on("processEnd", () => {
      setAwaitingInput(false);
    });

    return () => {
      socket.off("stdout");
      socket.off("processEnd");
    };
  }, []);

  const runCode = () => {
    setOutput("");
    setInputValue("");
    socket.emit("runCode", codeRef.current);

    // If already awaiting input, manually refocus
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 300); // ✅ Give time for stdout to arrive and render
  };

  const sendInput = () => {
    socket.emit("stdin", inputValue);
    setOutput((prev) => prev + inputValue + "\n");
    setInputValue("");
    setAwaitingInput(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 p-2 h-[45vh] md:h-[90vh]">
          <Editor codeRef={codeRef} />
          <button
            onClick={runCode}
            className="mt-2 md:mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Run Code
          </button>
        </div>

        <div className=" ml-2 mt-16 md:mt-2 md:w-1/2 h-[45vh] md:h-[90vh] p-2 bg-black text-green-400 font-mono overflow-y-auto m-2">
          <Terminal
            output={output}
            awaitingInput={awaitingInput}
            inputValue={inputValue}
            setInputValue={setInputValue}
            sendInput={sendInput}
            inputRef={inputRef} // ✅ Pass down inputRef to Terminal
          />
        </div>
      </div>
    </div>
  );
}

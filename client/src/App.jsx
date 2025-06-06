import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import Editor from "./components/Editor.jsx";
import Terminal from "./components/Terminal.jsx";

const socket = io("https://online-python-compiler-production.up.railway.app");

export default function App() {
  const [output, setOutput] = useState("The output will be displayed here.");
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const codeRef = useRef("");
  const inputRef = useRef(null);

  useEffect(() => {
    socket.on("stdout", (data) => {
      setOutput((prev) => prev + data);
      if (data.trim().endsWith(":")) {
        setAwaitingInput(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    });

    socket.on("processEnd", () => {
      setAwaitingInput(false);
      setLoading(false);
    });

    return () => {
      socket.off("stdout");
      socket.off("processEnd");
    };
  }, []);

  const runCode = () => {
    setOutput("");
    setInputValue("");
    setLoading(true);
    socket.emit("runCode", codeRef.current);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const stopExecution = () => {
    socket.emit("stopExecution");
    setAwaitingInput(false);
    setLoading(false);
    setOutput((prev) => prev + "\n[Execution Stopped by User]\n");
  };

  const sendInput = () => {
    socket.emit("stdin", inputValue);
    setOutput((prev) => prev + inputValue + "\n");
    setInputValue("");
    setAwaitingInput(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header Title */}
      <div className="text-center py-4 ">
        <h1 className="text-3xl md:text-4xl font-bold text-white ">
          Online Python Compiler 
        </h1>
      </div>

      {/* Main Layout */}
      <div className="flex-grow flex flex-col md:flex-row ">

        {/* Editor Section */}
        <div className="w-full md:w-1/2 p-2 h-[45vh] md:h-[80vh]">
          <Editor codeRef={codeRef} />

          <div className="flex gap-4 mt-2 md:mt-4">
            <button
              onClick={runCode}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white 
                ${loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  <span>Running...</span>
                </div>
              ) : (
                "Run Code"
              )}
            </button>

            {loading && (
              <button
                onClick={stopExecution}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Stop
              </button>
            )}
          </div>
        </div>

        {/* Terminal Section */}
        <div className="ml-2 mt-16 md:mt-2 md:w-1/2 h-[45vh] md:h-[80vh] p-2 bg-black text-green-400 font-mono overflow-y-auto m-2">
          <Terminal
            output={output}
            awaitingInput={awaitingInput}
            inputValue={inputValue}
            setInputValue={setInputValue}
            sendInput={sendInput}
            inputRef={inputRef}
          />
        </div>
      </div>
    </div>
  );
}

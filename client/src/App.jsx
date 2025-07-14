import React, { useState, useEffect, useRef } from "react";
import CodeEditor from "./components/Editor.jsx";
import Terminal from "./components/Terminal.jsx";

let socket;

export default function App() {
  const [output, setOutput] = useState("The output will be displayed here.\n");
  const [awaitingInput, setAwaitingInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const codeRef = useRef("");
  const inputRef = useRef(null);

  useEffect(() => {
    socket = new WebSocket("wss://compiler-ylxl.onrender.com/ws/python"); // ✅ FIXED QUOTES

    socket.onopen = () => console.log("Connected to WebSocket ✅");
    socket.onmessage = (event) => {
      const data = event.data;
      setOutput((prev) => prev + data);

      if (data.trim().endsWith(":")) {
        setAwaitingInput(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }

      if (data.includes("processEnd")) {
        setAwaitingInput(false);
        setLoading(false);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected ❌");
      setLoading(false);
    };

    socket.onerror = (err) => console.error("WebSocket error:", err);

    return () => {
      socket.close();
    };
  }, []);

  const runCode = () => {
    setOutput("");
    setInputValue("");
    setLoading(true);
    socket.send("runCode:" + codeRef.current);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  const stopExecution = () => {
    socket.send("stopExecution");
    setAwaitingInput(false);
    setLoading(false);
    setOutput((prev) => prev + "\n[Execution Stopped by User]\n");
  };

  const sendInput = () => {
    socket.send("stdin:" + inputValue);
    setOutput((prev) => prev + inputValue + "\n");
    setInputValue("");
    setAwaitingInput(false);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white">Online Python Interpreter</h1>
      </div>

      <div className="flex-grow flex flex-col md:flex-row h-[90%]">
        {/* Editor */}
        <div className="w-full md:w-1/2 p-2 h-[45%] md:h-[100%]">
          <div className="bg-[#1e1e1e] m-0 p-2 rounded-t-lg inline-block">
            <span className="text-white  inline m-0">temp.py</span>

          </div>
          <CodeEditor codeRef={codeRef}  />
          <div className="flex gap-4 mt-2 md:mt-4">
            <button
              onClick={runCode}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-white ${
                loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Running..." : "Run Code"}
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

        {/* Terminal */}
        <div className="ml-2 mt-16 md:mt-2 md:w-1/2 h-[45%] md:h-[85%] p-2 bg-black text-green-400 font-mono overflow-y-auto m-2">
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

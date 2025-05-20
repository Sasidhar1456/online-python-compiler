import React, { useState, useEffect, useRef } from "react";  
import io from "socket.io-client";  
import Editor from "./components/Editor.jsx";  
import Terminal from "./components/Terminal.jsx";  

const socket = io("https://online-python-compiler-production.up.railway.app:8080"); // Backend runs on port 5000 by default :contentReference[oaicite:20]{index=20}.

export default function App() {
  const [output, setOutput] = useState("");  
  const [awaitingInput, setAwaitingInput] = useState(false);  
  const [prompt, setPrompt] = useState("");  
  const [inputValue, setInputValue] = useState("");  
  const codeRef = useRef("");

  useEffect(() => {
    // Listen for stdout events from server
    socket.on("stdout", (data) => {
      setOutput((prev) => prev + data);  
      // If Python expects input (detect trailing colon), set awaitingInput to true
      if (data.trim().endsWith(":")) {
        setAwaitingInput(true);
      }
    });

    // Listen for process end
    socket.on("processEnd", () => {
      setAwaitingInput(false);
    });

    return () => {
      socket.off("stdout");
      socket.off("processEnd");
    };
  }, []);

  // Handle sending code to server
  const runCode = () => {
    setOutput("");  
    socket.emit("runCode", codeRef.current);
  };

  // Handle user entering input when Python prompts
  const sendInput = () => {
    socket.emit("stdin", inputValue);  
    setOutput((prev) => prev + inputValue + "\n");  
    setInputValue("");  
    setAwaitingInput(false);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-grow flex overflow-hidden">
        <div className="w-1/2 p-2">
          <Editor codeRef={codeRef} />
          <button
            onClick={runCode}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Run Code
          </button>
        </div>
        <div className="w-1/2 h-[90vh] p-2 bg-black text-green-400 font-mono overflow-y-auto m-2">
          <Terminal
            output={output}
            awaitingInput={awaitingInput}
            inputValue={inputValue}
            setInputValue={setInputValue}
            sendInput={sendInput}
          />
        </div>
      </div>
    </div>
  );
}

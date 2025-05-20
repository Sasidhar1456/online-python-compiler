import React, { useRef, useEffect } from "react";  
import { Editor } from "@monaco-editor/react";  

export default function CodeEditor({ codeRef }) {
  const defaultCode = `\n\n#This is created for an assignment purpose by Sasidhar Pinjala\n\nnum1 = int(input("Enter your 1st number: "))\n
num2 = int(input("Enter your 2nd number: "))\n
print(f"The sum of {num1} and {num2} is {num1 + num2}")`;

  // Initialize codeRef with default code on mount
  useEffect(() => {
    codeRef.current = defaultCode;
  }, []);

  return (
    <Editor
      height="90vh"
      defaultLanguage="python"
      defaultValue={defaultCode}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
      }}
      onChange={(value) => {
        codeRef.current = value;
      }}
    />
  );
}

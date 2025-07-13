import React, { useRef, useEffect, useState } from "react";
import { Editor } from "@monaco-editor/react";

export default function CodeEditor({ codeRef }) {
  const [editorHeight, setEditorHeight] = useState("90%");

  const defaultCode = `
# You can write the code here.

num1 = int(input("Enter your 1st number: "))
num2 = int(input("Enter your 2nd number: "))
print(f"The sum of {num1} and {num2} is {num1 + num2}")
`;

  useEffect(() => {
    codeRef.current = defaultCode;

    const updateHeight = () => {
      if (window.innerWidth < 768) {
        setEditorHeight("45%");
      } else {
        setEditorHeight("80%");
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, [codeRef, defaultCode]);

  return (
    <Editor
      height={editorHeight}
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

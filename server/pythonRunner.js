import { spawn } from "child_process";  
import fs from "fs";  
import path from "path";  

export function runPythonCode(code, onStdout, onStderr, onClose) {
  const filePath = path.join(__dirname, "tempCode.py");
  fs.writeFileSync(filePath, code);

  const pyProc = spawn("python", ["-u", filePath]);  
  pyProc.stdout.on("data", (data) => onStdout(data.toString()));  
  pyProc.stderr.on("data", (data) => onStderr(data.toString()));  
  pyProc.on("close", (code) => onClose(code));  

  return pyProc;
}

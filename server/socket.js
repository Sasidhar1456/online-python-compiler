import { spawn } from "child_process";  
import path from "path";  

export default function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    let pyProcess = null;

    socket.on("runCode", (code) => {
      // Write the code to a temporary Python file
      const filePath = path.join(__dirname, "tempCode.py");
      import("fs").then((fs) => {
        fs.writeFileSync(filePath, code);

        // Spawn Python with unbuffered output (-u) to stream in real time
        pyProcess = spawn("python", ["-u", filePath]);

        pyProcess.stdout.on("data", (data) => {
          const text = data.toString();
          socket.emit("stdout", text);
        });

        pyProcess.stderr.on("data", (data) => {
          const text = data.toString();
          socket.emit("stdout", text); // Treat stderr similarly :contentReference[oaicite:27]{index=27}.
        });

        pyProcess.on("close", (code) => {
          socket.emit("processEnd", `\n[Process exited with code ${code}]\n`);
        });
      });
    });

    socket.on("stdin", (input) => {
      if (pyProcess) {
        pyProcess.stdin.write(input + "\n"); // Send user input to Python stdin :contentReference[oaicite:28]{index=28}.
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      if (pyProcess) {
        pyProcess.kill(); // Clean up when the client disconnects :contentReference[oaicite:29]{index=29}.
      }
    });
  });
}

import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

// 1. Create the Express app and enable CORS for Vite's default URL and Render deployment
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://online-python-compiler.onrender.com",
];
app.use(cors({ origin: allowedOrigins }));

// 2. Wrap Express in an HTTP server, then attach Socket.IO with matching CORS settings
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// 3. Handle each new client connection once
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  let pyProcess = null;

  // 3a. Handle stdin input from client
  socket.on("stdin", (input) => {
    if (pyProcess && !pyProcess.killed) {
      console.log("Writing to Python stdin:", input);
      pyProcess.stdin.write(input + "\n");
    }
  });

  // 3b. Handle code execution
  socket.on("runCode", (code) => {
    console.log("Received runCode with code:", code);

    const filePath = path.join(process.cwd(), "tempCode.py");
    try {
      fs.writeFileSync(filePath, code);
      console.log("Wrote code to tempCode.py");
    } catch (err) {
      console.error("Error writing tempCode.py:", err);
      socket.emit("stdout", `Error saving code: ${err.message}\n`);
      return;
    }

    pyProcess = spawn("python", ["-u", filePath]);

    pyProcess.stdout.removeAllListeners("data");
    pyProcess.stdout.on("data", (data) => {
      const text = data.toString();
      console.log("Python stdout:", text);
      socket.emit("stdout", text);

      if (text.trim().endsWith(":")) {
        socket.emit("prompt", true);
      }
    });

    pyProcess.stderr.removeAllListeners("data");
    pyProcess.stderr.on("data", (data) => {
      const text = data.toString();
      console.error("Python stderr:", text);
      socket.emit("stdout", text);
    });

    socket.once("disconnect", () => {
      if (pyProcess && !pyProcess.killed) {
        pyProcess.kill();
      }
    });

    pyProcess.removeAllListeners("close");
    pyProcess.once("close", (exitCode) => {
      console.log(`Python process exited with code ${exitCode}`);
      socket.emit("stdout", `\n[Finished with code ${exitCode}]\n`);
      socket.emit("processEnd");
    });
  });

  // 3c. Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (pyProcess && !pyProcess.killed) {
      pyProcess.kill();
    }
  });
});

// 4. Start listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Socket.IO server listening on port ${PORT}`);
});

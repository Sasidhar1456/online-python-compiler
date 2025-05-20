import express from "express";                                          // ES Modules require "type": "module" :contentReference[oaicite:7]{index=7}
import http from "http";                                               // Create HTTP server to wrap Express :contentReference[oaicite:8]{index=8}
import { Server as SocketIOServer } from "socket.io";                  // Socket.IO server class :contentReference[oaicite:9]{index=9}
import cors from "cors";                                               // CORS middleware so React (Vite) can connect :contentReference[oaicite:10]{index=10}
import fs from "fs";                                                    // File system module to write Python code :contentReference[oaicite:11]{index=11}
import path from "path";                                                // Path utilities to build a safe file path :contentReference[oaicite:12]{index=12}
import { spawn } from "child_process";                                  // To spawn a Python subprocess :contentReference[oaicite:13]{index=13}

// 1. Create the Express app and enable CORS for Vite's default URL (http://localhost:5173)
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));                      // Must match React’s address or Browser will block requests :contentReference[oaicite:14]{index=14}

// 2. Wrap Express in an HTTP server, then attach Socket.IO with CORS options
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// 3. Handle each new client connection once
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);                         // Log new connections :contentReference[oaicite:15]{index=15}

  let pyProcess = null;                                                  // Will hold the Python child_process reference

  // 3a. “stdin” handler registered ONCE per connection
  socket.on("stdin", (input) => {
    if (pyProcess && !pyProcess.killed) {                                // Only send if a Python process is alive
      console.log("Writing to Python stdin:", input);                     // Log user input :contentReference[oaicite:16]{index=16}
      pyProcess.stdin.write(input + "\n");                                // Write user input plus newline
    }
  });

  // 3b. “runCode” handler registered ONCE per connection
  socket.on("runCode", (code) => {
    console.log("Received runCode with code:", code);                     // Confirm receipt of code :contentReference[oaicite:17]{index=17}

    // 3b.i. Write the code to tempCode.py in the project root
    const filePath = path.join(process.cwd(), "tempCode.py");             // process.cwd() returns the working directory :contentReference[oaicite:18]{index=18}
    try {
      fs.writeFileSync(filePath, code);                                   
      console.log("Wrote code to tempCode.py");                           // Log successful file write :contentReference[oaicite:19]{index=19}
    } catch (err) {
      console.error("Error writing tempCode.py:", err);                    
      socket.emit("stdout", `Error saving code: ${err.message}\n`);        // Inform client of file‐write error :contentReference[oaicite:20]{index=20}
      return;                                                              // Abort if writing fails
    }

    // 3b.ii. Spawn Python with -u (unbuffered) to stream each line immediately
    pyProcess = spawn("python", ["-u", filePath]);                          // On Windows, ensure "python" is installed and in PATH :contentReference[oaicite:21]{index=21}

    // 3b.iii. Handle Python’s stdout: this listener is automatically replaced on each run
    // BUT we must first remove any previous “data” listeners to avoid duplicates
    pyProcess.stdout.removeAllListeners("data");                            // Clear leftover listeners if any :contentReference[oaicite:22]{index=22}
    pyProcess.stdout.on("data", (data) => {
      const text = data.toString();                                        
      console.log("Python stdout:", text);                                 // Log Python output for debugging :contentReference[oaicite:23]{index=23}
      socket.emit("stdout", text);                                          // Forward to client terminal :contentReference[oaicite:24]{index=24}

      // 3b.iv. Detect prompts (any line ending in a colon)
      if (text.trim().endsWith(":")) {
        socket.emit("prompt", true);                                        // Tell client to show input field :contentReference[oaicite:25]{index=25}
      }
    });

    // 3b.v. Handle Python’s stderr similarly (remove previous listeners first)
    pyProcess.stderr.removeAllListeners("data");                            // Prevent duplicate stderr logs :contentReference[oaicite:26]{index=26}
    pyProcess.stderr.on("data", (data) => {
      const text = data.toString();                                        
      console.error("Python stderr:", text);                                // Log error for debugging :contentReference[oaicite:27]{index=27}
      socket.emit("stdout", text);                                          // Forward stderr lines to client :contentReference[oaicite:28]{index=28}
    });

    // 3b.vi. When Python process exits, send processEnd _once_ using socket.once
    socket.once("disconnect", () => {                                       // Ensure we don’t leave zombie listeners on disconnect
      if (pyProcess && !pyProcess.killed) {
        pyProcess.kill();                                                   // Kill the Python process if client disconnects :contentReference[oaicite:29]{index=29}
      }
    });

    // 3b.vii. Use pyProcess.removeAllListeners before adding "close" handler
    pyProcess.removeAllListeners("close");                                  // Prevent multiple close handlers :contentReference[oaicite:30]{index=30}
    pyProcess.once("close", (exitCode) => {                                 
      console.log(`Python process exited with code ${exitCode}`);           // Log the exit code :contentReference[oaicite:31]{index=31}
      socket.emit("stdout", `\n[Finished with code ${exitCode}]\n`);         // Inform client :contentReference[oaicite:32]{index=32}
      socket.emit("processEnd");                                            // Let client know no more input is expected :contentReference[oaicite:33]{index=33}
    });
  });

  // 3c. Log when the client disconnects
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);                      // Clean‐up notice :contentReference[oaicite:34]{index=34}
    if (pyProcess && !pyProcess.killed) {                                  
      pyProcess.kill();                                                     // Ensure Python process is terminated if client goes away :contentReference[oaicite:35]{index=35}
    }
  });
});

// 4. Start listening on port 5000 (or a PORT environment variable for production)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Socket.IO server listening on port ${PORT}`);               // Confirm server is up :contentReference[oaicite:36]{index=36}
});

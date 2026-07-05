const express = require('express');
const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Directory the spawned Claude Code processes actually operate on.
const SANDBOX_CWD = process.env.SANDBOX_CWD || require('path').join(__dirname, '..', 'sandbox');
const ALLOWED_TOOLS = 'Bash,Edit,Write,Read';

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s.toFixed(1)}s`;
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

// Spawns `claude -p <prompt>` in stream-json mode, parsing newline-delimited
// JSON as it arrives. A chunk boundary can land mid-line, so partial lines
// are buffered until a full line is available.
function runClaudeStep({ prompt, cwd, sessionId, onEvent }) {
  return new Promise((resolve, reject) => {
    const args = [
      '-p', prompt,
      '--output-format', 'stream-json',
      '--verbose',
      '--allowedTools', ALLOWED_TOOLS,
    ];
    if (sessionId) {
      args.push('--resume', sessionId);
    }

    const child = spawn('claude', args, { cwd });

    let buffer = '';
    let capturedSessionId = sessionId || null;
    let lastResult = null;
    let stderrBuf = '';

    const handleLine = (line) => {
      if (!line.trim()) return;
      let evt;
      try {
        evt = JSON.parse(line);
      } catch (err) {
        console.error('Failed to parse stream-json line:', line);
        return;
      }
      if (evt.session_id) capturedSessionId = evt.session_id;
      if (evt.type === 'result') lastResult = evt;
      onEvent(evt);
    };

    child.stdout.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // last element may be an incomplete line
      for (const line of lines) handleLine(line);
    });

    child.stderr.on('data', (chunk) => {
      stderrBuf += chunk.toString();
    });

    child.on('error', (err) => {
      reject(err);
    });

    child.on('close', (code) => {
      if (buffer.trim()) handleLine(buffer);

      if (code !== 0) {
        reject(new Error(`claude exited with code ${code}: ${stderrBuf.slice(0, 500)}`));
        return;
      }
      if (lastResult && lastResult.is_error) {
        reject(new Error(lastResult.result || 'claude reported an error result'));
        return;
      }
      resolve({ sessionId: capturedSessionId, result: lastResult });
    });
  });
}

// Runs an ordered sequence of steps as a single chained conversation:
// each step after the first resumes the previous step's session_id.
async function runWorkflow(runId, steps, cwd) {
  let sessionId = null;

  for (const step of steps) {
    const start = Date.now();
    io.emit('workflow:step-status', { runId, stepId: step.id, status: 'running' });

    try {
      const { sessionId: nextSessionId } = await runClaudeStep({
        prompt: step.label,
        cwd,
        sessionId,
        onEvent: (evt) => io.emit('workflow:event', { runId, stepId: step.id, event: evt }),
      });
      sessionId = nextSessionId || sessionId;

      io.emit('workflow:step-status', {
        runId,
        stepId: step.id,
        status: 'done',
        duration: formatDuration(Date.now() - start),
      });
    } catch (err) {
      io.emit('workflow:step-status', {
        runId,
        stepId: step.id,
        status: 'error',
        duration: formatDuration(Date.now() - start),
        error: err.message,
      });
      io.emit('workflow:run-complete', { runId, status: 'error', error: err.message });
      return;
    }
  }

  io.emit('workflow:run-complete', { runId, status: 'success' });
}

app.post('/api/execute-workflow', (req, res) => {
  const { steps } = req.body;
  if (!Array.isArray(steps) || steps.length === 0) {
    return res.status(400).json({ error: 'steps must be a non-empty array of { id, label }' });
  }

  const runId = crypto.randomUUID();
  console.log(`Starting workflow run ${runId}:`, steps.map((s) => s.label));

  runWorkflow(runId, steps, SANDBOX_CWD).catch((err) => {
    console.error(`Workflow run ${runId} crashed:`, err);
    io.emit('workflow:run-complete', { runId, status: 'error', error: err.message });
  });

  res.json({ runId });
});

// Free-text chat: each message resumes the same ongoing session so the
// conversation keeps context, independent of any workflow run.
let chatSessionId = null;

app.post('/api/chat-message', (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const messageId = crypto.randomUUID();
  console.log('Chat message received:', message);

  runClaudeStep({
    prompt: message,
    cwd: SANDBOX_CWD,
    sessionId: chatSessionId,
    onEvent: (evt) => io.emit('chat:event', { messageId, event: evt }),
  })
    .then(({ sessionId }) => {
      if (sessionId) chatSessionId = sessionId;
      io.emit('chat:done', { messageId, status: 'success' });
    })
    .catch((err) => {
      console.error('Chat message failed:', err);
      io.emit('chat:done', { messageId, status: 'error', error: err.message });
    });

  res.json({ messageId });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Claude Code sandbox cwd: ${SANDBOX_CWD}`);
});

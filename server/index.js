const express = require('express');
const http = require('http');
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

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  // Send a stub telemetry message for testing connection
  setTimeout(() => {
    socket.emit('NEW_TELEMETRY', {
      type: 'telemetry',
      data: { url: 'https://ycombinator.com', title: 'Y Combinator' }
    });
  }, 2000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.post('/api/execute-workflow', (req, res) => {
  const { workflow } = req.body;
  console.log('Received workflow to execute:', workflow);
  
  // Stubbing the execution
  res.json({ status: 'success', message: 'Workflow execution started' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

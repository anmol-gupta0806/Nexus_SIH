const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { PORT } = require('./config/env');
const { Server } = require('socket.io');

const server = http.createServer(app);

// Initialize Socket.io for real-time super-resolution job status updates
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  socket.on('join_job', (jobId) => {
    socket.join(`job_${jobId}`);
    console.log(`[WebSocket] Client ${socket.id} subscribed to job_${jobId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

// Attach io instance to app for controllers to emit events
app.set('io', io);

// Start server after connecting to database
const start = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Nexus Satellite Backend running on port ${PORT}`);
    console.log(`📡 WebSocket server active`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log(`====================================================`);
  });
};

start();

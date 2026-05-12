const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const tableRoutes = require('./routes/tables');
const orderRoutes = require('./routes/orders');
const menuRoutes = require('./routes/menu');
const billRoutes = require('./routes/bills');
const analyticsRoutes = require('./routes/analytics');
const userRoutes = require('./routes/users');
const { initializeSocket } = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Restaurant API is running' });
});

initializeSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
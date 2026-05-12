let io;

const initializeSocket = (socketIo) => {
  io = socketIo;

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join_role', (role) => {
      socket.join(role);
      console.log(`Client ${socket.id} joined ${role} room`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
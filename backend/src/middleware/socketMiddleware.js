const { getIO } = require('../socket/socketHandler');

const socketMiddleware = (req, res, next) => {
  req.io = getIO();
  next();
};

module.exports = socketMiddleware;
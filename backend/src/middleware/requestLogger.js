const crypto = require('crypto');
const logger = require('../config/logger');

function requestLogger(req, res, next) {
  req.requestId = crypto.randomUUID();
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('request completed', {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
    });
  });

  next();
}

module.exports = requestLogger;

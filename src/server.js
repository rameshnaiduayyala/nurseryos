import app from './app.js';
import logger from './config/logger.js';
import prisma from './config/database.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`Swagger API Documentation is available at http://localhost:${PORT}/api-docs`);
});

// Graceful Shutdown
const shutdown = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  server.close(async () => {
    logger.info('HTTP server closed.');
    
    try {
      await prisma.$disconnect();
      logger.info('Database client disconnected.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during database disconnection:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

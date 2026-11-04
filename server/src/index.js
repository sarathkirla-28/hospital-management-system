require('dotenv').config();
const app = require('./app');
const seedDatabase = require('./seed');

const PORT = process.env.PORT || 8082;

async function startServer() {
  try {
    // Ensure database and initial demonstration data are initialized
    await seedDatabase();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('===========================================================');
      console.log(`🏥 Intelligent Hospital Management System API Server Active`);
      console.log(`📡 Listening on: http://localhost:${PORT}`);
      console.log(`🩺 Configured Port: ${PORT} (matching project demonstration spec)`);
      console.log('===========================================================');
    });

    const shutdown = () => {
      console.log('\nShutting down server gracefully...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
}

startServer();

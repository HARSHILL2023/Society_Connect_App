require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { PORT, NODE_ENV } = require('./config/env');

const startServer = async () => {
  try {
    await connectDB();

    // Bind to 0.0.0.0 so LAN devices (Expo Go) can reach the backend — not just localhost
    const HOST = '0.0.0.0';
    const server = app.listen(PORT, HOST, () => {
      console.log(`\n=================================================`);
      console.log(`  🏢 Society Connect Backend API Server`);
      console.log(`  📡 Running at: http://localhost:${PORT} and http://${HOST}:${PORT}`);
      console.log(`  🌍 Environment: ${NODE_ENV}`);
      console.log(`  🩺 Health check: http://localhost:${PORT}/api/health`);
      console.log(`=================================================\n`);
    });

    const shutdown = (signal) => {
      console.log(`\n⚡ ${signal} received. Closing HTTP server gracefully...`);
      server.close(() => {
        console.log('✅ Society Connect server terminated cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection:', err.message);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error('❌ Server startup error:', error.message);
    process.exit(1);
  }
};

startServer();


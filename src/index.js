const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDatabase = require('./seed/seed');
const postRoutes = require('./routes/post.routes');
const { setupMcpEndpoint } = require('./mcp/server');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/posts', postRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Setup MCP Streamable HTTP endpoint
setupMcpEndpoint(app);

// Start server
const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Seed data if empty
    await seedDatabase();

    // Start Express server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔════════════════════════════════════════════════╗
║       🚀 MCP Blog Demo Server Started          ║
╠════════════════════════════════════════════════╣
║  API:  http://localhost:${PORT}/api/posts        ║
║  MCP:  http://localhost:${PORT}/mcp              ║
║  Health: http://localhost:${PORT}/health         ║
╚════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();

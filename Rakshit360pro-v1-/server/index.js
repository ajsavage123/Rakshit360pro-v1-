
const express = require('express');
const path = require('path');
const fs = require('fs');

// Load environment variables from client/.env
const envPath = path.join(__dirname, '../client/.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json());

// Serve static files
const staticPath = path.join(__dirname, '../dist/public');
console.log(`📁 Serving static files from: ${staticPath}`);
console.log(`📄 Index file exists: ${require('fs').existsSync(path.join(staticPath, 'index.html'))}`);
app.use(express.static(staticPath));

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    supabase: process.env.VITE_SUPABASE_URL ? 'configured' : 'missing'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Medical AI Assistant API is working!',
    timestamp: new Date().toISOString()
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../dist/public/index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Error loading application');
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Medical AI Assistant serving on http://0.0.0.0:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Supabase: ${process.env.VITE_SUPABASE_URL ? 'configured' : 'using fallback'}`);
  console.log(`🌐 Open in browser: http://0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

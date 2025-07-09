// Minimal diagnostic server for deployment testing
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send(`
    <h1>Diagnostic Server Running</h1>
    <p>Time: ${new Date().toISOString()}</p>
    <p>Environment: ${process.env.NODE_ENV}</p>
    <p>Port: ${process.env.PORT || 5000}</p>
  `);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    env: process.env.NODE_ENV,
    port: process.env.PORT || 5000
  });
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Diagnostic server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Time: ${new Date().toISOString()}`);
});
const express = require('express');
const routes = require('./routes/index'); // Import routes

const app = express();
const port = process.env.PORT || 5000; // Use environment variable PORT or default to 5000

app.use('/', routes); // Use the imported routes

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

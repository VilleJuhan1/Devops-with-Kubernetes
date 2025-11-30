const express = require("express");
const app = express();

// Default to port 3000 if no PORT environment variable is set
// In the Dockerfile, it is set to 3001 to demonstrate configurability
const port = process.env.PORT || 3000;

// Return a simple message for the root route
app.get("/", (req, res) => {
  res.send(`Hello from port ${port}!`);
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server started in port ${port}`);
});
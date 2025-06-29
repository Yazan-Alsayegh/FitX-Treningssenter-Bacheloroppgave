// Authors: 7100, 7094, 7099, 7144 //

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const chatbotRoutes = require('./routes/chatbot');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chatbot', chatbotRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
import express from 'express';   
import cors from 'cors';//to allow requests from your frontend
import dotenv from 'dotenv';     

dotenv.config();

const app = express();             
app.use(cors());          

// Define port number 
const PORT = 3000;

// Route to send Deepgram API key to the frontend
app.get('/get-deepgram-key', (req, res) => {
  // Send the Deepgram API key as a JSON response
  res.json({ key: process.env.DEEPGRAM_API_KEY });
});

// Start the server and log the URL
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

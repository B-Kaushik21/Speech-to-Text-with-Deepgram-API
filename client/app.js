let socket;
let mediaRecorder;
let isRecording = false;

const startBtn = document.getElementById('startBtn');
const clearBtn = document.getElementById('clearBtn');
const output = document.getElementById('output');

// When the "Start Listening" button is clicked
startBtn.onclick = async () => {
  // If we are not currently recording
  if (!isRecording) {
    startBtn.textContent = "Stop Listening"; // Change button text
    isRecording = true; // Update flag

    // Request your Deepgram API key from your backend
    const res = await fetch('http://localhost:3000/get-deepgram-key');
    const { key } = await res.json(); // Extract the key from response

    // Create a WebSocket connection directly to Deepgram’s live transcription API
    socket = new WebSocket(`wss://api.deepgram.com/v1/listen?punctuate=true`, [
      "token", // Send the key as part of the WebSocket protocol headers
      key
    ]);

    // When the WebSocket connection to Deepgram opens
    socket.onopen = async () => {
      // Ask the browser for access to the microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create a MediaRecorder to capture audio from the mic
      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm' // Format 
      });

      // Whenever a chunk of audio is ready (every 250ms), send it to Deepgram
      mediaRecorder.ondataavailable = event => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      };

      mediaRecorder.start(250); // Start recording in chunks of 250ms
    };

    // When Deepgram sends back a transcription result
    socket.onmessage = message => {
      const data = JSON.parse(message.data); // Convert JSON string to JS object
      const transcript = data.channel?.alternatives[0]?.transcript; // Extract transcript text

      // Only show the final version of the transcript (not partial)
      if (transcript && !data.is_final) return;

      // Append the transcript to the textarea
      if (transcript && data.is_final) {
        output.value += transcript + " ";
        output.scrollTop = output.scrollHeight;
      }
    };

  } else {
    // If already recording, stop everything
    startBtn.textContent = "Start Listening"; // Reset button text
    isRecording = false;

    // Stop recording if active
    if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();

    // Close the WebSocket connection if open
    if (socket && socket.readyState === WebSocket.OPEN) socket.close();
  }
};

//"Clear Chat" button 
clearBtn.onclick = () => {
  output.value = "";
};

// index.js
require('dotenv').config();  // Load environment variables from .env file
const express = require('express');
const ytdl = require('ytdl-core');
const app = express();

// Get the site URL from environment variables
const siteUrl = process.env.SITE_URL || 'http://localhost:3000';  // Default to local if not found in .env

// Set default port to 3000 or use the Vercel environment port
const port = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Endpoint to download audio (MP3) and video
app.post('/download', async (req, res) => {
  const { url } = req.body; // Expecting a YouTube link from the client

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).send('Invalid YouTube URL');
  }

  try {
    // Get video details
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title;

    // Return download links
    res.json({
      videoTitle,
      mp3DownloadUrl: `${siteUrl}/download/mp3?url=${encodeURIComponent(url)}`,
      videoDownloadUrl: `${siteUrl}/download/video?url=${encodeURIComponent(url)}`,
    });
  } catch (error) {
    console.error('Error fetching YouTube video:', error);
    res.status(500).send('Error processing the YouTube URL');
  }
});

// Endpoint to serve MP3 download
app.get('/download/mp3', (req, res) => {
  const { url } = req.query;
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).send('Invalid YouTube URL');
  }

  // Stream MP3 download
  res.header('Content-Disposition', 'attachment; filename="audio.mp3"');
  ytdl(url, {
    filter: 'audioonly',
    format: 'mp4', // Audio in MP4 container
  }).pipe(res);
});

// Endpoint to serve video download
app.get('/download/video', (req, res) => {
  const { url } = req.query;
  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).send('Invalid YouTube URL');
  }

  // Stream video download
  res.header('Content-Disposition', 'attachment; filename="video.mp4"');
  ytdl(url).pipe(res);
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on ${siteUrl}`);
});

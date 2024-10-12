import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import downloadsFolder from 'downloads-folder';
import ProgressBar from 'progress'; // For the progress bar

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON
app.use(express.json());

// Function to download the file with a progress bar
const downloadFile = async (url, downloadDir, format = '') => {
    try {
        // Get file extension from URL or format query
        const ext = url.match(/\.(\w+)(\?|$)/)[1];

        // Set file path in the system's default download directory
        const fileName = `downloaded_file${format ? `_${format}` : ''}.${ext}`;
        const filePath = path.join(downloadDir, fileName);

        // First, get the file size
        const headResponse = await axios.head(url);
        const totalSize = headResponse.headers['content-length'];

        if (!totalSize) {
            console.error('Could not determine file size.');
            return;
        }

        console.log(`File size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);

        // Make a GET request to download the file
        const response = await axios({
            url, // File URL
            method: 'GET',
            responseType: 'stream', // Stream the response
        });

        // Create a writable stream
        const writer = fs.createWriteStream(filePath);

        // Create a progress bar
        const progressBar = new ProgressBar('Downloading [:bar] :rate/bps :percent :etas', {
            width: 40,
            total: parseInt(totalSize),
            complete: '=',
            incomplete: ' ',
            renderThrottle: 1000
        });

        // Track the download progress
        response.data.on('data', (chunk) => {
            progressBar.tick(chunk.length);
        });

        // Pipe the response data into the writable stream
        response.data.pipe(writer);

        // Return a promise that resolves when the writing is finished
        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Error downloading the file:', error.message);
        throw error;
    }
};

// Route to preview and download the file with format options
app.get('/download', async (req, res) => {
    const url = req.query.url; // URL of the media to download
    const format = req.query.format; // Optional format (e.g., 480p, 720p)

    if (!url) {
        return res.status(400).send('Please provide a media URL.');
    }

    try {
        // Extract the file extension
        const ext = url.match(/\.(\w+)(\?|$)/)[1];

        // Determine media type based on extension
        const mediaType = ext === 'jpg' || ext === 'jpeg' || ext === 'png' ? 'image' : ext === 'mp4' ? 'video' : 'unknown';

        // Render an HTML page to preview the media
        res.send(`
      <h1>Preview the Media</h1>
      ${mediaType === 'image' ? `<img src="${url}" alt="Preview" width="500" />` : ''}
      ${mediaType === 'video' ? `<video width="500" controls><source src="${url}" type="video/mp4"></video>` : ''}
      <p>Select a format:</p>
      <ul>
        <li><a href="/trigger-download?url=${encodeURIComponent(url)}&format=480p">480p</a></li>
        <li><a href="/trigger-download?url=${encodeURIComponent(url)}&format=720p">720p</a></li>
        <li><a href="/trigger-download?url=${encodeURIComponent(url)}&format=1080p">1080p</a></li>
      </ul>
      <p><a href="/trigger-download?url=${encodeURIComponent(url)}&format=${format || ''}">Download the file</a></p>
    `);
    } catch (error) {
        res.status(500).send('Error rendering the preview.');
    }
});

// Route to trigger the download
app.get('/trigger-download', async (req, res) => {
    const url = req.query.url; // URL of the media to download
    const format = req.query.format || ''; // Optional format (e.g., 480p, 720p)

    if (!url) {
        return res.status(400).send('Please provide a media URL.');
    }

    try {
        // Get the system default download folder
        const downloadDir = downloadsFolder();

        // Download the file with the specified format
        await downloadFile(url, downloadDir, format);

        res.send('Download started! The file will be saved in your default download folder.');
    } catch (error) {
        res.status(500).send('Error downloading the file.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

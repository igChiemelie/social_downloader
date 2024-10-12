import express from 'express';
const router = express.Router();
const PORT = process.env.PORT || 5000;

import { igdl } from 'btch-downloader';
import { ttdl } from 'btch-downloader';
import { fbdown } from 'btch-downloader';
import { twitter } from 'btch-downloader';
import { youtube } from 'btch-downloader';



import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

import downloadsFolder from 'downloads-folder';
import ProgressBar from 'progress'; // For the progress bar

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Home route
router.get('/', async (req, res) => {
    // res.render('index', { title: 'Home Page' });
    let newDate = new Date().getFullYear();

    res.render('index', { message: 'Hello World', mediaTypes: '123', newDate:newDate, port: PORT });

    // res.write(`Hello World! Running on port ${PORT}`);
    // res.end();
    // res.send(`Hello World! Running on port ${PORT}`);
});

// let tempUrl = formUrl;
// // let data = await youtube(tempUrl);
// let data = await twitter(tempUrl);
// console.log(data);

router.post('/download', async (req, res) => {
    const formUrl = req.body.url;
    console.log(formUrl);

    // Declare the variable `tempUrl` once
    let tempUrl = formUrl;
    let data;

    // Check if the formUrl is valid
    if (!formUrl) {
        res.render('index', { error: 'Invalid URL' });
        return;
    }

    // Process based on the platform in the URL
    if (formUrl.startsWith("https://www.instagram.com/")) {
        data = await igdl(tempUrl);  // Fetch data using the Instagram downloader
        mapInstData(data);  // Map and process Instagram data

    } else if (formUrl.startsWith("https://www.tiktok.com/") || formUrl.startsWith("https://tiktok.com/")) {
        data = await ttdl(tempUrl);  // Fetch data using the TikTok downloader
        console.log(data);  // Log TikTok data (you can map it as needed)
        mapTData(data);  // Log TikTok data (you can map it as needed)

    } else if (formUrl.startsWith("https://www.facebook.com/")) {
        data = await fbdown(tempUrl);  // Fetch data using the Facebook downloader
        mapFacebookData(data);  // Map and process Facebook media data

    } else if (formUrl.startsWith("https://x.com/") || formUrl.startsWith("https://www.x.com/")) {
        data = await twitter(tempUrl);  // Fetch data using the X/Twitter downloader
        // console.log(data.url);  // Log Twitter data (you can map it as needed)
        mapXData(data); 

    } else if (formUrl.startsWith("https://www.youtu.be/") || formUrl.startsWith("https://www.youtube.com/") || formUrl.startsWith("https://youtu.be/") || formUrl.startsWith("https://youtube.com/")) {
        data = await youtube(tempUrl);  // Fetch data using the YouTube downloader
        console.log(data);  // Log YouTube data (you can map it as needed)

    } else {
        // Handle unsupported URLs
        res.render('index', { error: 'Unsupported URL format' });
    }


    // Map through the array
    function mapInstData(data) {
        // console.log(data);

        // const mappedData = data.map(item => {
        let mappedData = Array.isArray(data) ? data.map(item => {
            // Extract the extension from the URL
            let mapUrl = item.url;
            // console.log(item);
            console.log(mapUrl);

           const url = mapUrl;
           // Extract the filename from the URL's 'token' parameter
           const urlParams = new URLSearchParams(url.split('?')[1]);
           const tokenParam = urlParams.get('token');
           
           // Decode the token to access the filename
           const tokenDecoded = atob(tokenParam.split('.')[1]); // Base64 decode the token
           const tokenJson = JSON.parse(tokenDecoded);
           
           // Extract the filename
           const filename = tokenJson.filename;
           
           // Extract file extension from the filename
           const ext = filename.split('.').pop(); // Extract the part after the last dot (file extension)
           
           // Determine media type and format based on extension
           let mediaType, format;
           
           if (ext === 'mp4') {
               mediaType = 'video';
               format = 'MP4';
           } else {
               mediaType = 'unknown';
               format = 'unknown';
           }
           
           // Output the extracted values
           console.log('ext:', ext);
           console.log('Media Type:', mediaType);
           console.log('Format:', format);
           
    
            try {

                // Assuming `format` is a query parameter and should be handled here
                let format = req.query.format || ''; // Default to empty string if not provided

                res.send(`
                        <h1>Preview the Media</h1>
                
                        ${mediaType === 'video' ? `<video width="200" poster="${item.thumbnail}" controls><source src="${mapUrl}" type="video/mp4"></video>` : ''}
                        <p>Select a format:</p>
                        <ul>
                            <li><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=480p">480p</a></li>
                            <li><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=720p">720p</a></li>
                            <li><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=1080p">1080p</a></li>
                        </ul>
                        <p><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=${format || ''}">Download the file</a></p>
                    `);
    
            } catch (error) {
                res.status(500).send('Error rendering the preview.');
                console.error('Error processing the download request:', error);
                
            }
        }) : [];
        
    }


    function mapTData(data) {
        // Extracting the video array
        const videoArray = data.video;
        const thumbnailUrl = data.thumbnail; // Extracting thumbnail URL
    
        // Check if the video array exists and has items
        if (videoArray && videoArray.length > 0) {
            let responseHtml = '<h1>Preview the Media</h1>'; // Initialize the HTML to accumulate the output

            // Iterate through the data, but only render one video
            let rendered = false; // Flag to check if the video has been rendered

            // Return the video URLs along with thumbnail
            videoArray.map(url => {
                const extMatch = url.match(/\.(\w+)(\?|$)/);
                const ext = extMatch ? extMatch[1] : 'unknown';
                let mapUrl = url;
                let thumbnail = thumbnailUrl;

                
                // return {
                //     videoUrl: url,
                //     thumbnail: thumbnailUrl,  // Add the thumbnail to the result
                //     mediaType: 'video',
                //     ext: ext,
                //     format: 'mp4' // Assuming the format is 'mp4' based on the extension
                // };


                try {
                    // Check if req and req.query are defined
                    let format = req && req.query ? req.query.format : ''; // Default to empty string if not provided
                
                    // Accumulate the response HTML
                    responseHtml += `
                                    
                        ${ext === 'mp4' ? `<video width="200" poster="${thumbnail}" controls><source src="${mapUrl}" type="video/mp4"></video>` : ''}
                        <p>Select a format:</p>
                        <ul>
                            <li><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=480p">480p</a></li>
                            <li><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=720p">720p</a></li>
                            <li><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=1080p">1080p</a></li>
                        </ul>
                        <p><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=${format || ''}">Download the file</a></p>
                    `;
                    rendered = true; // Set the flag to true after rendering the first video
                } catch (error) {
                    console.log('Error processing the download request:', error);
                }
            });

            // Send the accumulated response once after the loop finishes
            res.send(responseHtml);
        } else {
            return []; // Return an empty array if no video data exists
        }

        console.log(videoArray);

        

    }
    
    
    function mapXData(data) {
        let responseHtml = '<h1>Preview the Media</h1>'; // Initialize the HTML to accumulate the output

        // Iterate through the data, but only render one video
        let rendered = false; // Flag to check if the video has been rendered

        // Loop through the array using forEach
        data.url.forEach(data => {
            if (data.hd) {
                // hdUrls.push(video.hd); // Add HD URL to the array
                const mapUrl = data.hd;
              
                // Extract the extension from the URL
                const extMatch = mapUrl.match(/\.(\w+)(\?|$)/);
                const ext = extMatch ? extMatch[1] : 'unknown';

                // Determine media type based on extension
                let mediaType = ext === 'jpg' || ext === 'jpeg' || ext === 'png' ? 'image' : ext === 'mp4' ? 'video' : 'unknown';
        
                try {
                    // Check if req and req.query are defined
                    let format = req && req.query ? req.query.format : ''; // Default to empty string if not provided

                    // Accumulate the response HTML
                    responseHtml += `
                    
                        ${mediaType === 'video' ? `<video width="200" controls><source src="${mapUrl}" type="video/mp4"></video>` : ''}
                        <p>Select a format:</p>
                        <ul>
                            <li><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=480p">480p</a></li>
                            <li><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=720p">720p</a></li>
                            <li><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=1080p">1080p</a></li>
                        </ul>
                        <p><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=${format || ''}">Download the file</a></p>
                    `;
                    rendered = true; // Set the flag to true after rendering the first video
                } catch (error) {
                    console.log('Error processing the download request:', error);
                }
            }

        });

        // Send the accumulated response once after the loop finishes
        res.send(responseHtml);
    }
    

    function mapFacebookData(data) {
        let responseHtml = '<h1>Preview the Media</h1>'; // Initialize the HTML to accumulate the output

        // Iterate through the data, but only render one video
        let rendered = false; // Flag to check if the video has been rendered

        // Ensure data is an object before iterating
        Object.keys(data).forEach(key => {
            if (rendered) return; // Stop rendering after the first video

            let mapUrl = data[key];
            console.log(mapUrl);
            console.log('seen');
            

            // Extract the extension from the URL
            let extMatch = mapUrl.match(/\.(\w+)(\?|$)/);
            let ext = extMatch ? extMatch[1] : 'unknown';

            // Determine media type based on extension
            let mediaType = ext === 'jpg' || ext === 'jpeg' || ext === 'png' ? 'image' : ext === 'mp4' ? 'video' : 'unknown';

            try {
                // Check if req and req.query are defined
                let format = req && req.query ? req.query.format : ''; // Default to empty string if not provided

                // Accumulate the response HTML
                responseHtml += `
                
                    ${mediaType === 'video' ? `<video width="200" controls><source src="${mapUrl}" type="video/mp4"></video>` : ''}
                    <p>Select a format:</p>
                    <ul>
                        <li><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=480p">480p</a></li>
                        <li><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=720p">720p</a></li>
                        <li><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=1080p">1080p</a></li>
                    </ul>
                    <p><a href="/trigger-download?url=${encodeURIComponent(mapUrl)}&format=${format || ''}">Download the file</a></p>
                `;
                rendered = true; // Set the flag to true after rendering the first video
            } catch (error) {
                console.log('Error processing the download request:', error);
            }
        });

        // Send the accumulated response once after the loop finishes
        res.send(responseHtml);
    }

});

// Route to trigger the download
router.get('/trigger-download', async (req, res) => {
    const url = req.query.url; // URL of the media to download
    const format = req.query.format || ''; // Optional format (e.g., 480p, 720p)

    console.log({ url, format });

    if (!url) {
        return res.status(400).send('Please provide a media URL.');
    }

    try {
        console.log('Starting download process...');

        // Manually specify a download directory
        // const downloadDir = path.join(__dirname, 'downloads');
        const downloadDir = path.join(os.homedir(), 'Downloads');

        // Create the directory if it doesn't exist
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }

        console.log('Download directory:', downloadDir);

        // Call the downloadFile function, passing in the download directory
        await downloadFile(url, downloadDir, format);
        // res.send('Download started! The file will be saved in your "downloads" folder.');
        // Send a message that download has started and include the client-side redirect logic
        // Send a message using alert and include the client-side redirect logic
        res.send(`
            <html>
            <head>
                <title>Download Started</title>
                <script>
                    // Alert the user that the download has started
                    alert('Download started! The file is being downloaded to your "downloads" folder.');

                    // Redirect to home after 6 seconds
                    window.location.href = '/?status=success';
                    // setTimeout(function() {
                    // }, 6000);
                </script>
            </head>
            <body>
                <!-- Optionally, you can include a loading spinner or message here -->
            </body>
            </html>
        `);
        // Redirect to home with success status
        // res.redirect('/?status=success');
    } catch (error) {
        console.error('Error during download:', error.message);
        res.status(500).send(`Error downloading the file: ${error.message}`);
    }
});

const downloadFile = async (url, downloadDir, format = '') => {
    try {
        console.log(`Downloading from URL: ${url}`);

        let fileName, ext;

        // Check if the URL has a token parameter or not
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const tokenParam = urlParams.get('token');

        if (tokenParam) {
            // If there's a token, decode the token and extract the filename
            const tokenDecoded = atob(tokenParam.split('.')[1]); // Base64 decode the token
            const tokenJson = JSON.parse(tokenDecoded);

            if (!tokenJson.filename) {
                throw new Error('Filename not found in token.');
            }

            fileName = tokenJson.filename;
            ext = fileName.split('.').pop(); // Extract extension from token filename
        } else {
            // If no token, extract the file extension directly from the URL
            const urlPath = url.split('?')[0]; // Get the path without the query string
            ext = urlPath.split('.').pop(); // Extract the file extension from the URL
            fileName = `downloaded_file${format ? `_${format}` : ''}.${ext}`;
        }

        const filePath = path.join(downloadDir, fileName); // Create file path for saving
        console.log(`File will be saved as: ${fileName}`);

        // Perform a HEAD request to get file size and content type
        const headResponse = await axios.head(url);
        const totalSize = headResponse.headers['content-length'];
        const contentType = headResponse.headers['content-type'];

        console.log(`Content-Type: ${contentType}`);
        console.log(`File size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);

        // Allow application/octet-stream if the file extension is valid
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm', 'mkv'];
        const isValidMediaType = contentType.startsWith('image/') || contentType.startsWith('video/') || 
                                 (contentType === 'application/octet-stream' && validExtensions.includes(ext));

        if (!isValidMediaType) {
            throw new Error('The URL does not point to a valid image or video file.');
        }
 

        // Download the file
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream', // Stream the file
        });

        console.log('Response Status:', response.status);

        if (response.status !== 200) {
            throw new Error(`Failed to download file. HTTP status code: ${response.status}`);
        }

        // Create a write stream for the file
        const writer = fs.createWriteStream(filePath);
        console.log('Writing file to:', filePath);

        // Create a progress bar
        const progressBar = new ProgressBar('Downloading [:bar] :rate/bps :percent :etas', {
            width: 40,
            total: parseInt(totalSize),
            complete: '=',
            incomplete: ' ',
            renderThrottle: 1000,
        });

        // Update the progress bar as the file is being downloaded
        response.data.on('data', (chunk) => {
            progressBar.tick(chunk.length);
        });

        // Pipe the response data into the write stream
        response.data.pipe(writer);

        // Return a promise that resolves when the download is complete
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                console.log('File downloaded successfully!');
                resolve();
                
            });
            writer.on('error', (err) => {
                console.error('File write error:', err.message);
                reject(err);
            });
        });

        

    } catch (error) {
        console.error('Error downloading the file:', error.message);
        throw error;
    }
};

export default router;

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
        // https://vm.tiktok.com/ZMhUm551w/
    } else if (formUrl.startsWith("https://www.tiktok.com/") || formUrl.startsWith("https://tiktok.com/") || formUrl.startsWith("https://vm.tiktok.com/")) {
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

        // Call the downloadFile function, but stream the file directly to the client
        // await downloadFile(req, res);
        // await redirect(req, res);
        const downloadSuccess = await downloadFile(req, res); // Wait for the download to finish

        if (downloadSuccess) {
            // Only redirect if the download was successful
            // res.redirect('/?status=success');
            console.log('redirect to a new page');
            // await redirect(req, res);

            
            // Adjust this path as needed
        }

        // You can remove the client-side redirect logic since the file will be downloaded directly
        // After download is complete, redirect to the completion route
        // res.redirect('/download-complete'); // This will trigger the client-side notification after the download.
    } catch (error) {
        console.error('Error during download:', error.message);
        res.status(500).send(`Error downloading the file: ${error.message}`);
    }
});



const downloadFile = async (req, res) => {
    const url = req.query.url; // URL is passed as a query parameter
    const format = req.query.format || ''; // Optional format parameter

    try {
        console.log(`Downloading from URL: ${url}`);

        let fileName, ext;

        // Check if the URL has a token parameter or not
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const tokenParam = urlParams.get('token');

        if (tokenParam) {
            // Decode token to get the filename
            const tokenDecoded = Buffer.from(tokenParam.split('.')[1], 'base64').toString();
            const tokenJson = JSON.parse(tokenDecoded);

            if (!tokenJson.filename) {
                throw new Error('Filename not found in token.');
            }

            fileName = tokenJson.filename;
            ext = fileName.split('.').pop(); // Extract extension
        } else {
            const urlPath = url.split('?')[0];
            ext = urlPath.split('.').pop(); // Extract extension from URL
            fileName = `downloaded_file${format ? `_${format}` : ''}.${ext}`;
        }

        console.log(`File will be served as: ${fileName}`);

        // Perform a HEAD request to get file size and content type
        const headResponse = await axios.head(url);
        const totalSize = headResponse.headers['content-length'];
        const contentType = headResponse.headers['content-type'];

        console.log(`Content-Type: ${contentType}`);
        console.log(`File size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);

        // Validate content type (image/video)
        const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm', 'mkv'];
        const isValidMediaType = contentType.startsWith('image/') || contentType.startsWith('video/') || 
                                 (contentType === 'application/octet-stream' && validExtensions.includes(ext));

        if (!isValidMediaType) {
            throw new Error('The URL does not point to a valid image or video file.');
        }

        // Set the headers to force browser download
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', contentType);

        // Download the file and stream it directly to the browser
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream', // Stream the file
        });

        console.log('Response Status:', response.status);

        if (response.status !== 200) {
            throw new Error(`Failed to download file. HTTP status code: ${response.status}`);
        }

        // Create a progress bar
        const progressBar = new ProgressBar('Downloading [:bar] :rate/bps :percent :etas', {
            width: 40,
            total: parseInt(totalSize),
            complete: '=',
            incomplete: ' ',
            renderThrottle: 1000,
        });

        // Update progress bar as the file is being downloaded
        response.data.on('data', (chunk) => {
            progressBar.tick(chunk.length);
        });

        // Pipe the response data into the client's browser
        response.data.pipe(res);

        response.data.on('end', () => {
            console.log('File served to client successfully!');

        });

        return new Promise((resolve) => {
            // Resolve the promise when the response is finished
            res.on('finish', () => {
                resolve(true);
            });
        });

    } catch (error) {
        console.error('Error downloading the file:', error.message);
        res.status(500).send('Error downloading the file.');
    }
};

// const redirect = async (req, res) => {
//     res.redirect('/?status=success');

// }


export default router;

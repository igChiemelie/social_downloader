import express from 'express';
const router = express.Router();
const PORT = process.env.PORT || 5000;

import Downlib from 'downlib';
import {igdl} from 'btch-downloader';


// // Initialize Downlib with optional configurations
const downlib = new Downlib({
    ytDlpPath: '', // Optional: Specify the path for yt-dlp if needed
    deleteAfterDownload: true,
});


// Home route
router.get('/', (req, res) => {
    // res.render('index', { title: 'Home Page' });
    res.render('index', { message: 'Hello World', port: PORT });
    
    // res.write(`Hello World! Running on port ${PORT}`);
    // res.end();
    // res.send(`Hello World! Running on port ${PORT}`);
});

router.post('/download', async(req, res) => {
    console.log('here');
    const url = req.body.url;

    console.log(url);
    

    // if (!url || !url.startsWith("https://www.instagram.com/")) {
    //     res.render('index', { error: 'invalidURL' });
    //     return;
    // }


    // Example: Determine the type of a URL
    // const urlToCheck = url;
    // const urlType = downlib.checkUrlType(urlToCheck);
    // console.log(`URL '${urlToCheck}' is of type '${urlType}'.`);

    
    // Example: Download media from Instagram
    // const instagramUrl = 'https://www.instagram.com/p/yourpostid/';
    // Example: Download a video from YouTube
    // const youtubeUrl = 'https://www.youtube.com/watch?v=yourvideoid';

    const youtubeUrl = url;
    const saveDir = './downloads';
    downlib.downloadFromYouTube(youtubeUrl, saveDir, { audioOnly: false })
        .then((result) => {
            console.log('Downloaded video information:', result);
        })
        .catch((error) => {
            console.error('Error downloading video:', error);
        });

    // instaAPI(url).then((response) => {
    //     console.log(response);
    //     if (response.url[0].ext == "mp4") {
    //         downloadFile(res, response.url[0].url, "mp4")
    //     } else {
    //         downloadFile(res, response.url[0].url, "jpg")
            
    //     }
    // })

});


function downloadFile(res, url, ext) {
    express.request(url, { encoding: null }, (error, response, body)=> {
        if (error || response.statusCode !== 200) {
            res.status(400).send("Error downloading file");
            return
        }

        const fileName = Date.now() + "." + ext;
        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.send(body);
    })
}

export default router;

import express from 'express';
import dotenv from 'dotenv';
import mustacheExpress from 'mustache-express';

import bodyParser from 'body-parser';

const app = express();

import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
dotenv.config();

// Middleware Initialization
app.use(express.json()); // Parse JSON data
app.use(bodyParser.json()); // Parse form data and JSON
app.use(bodyParser.urlencoded({ extended: true })); // Handle URL-encoded data

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Setup Mustache as Template Engine
app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views')); // Define the views directory


// Import and use home route
import homeRoute from './routes/home.js'; // Ensure to use .js extension
app.use('/', homeRoute);

//404 page
app.use((req, res, next)=>{
    res.status(404).render('404');
    // res.redirect('/404');
    // res.render('404');


});
app.get('/404', (req, res)=>{
    // res.send('404 Not Found');
    // res.render('404');

})

let date = new Date().toLocaleString(); 
// Server configuration and startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} at ${date}`);
});

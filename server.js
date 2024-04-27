const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a route to serve images
app.get('/getImages', (req, res) => {
    const imagesFolderPath = path.join(__dirname, 'allphunks'); // Path to the images folder
    const images = [];

    // Read the contents of the images folder
    fs.readdir(imagesFolderPath, (err, files) => {
        if (err) {
            console.error('Error reading images folder:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }

        // Filter out files that are not PNG images
        const imageFiles = files.filter(file => file.startsWith('phunk_') && file.endsWith('.png'));

        // Construct the image data array
        imageFiles.forEach((file, index) => {
            images.push({
                src: `/images/${file}`, // Relative path to the image
                number: parseInt(file.match(/\d+/)[0]) // Extract the number from the filename
            });
        });

        // Send the image data array as JSON response
        res.json(images);
    });
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

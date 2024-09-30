const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const port = 5005;

app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(cors());

// Valid MIME types and their corresponding extensions
const validMimeTypes = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/webp': 'webp',
    'image/heif': 'heif',
    'image/heic': 'heic',
    'image/tiff': 'tiff',
    'image/svg+xml': 'svg'
  };
// Middleware to parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({limit: '10mb'}));// Middleware to serve static files
app.use('/uploads', express.static('uploads'));

// Route to upload image
app.post('/upload', (req, res) => {
  try{
    console.log('Request received');
    const { base64String } = req.body;
    if (!base64String) {
      return res.status(400).send({ message: 'No image uploaded' });
    }
    // Extract Base64 data and MIME type from the image string
    const matches = base64String.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      console.log('Invalid image format');
      return res.status(400).send({ message: 'Invalid image format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];

    // Check if the MIME type is valid
    if (!validMimeTypes[mimeType]) {
      console.log('Invalid file type');
      return res.status(400).send({ message: 'Invalid file type' });
    }

    const ext = validMimeTypes[mimeType];

    // Generate a random file name
    const randomName = crypto.randomBytes(16).toString('hex');
    const filename = `${randomName}.${ext}`;
    const filePath = path.join(__dirname, 'uploads', filename);

    // Write the file to the uploads folder
    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        console.log('Error saving file', err);
        return res.status(500).send({ message: 'Error saving file', error: err });
      }
      res.send({ message: 'Image uploaded successfully', url: `https://imageserver.tapdadoge.app/uploads/${filename }`});
    });
  }
  catch(error){
    console.log('Internal Server Error', error);
    res.status(500).send({ message: 'Internal Server Error', error: error.message });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucketName = 'image-server-bucket';

const app = express();
const port = 5005;

app.use(morgan('combined'));
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
app.use(bodyParser.urlencoded({ extended: true })); // Cập nhật tùy chọn extended
// Middleware to serve static files
app.use('/uploads', express.static('uploads'));

// Route to upload image
app.post('/upload', async (req, res) => { // Thay đổi thành async
  try {
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

    // Thay đổi phần ghi file
    const file = storage.bucket(bucketName).file(filename);
    await file.save(Buffer.from(base64Data, 'base64'), {
      metadata: { contentType: mimeType },
    });

    res.send({ message: 'Image uploaded successfully', url: `https://storage.googleapis.com/${bucketName}/${filename}` }); // Thay đổi dòng này
  } catch (error) {
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

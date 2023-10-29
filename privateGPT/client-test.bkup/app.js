uploadPath="/root/privateGPT/server/source_documents/"
/***************************************************/
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

const app = express();
const port = 3000;
const baseHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
/***************************************************/
// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
/***************************************************/
app.use(express.static('public')); // To serve the HTML form
/***************************************************/
app.get('/', (req, res) => {
    fs.readdir(uploadPath, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading directory: ' + err);
        }

        let fileList = files.map(file => `<li>${file}</li>`).join('\n');
        let ingestButton = (files.length > 0) ? '<button>Ingest</button>' : '';
        let dynamicHtml = baseHtml.replace('<!-- When a file is uploaded, the server will also provide feedback here -->', `${ingestButton}<h4>Files in directory:</h4>\n<ul>\n${fileList}\n</ul>`);
        res.send(dynamicHtml);
    });
});
/***************************************************/
app.post('/', upload.single('file'), (req, res) => {
    fs.readdir(uploadPath, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading directory: ' + err);
        }

        let fileList = files.map(file => `<li>${file}</li>`).join('\n');
        let ingestButton = (files.length > 0) 
            ? '<form action="/" method="post"><button type="submit" value="ingest">Ingest</button></form>'
            : '';
        
        // Check which button was pressed
        if (req.body.action === 'ingest') {
            // Execute the shell command
            const commandToRun = 'echo "Hello from the shell command!"';
            exec(commandToRun, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return res.status(500).send(`Error executing command: ${error}`);
                }

                // Inject the output into the HTML and send it back
                let dynamicHtml = baseHtml.replace('<!-- When a file is uploaded, the server will also provide feedback here -->', `<div>${stdout}</div>\n${ingestButton}<h4>Files in directory:</h4>\n<ul>\n${fileList}\n</ul>`);
                res.send(dynamicHtml);
            });
        } else {
            // Handle file upload and display the page again
            let dynamicHtml = baseHtml.replace('<!-- When a file is uploaded, the server will also provide feedback here -->', `<h3>File uploaded successfully!</h3>\n${ingestButton}<h4>Files in directory:</h4>\n<ul>\n${fileList}\n</ul>`);
            res.send(dynamicHtml);
        }
    });
});
/***************************************************/

/***************************************************/
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
/***************************************************/

const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;
const uploadPath = "/root/privateGPT/server/source_documents/"
//const uploadPath = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    const formHTML = `
        <link rel="stylesheet" href="/xterm.css" />
        <script src="/xterm.js"></script>
        <script src="/socket.io/socket.io.js"></script>
        <h3>Upload Files:</h3>
        <form ref='uploadForm' action='/' method='post' encType="multipart/form-data">
            <input type="file" name="file" />
            <input type='submit' value='Upload!' />
        </form>
        <div id="fileList">
            ${fs.readdirSync(uploadPath).map(file => `<li>${file}</li>`).join('')}
        </div>

        <h3>Execute Shell Command:</h3>
        <div id="terminal"></div>
        <script>
            const term = new Terminal();
            const socket = io.connect();
            
            term.open(document.getElementById('terminal'));
            
            socket.on('output', function(data) {
                term.write(data);
            });
            
            term.onData(data => socket.emit('input', data));
        </script>
    `;

    res.send(formHTML);
});

app.post('/', upload.single('file'), (req, res) => {
    res.redirect('/');
});

io.on('connection', function(socket) {
    const shell = exec('/bin/bash', [], {
        cwd: process.cwd()
    });

    shell.stdout.on('data', function(data) {
        socket.emit('output', data);
    });

    shell.stderr.on('data', function(data) {
        socket.emit('output', data);
    });

    socket.on('input', function(data) {
        shell.stdin.write(data);
    });
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

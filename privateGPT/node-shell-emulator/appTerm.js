const express = require('express');
const { exec } = require('child_process');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    socket.on('execute', (command) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                socket.emit('output', `Error: ${error.message}`);
                return;
            }
            if (stderr) {
                socket.emit('output', `Stderr: ${stderr}`);
                return;
            }
            socket.emit('output', stdout);
        });
    });
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

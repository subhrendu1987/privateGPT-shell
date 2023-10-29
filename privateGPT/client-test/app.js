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
const uploadPath = '/root/privateGPT/server/source_documents';

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
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));


app.get('/terminal', (req, res) => {
    res.sendFile(__dirname + '/public/terminal.html');
});

const { spawn } = require('child_process');

let shell;

io.on('connection', (socket) => {
    const shell = spawn('/bin/bash');

    // Handle output from the shell
    shell.stdout.on('data', (data) => {
        socket.emit('output', data.toString());
    });

    shell.stderr.on('data', (data) => {
        socket.emit('output', data.toString());
    });

    shell.on('close', (code) => {
        socket.emit('output', `child process exited with code ${code}`);
    });

    socket.on('execute', (command) => {
        shell.stdin.write(command + "\n");
        socket.emit('prompt', '> ');  // Send the prompt after executing the command
    });

    socket.on('disconnect', () => {
        shell.kill();  // Close the shell when the client disconnects
    });
});


app.get('/', (req, res) => {
    const filesList = fs.readdirSync(uploadPath).map(file => `<li>${file}</li>`).join('');
    const html = `
        <head>
        <title> privateGPT </title>
        <!--link rel="stylesheet" href="/node_modules/xterm/css/xterm.css" /-->
        <link rel="stylesheet" href="/xterm.css" />

        <style>
            #output {
                font-family: 'Courier New', Courier, monospace;
                background-color: #111;
                color: #33FF33;
                padding: 10px;
                border-radius: 5px;
                width: 100%;
                height: 300px;
                overflow-y: auto;
                box-shadow: 0 0 10px rgba(0,0,0,0.2);
            }

          .resizable {
            position: relative;
          }

          .resizable::after {
            content: "";
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            width: 5px;
            cursor: ew-resize;
            background: linear-gradient(to right, transparent, rgba(0,0,0,0.2), transparent);
          }
        </style>

        <script src="/node_modules/xterm/lib/xterm.js"></script>
        <script src="/socket.io/socket.io.js"></script>
        <script src="/node_modules/interactjs/dist/interact.min.js"></script>
        </head>
        <body>
        <center>
            <h1> Private GPT</h1>
            <h3> - Powered by NIL@IDRBT </h2>
        </center>
        <hr>
        <div style="display: flex; height: 100vh;">
            <div class="resizable" style="flex: 1; padding: 20px; overflow: auto;">
                <h3>Files:</h3>
                <ul>${filesList}</ul>
                <h4>Upload a File:</h4>
                <form ref='uploadForm' action='/' method='post' encType="multipart/form-data">
                    <input type="file" name="file" />
                    <input type='submit' value='Upload!' />
                </form>
            </div>
            <div style="flex: 2; border: 1px solid #ccc; padding: 20px;">
                <h2> Instructions <h2>
                <ol>
                    <li> cd /root/privateGPT/server</li> 

                </ol>
            </div>
            <div style="flex: 2; border: 1px solid #ccc; padding: 20px;">
                <!--h2> Use Terminal </h2-->
                <!--div id="terminal"></div-->
                <iframe src="/terminal" width="600" height="400"></iframe>
            </div>
        </div>

        <script>
            const term = new Terminal();
            const socket = io.connect();

            term.open(document.getElementById('terminal'));
            socket.on('connect', () => {
                console.log('Connected to the server via socket.io');
            });
            socket.on('output', function(data) {
                console.log('output:');
                term.write(data);
            });

            term.onData(data => socket.emit('input', data));
        </script>
        </body>
    `;

    res.send(html);
});

app.post('/', upload.single('file'), (req, res) => {
    res.redirect('/');
});


app.get('/ingest', (req, res) => {
    persist_directory = os.environ.get('PERSIST_DIRECTORY')
    source_directory = os.environ.get('SOURCE_DIRECTORY', 'source_documents')
    embeddings_model_name = os.environ.get('EMBEDDINGS_MODEL_NAME')

    print(f"Loading documents from {source_directory}")
    chunk_size = 500
    chunk_overlap = 50
    documents = load_documents(source_directory)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    texts = text_splitter.split_documents(documents)
    print(f"Loaded {len(documents)} documents from {source_directory}")
    print(f"Split into {len(texts)} chunks of text (max. {chunk_size} characters each)")

    # Create embeddings
    embeddings = HuggingFaceEmbeddings(model_name=embeddings_model_name)
    
    # Create and store locally vectorstore
    db = Chroma.from_documents(texts, embeddings, persist_directory=persist_directory, client_settings=CHROMA_SETTINGS)
    db.persist()
    db = None
    return jsonify(response="Success")

io.on('connection', function(socket) {
    //console.log('Client connected via socket.io');
    
    //const shell = exec('/bin/bash', [], {
    //    cwd: process.cwd()
    //});

    const shell = exec('/bin/bash', {
        cwd: process.cwd()
    });

    shell.on('error', (error) => {
        console.error('Shell error:', error);
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

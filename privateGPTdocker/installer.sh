#!/bin/sh

#!/bin/bash

REPO_URL="https://github.com/imartinez/privateGPT"
TARGET_DIR="privateGPT"

# Attempt to clone the repository
git clone "$REPO_URL" "$TARGET_DIR"

# Check the status of the clone operation
if [ $? -ne 0 ]; then
    echo "Clone failed, checking if the directory exists..."
    if [ -d "$TARGET_DIR/.git" ]; then
        echo "Directory exists and seems to be a Git repo, pulling latest changes..."
        cd "$TARGET_DIR"
        git pull
    else
        echo "Directory exists but is not a Git repo or another error occurred."
    fi
else
    echo "Repository cloned successfully."
fi

cd privateGPT && pip install -r requirements.txt --break-system-packages --user --no-warn-script-location && su -c '

GPT4ALL="curl -LO https://gpt4all.io/models/ggml-gpt4all-j-v1.3-groovy.bin"
ENV="curl -LO https://raw.githubusercontent.com/MichaelSebero/PrivateGPT4Linux/main/.env"

mkdir ./models && cd ./models && eval "$GPT4ALL" && cd ./privateGPT && eval "$ENV" && chmod 777 ./privateGPT/.env && rm ./privateGPT/source_documents/state_of_the_union.txt && chmod 777 ./models -R'

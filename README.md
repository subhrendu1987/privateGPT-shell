# privateGPT Docker
## Initialization
### Build
```
sudo docker build . -t privategpt:latest
mkdir -p source_documents; mkdir -p models; 
```
### Download GPT model
`mkdir -p models; wget https://gpt4all.io/models/ggml-gpt4all-j-v1.3-groovy.bin -O models/ggml-gpt4all-j-v1.3-groovy.bin`

## Execution

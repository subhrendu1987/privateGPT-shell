# sudo docker build . -t privategpt:latest
#FROM rattydave/privategpt
FROM python:3.11

# Copy the installer.sh file from your host to the container's root directory
COPY installer.sh /installer.sh

# Give execute permissions and then run installer.sh
RUN apt-get update && apt-get install git && mkdir -p /root/privateGPT
RUN git clone https://github.com/imartinez/privateGPT /root/privateGPT
RUN apt-get update && apt-get install nano
RUN pip install langchain==0.0.274
RUN pip install gpt4all==1.0.8
RUN pip install chromadb==0.4.12
RUN pip install llama-cpp-python==0.1.81
RUN pip install urllib3==2.0.4
RUN pip install PyMuPDF==1.23.1
RUN pip install python-dotenv==1.0.0
RUN pip install unstructured==0.10.8
RUN pip install extract-msg==0.45.0
RUN pip install tabulate==0.9.0
RUN pip install pandoc==2.3
RUN pip install pypandoc==1.11
RUN pip install tqdm==4.66.1
RUN pip install sentence_transformers==2.2.2
RUN cd /root/privateGPT && pip install -r requirements.txt --break-system-packages --user --no-warn-script-location
#RUN GPT4ALL="curl -LO https://gpt4all.io/models/ggml-gpt4all-j-v1.3-groovy.bin"
#RUN ENV="curl -LO https://raw.githubusercontent.com/MichaelSebero/PrivateGPT4Linux/main/.env"



#RUN npm install -g express multer body-parser xterm socket.io interactjs
# mkdir /root/privateGPT/models && cd /root/privateGPT/models && eval "$GPT4ALL" && cd ./privateGPT && eval "$ENV" && chmod 777 /root/privateGPT/.env && rm /root/privateGPT/source_documents/state_of_the_union.txt && chmod 777 /root/privateGPT/models -R'

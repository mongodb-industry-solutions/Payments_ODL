<<<<<<< HEAD
FROM node:20  
WORKDIR /app  
COPY package*.json ./  
COPY mongo_crypt_shared_v1-macos-arm64-enterprise-7.0.11/lib/mongo_crypt_v1.dylib ./lib  
ENV SHARED_LIB_PATH=/app/lib/mongo_crypt_v1.dylib
RUN npm install 
COPY . .    
=======
FROM node:20.10.0

WORKDIR /app
RUN apt-get update && apt-get install -y libssl-dev
COPY package*.json ./
RUN npm ci
COPY .env .env
COPY /lib/mongo_crypt_v1.so /app/lib/mongo_crypt_v1.so
COPY . .
>>>>>>> 1ece484 (Fix to make CSFLE work on Docker and minor changes)
EXPOSE 3030
CMD ["node", "server.js"]
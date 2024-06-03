FROM node:20  
WORKDIR /app  
COPY package*.json ./  
COPY mongo_crypt_shared_v1-macos-arm64-enterprise-7.0.11/lib/mongo_crypt_v1.dylib ./lib  
ENV SHARED_LIB_PATH=/app/lib/mongo_crypt_v1.dylib
RUN npm install 
COPY . .    
EXPOSE 3030
CMD ["node", "server.js"]
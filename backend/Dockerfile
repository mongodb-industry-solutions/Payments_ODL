FROM node:20.10.0
WORKDIR /app
RUN apt-get update && apt-get install -y libssl-dev
COPY package*.json ./
RUN npm ci
COPY .env .env
COPY /lib/mongo_crypt_v1.so /app/lib/mongo_crypt_v1.so
COPY . .
EXPOSE 3030
CMD ["node", "server.js"]
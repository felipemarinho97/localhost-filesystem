from node:lts-slim

expose 9010
workdir /app

copy . /app

run npm install

cmd ["node","index.js"]
FROM node:20-alpine
RUN npm config set registry https://registry.npmmirror.com
WORKDIR /home/node/app

COPY package.json .
COPY package-lock.json .
RUN npm install

COPY tsconfig.json .
COPY src .
RUN npm run build-only

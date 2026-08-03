FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]

# Versi Node terbaru
FROM node:22-alpine

RUN apk add --no-node-cache libc6-compat

WORKDIR /app

# Copas semua package dan prisma orm
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Copas semua src
COPY . .

RUN npm run build

RUN npm run start

ENV PORT=8000
EXPOSE 8000

CMD [ "npm", "start" ]
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 5000

ENV NODE_ENV=production

CMD ["npm", "run", "render:start"]

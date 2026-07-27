FROM node:24-alpine

EXPOSE 8080

ENV NODE_ENV=production
ENV NODE_PORT=8080
ENV TZ=utc

WORKDIR /app

COPY mcp/package.json /app/mcp/
COPY package.json /app
COPY package-lock.json /app

RUN npm install --production --no-optional

COPY mcp/dist /app/mcp/dist

CMD [ "node", "/app/mcp/dist/http-main.js" ]

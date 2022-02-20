FROM node:16-alpine

EXPOSE 8080

ENV NODE_ENV production
ENV PORT 8080

WORKDIR /client

COPY next.config.prod.js next.config.js

COPY public /client/public

COPY .next/standalone /client/

CMD ["node", "server.js"]

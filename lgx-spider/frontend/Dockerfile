#FROM    alpine:3.13.6

FROM node:20
RUN mkdir /app
WORKDIR /app
ADD package.json /app
RUN npm install

COPY src /app/src
COPY public /app/public
COPY express-middlewares /app/express-middlewares

COPY astro.config.mjs /app
COPY tailwind.config.cjs /app
COPY tsconfig.json /app
COPY express-server.js /app
COPY sentry.client.config.js /app
COPY sentry.server.config.js /app

ARG MOUNT_PATH
ENV MOUNT_PATH=${MOUNT_PATH}
RUN npm run build

CMD ["node", "express-server.js" ]


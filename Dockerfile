FROM node:16-alpine3.11
RUN apk add --update nodejs npm
ENV NODE_ENV=prod
RUN mkdir /app
RUN mkdir /db
RUN mkdir /app/node_modules
COPY ./server server
COPY ./client client
WORKDIR /server
RUN npm install
RUN node ./node_modules/.bin/tsc
RUN cp -r ./dist/** ../app
RUN cp -r ./node_modules/** ../app/node_modules
WORKDIR /app
RUN mkdir -p public
WORKDIR /client
RUN npm install
RUN npm run build
WORKDIR ../app
RUN cp -r ../client/build/** ./public
RUN cp -r ../server/src/public/** ./public
CMD node index.js

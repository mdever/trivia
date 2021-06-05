FROM node:16-alpine3.11
RUN apk add --update nodejs npm
ENV NODE_ENV=prod
RUN mkdir app
COPY ./server server
COPY ./client client
WORKDIR server
RUN npm install
RUN ./node_modules/.bin/tsc
RUN cp ./dist ../app
RUN mkdir public
WORKDIR ../client
RUN npm install
RUN npm run build
RUN cp build ../app/public
WORKDIR ../app
CMD node index.js
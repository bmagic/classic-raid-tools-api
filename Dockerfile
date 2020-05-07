FROM node:alpine

EXPOSE 3000

RUN apk add --no-cache tzdata
ENV TZ Europe/Paris

WORKDIR /usr/src/client

COPY . .
RUN npm install
CMD npm start

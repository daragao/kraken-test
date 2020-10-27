FROM alpine

COPY package* ./
COPY src src
COPY *.json ./
RUN apk add --update nodejs npm
RUN npm i
CMD ["node", "src"]

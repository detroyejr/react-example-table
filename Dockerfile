FROM node:13.13

COPY package.json /app/package.json

RUN cd /app && npm install

COPY . app

WORKDIR /app

CMD ["npm", "start"]
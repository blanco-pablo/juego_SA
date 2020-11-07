FROM node:12
COPY . .
#WORKDIR /app
RUN npm install

RUN npm test
#CMD ["node", "src/index.js"]
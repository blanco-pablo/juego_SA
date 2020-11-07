FROM node:12
COPY . .
#WORKDIR /app
RUN npm install

RUN npm test
RUN npm run sonar

#CMD ["node", "src/index.js"]
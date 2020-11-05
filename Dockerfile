FROM node:12
COPY . .
#WORKDIR /app
RUN npm install

#CMD ["node", "src/index.js"]
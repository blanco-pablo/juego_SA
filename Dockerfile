FROM node:12
COPY . .
#WORKDIR /app
RUN npm install

EXPOSE 80

#CMD ["node", "src/index.js"]
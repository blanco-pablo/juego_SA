FROM node:12
COPY . .
#WORKDIR /app
RUN npm install

EXPOSE 3000:3000

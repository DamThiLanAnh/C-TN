FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g serve

COPY . .
RUN npm install
RUN npm run build -- --configuration production

EXPOSE 8080
CMD ["serve", "-s", "dist/hr-management", "-l", "8080"]

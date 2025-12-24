FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install -g serve

COPY . .
RUN npm install
RUN npm run build -- --configuration production

EXPOSE 3000
CMD sh -c "serve -s dist/hr-management -l $PORT"

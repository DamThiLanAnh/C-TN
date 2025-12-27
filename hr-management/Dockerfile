FROM node:16-alpine

WORKDIR /app

RUN npm install -g serve

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build -- --configuration production

EXPOSE 3000
CMD sh -c "serve -s dist/hr-management -l $PORT"

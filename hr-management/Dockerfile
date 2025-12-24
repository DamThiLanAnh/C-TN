FROM node:16-alpine

WORKDIR /app

# Cài serve để chạy static
RUN npm install -g serve

# Copy package để install deps
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build Angular
RUN npm run build -- --configuration production

# Railway sẽ inject PORT
EXPOSE 3000
CMD sh -c "serve -s dist/hr-management -l $PORT"

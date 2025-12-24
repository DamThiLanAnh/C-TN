# Bước 1: Build ứng dụng (Stage 1)
FROM node:20-alpine AS build

WORKDIR /app

# Cài đặt phụ thuộc
COPY package*.json ./
RUN npm install

# Copy toàn bộ code và build dự án
COPY . .
RUN npm run build

# Bước 2: Chạy ứng dụng (Stage 2)
FROM node:20-alpine

WORKDIR /app

# Copy tất cả những gì đã build từ bước 1 vào máy ảo mới
# Lệnh này sẽ copy toàn bộ thư mục dist mà không cần biết tên dự án cụ thể
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Cài đặt biến môi trường cho Port (Railway yêu cầu)
ENV PORT=8080
EXPOSE 8080

# Chạy server.
# Lưu ý: Nếu tên dự án của bạn khác, hãy sửa 'frontend' thành tên thư mục con trong dist của bạn
# Hoặc đơn giản là kiểm tra file server.mjs nằm ở đâu sau khi build.
CMD ["sh", "-c", "node dist/*/server/server.mjs"]

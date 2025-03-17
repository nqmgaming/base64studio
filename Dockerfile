FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install --production

# Sao chép mã nguồn ứng dụng
COPY . .

# Mở cổng 3000
EXPOSE 3000

# Khởi động ứng dụng
CMD ["npm", "start"] 
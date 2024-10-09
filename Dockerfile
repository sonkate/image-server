# Sử dụng image Node.js LTS
FROM node:20

# Set thư mục làm việc trong container
WORKDIR /usr/src/app

# Sao chép file package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt các dependencies trong container
RUN npm install --force

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Expose cổng mà ứng dụng sẽ chạy
EXPOSE 5000

# Chạy ứng dụng
CMD ["npm", "run" ,"start"]
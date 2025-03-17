FROM nginx:alpine

# Sao chép các file tĩnh vào thư mục web của Nginx
COPY src/ /usr/share/nginx/html/

# Cấu hình Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80
EXPOSE 80

# Khởi động Nginx
CMD ["nginx", "-g", "daemon off;"] 
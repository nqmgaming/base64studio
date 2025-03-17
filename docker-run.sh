#!/bin/bash

# Hiển thị banner
echo "====================================="
echo "  Base64Studio - Docker Deployment"
echo "====================================="

# Kiểm tra Docker đã được cài đặt chưa
if ! command -v docker &> /dev/null; then
    echo "Docker chưa được cài đặt. Vui lòng cài đặt Docker trước."
    exit 1
fi

# Kiểm tra Docker Compose đã được cài đặt chưa
if ! command -v docker compose &> /dev/null; then
    echo "Docker Compose chưa được cài đặt. Vui lòng cài đặt Docker Compose trước."
    exit 1
fi

# Dừng container nếu đang chạy
echo "Dừng container nếu đang chạy..."
docker compose down

# Build và chạy container
echo "Đang build và chạy container..."
docker compose up -d --build

# Kiểm tra container đã chạy thành công chưa
if [ $? -eq 0 ]; then
    echo "====================================="
    echo "  Base64Studio đã được khởi chạy!"
    echo "  Truy cập: http://localhost:8081"
    echo "  Server Node.js đang chạy trên cổng 3000 trong container"
    echo "====================================="
else
    echo "Có lỗi xảy ra khi khởi chạy container."
    exit 1
fi

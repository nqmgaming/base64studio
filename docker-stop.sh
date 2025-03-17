#!/bin/bash

# Hiển thị banner
echo "====================================="
echo "  Base64Studio - Dừng Docker"
echo "====================================="

# Kiểm tra Docker Compose đã được cài đặt chưa
if ! command -v docker compose &> /dev/null; then
    echo "Docker Compose chưa được cài đặt. Vui lòng cài đặt Docker Compose trước."
    exit 1
fi

# Dừng container
echo "Đang dừng container..."
docker compose down

# Kiểm tra container đã dừng thành công chưa
if [ $? -eq 0 ]; then
    echo "====================================="
    echo "  Base64Studio đã được dừng thành công!"
    echo "====================================="
else
    echo "Có lỗi xảy ra khi dừng container."
    exit 1
fi

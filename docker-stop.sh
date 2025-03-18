#!/bin/bash

echo "====================================="
echo "  Base64Studio - Dừng Docker"
echo "====================================="

if ! command -v docker compose &> /dev/null; then
    echo "Docker Compose chưa được cài đặt. Vui lòng cài đặt Docker Compose trước."
    exit 1
fi

echo "Đang dừng container..."
docker compose down

if [ $? -eq 0 ]; then
    echo "====================================="
    echo "  Base64Studio đã được dừng thành công!"
    echo "====================================="
else
    echo "Có lỗi xảy ra khi dừng container."
    exit 1
fi

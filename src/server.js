const express = require('express');
const path = require('path');
const compression = require('compression');
const app = express();
const PORT = process.env.PORT || 3000;

// Sử dụng middleware nén gzip
app.use(compression());

// Cấu hình header bảo mật
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Phục vụ các file tĩnh từ thư mục hiện tại
app.use(express.static(__dirname, {
    maxAge: 86400000, // Cache 1 ngày
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            // Không cache file HTML
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Xử lý tất cả các route khác, trả về index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
}); 
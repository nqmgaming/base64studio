const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Phục vụ các file tĩnh từ thư mục src
app.use(express.static(path.join(__dirname, 'src')));

// Route chính
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});

document.addEventListener('DOMContentLoaded', function () {
    const imageInput = document.getElementById('imageInput');
    const base64Output = document.getElementById('base64Output');
    const base64Input = document.getElementById('base64Input');
    const imagePreview = document.getElementById('imagePreview');
    const copyBase64Btn = document.getElementById('copyBase64');
    const downloadImageBtn = document.getElementById('downloadImage');
    const hiddenContent = document.getElementById('hiddenContent');
    const embedContentBtn = document.getElementById('embedContent');
    const extractContentBtn = document.getElementById('extractContent');
    const hiddenContentContainer = document.getElementById('hiddenContentContainer');
    const hiddenContentDisplay = document.getElementById('hiddenContentDisplay');

    // Giới hạn kích thước file (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    // Thêm hiệu ứng drag & drop
    const dropZone = document.createElement('div');
    dropZone.className = 'drop-zone';
    dropZone.innerHTML = `
        <div class="drop-zone-content">
            <i class="fas fa-cloud-upload-alt fa-3x mb-3"></i>
            <p>Kéo thả hình ảnh vào đây hoặc click để chọn</p>
            <small class="text-muted">Hỗ trợ: JPG, PNG, GIF (Tối đa 10MB)</small>
        </div>
    `;
    imageInput.parentNode.insertBefore(dropZone, imageInput);
    imageInput.style.display = 'none';

    // Xử lý sự kiện drag & drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    });

    dropZone.addEventListener('click', () => {
        imageInput.click();
    });

    // Xử lý file upload
    imageInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    function handleFile(file) {
        // Kiểm tra kích thước file
        if (file.size > MAX_FILE_SIZE) {
            showNotification('File quá lớn! Vui lòng chọn file nhỏ hơn 10MB.', 'error');
            return;
        }

        // Kiểm tra định dạng file
        if (!file.type.startsWith('image/jpeg')) {
            showNotification('Vui lòng chọn file JPEG!', 'error');
            return;
        }

        // Hiển thị loading
        dropZone.classList.add('loading');
        dropZone.querySelector('.drop-zone-content').innerHTML = `
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;

        const reader = new FileReader();
        reader.onload = function (e) {
            base64Output.value = e.target.result;
            base64Input.value = e.target.result;
            updateImagePreview(e.target.result);

            // Khôi phục giao diện drop zone
            dropZone.classList.remove('loading');
            dropZone.querySelector('.drop-zone-content').innerHTML = `
                <i class="fas fa-cloud-upload-alt fa-3x mb-3"></i>
                <p>Kéo thả hình ảnh JPEG vào đây hoặc click để chọn</p>
                <small class="text-muted">Chỉ hỗ trợ: JPEG (Tối đa 10MB)</small>
            `;

            showNotification('Chuyển đổi thành công!', 'success');
        };
        reader.readAsDataURL(file);
    }

    // Xử lý chuyển đổi Base64 sang hình ảnh
    base64Input.addEventListener('input', function () {
        const base64String = this.value.trim();
        updateImagePreview(base64String);
        // Ẩn nội dung ẩn khi thay đổi chuỗi Base64
        hiddenContentContainer.style.display = 'none';
    });

    // Hàm cập nhật preview hình ảnh
    function updateImagePreview(base64String) {
        if (!base64String) {
            imagePreview.innerHTML = `
                <p class="text-muted">
                    <i class="fas fa-image me-2"></i>
                    Hình ảnh sẽ hiển thị ở đây
                </p>
            `;
            return;
        }

        try {
            if (!isValidBase64(base64String)) {
                throw new Error('Chuỗi Base64 không hợp lệ');
            }

            const oldImage = imagePreview.querySelector('img');
            if (oldImage) {
                oldImage.remove();
            }

            const img = document.createElement('img');
            img.className = 'img-fluid';
            img.style.maxWidth = '100%';
            img.style.maxHeight = '300px';
            img.style.objectFit = 'contain';

            img.onload = function () {
                imagePreview.innerHTML = '';
                imagePreview.appendChild(img);
            };

            img.onerror = function () {
                throw new Error('Không thể tải hình ảnh');
            };

            img.src = base64String;

        } catch (error) {
            imagePreview.innerHTML = `
                <div class="text-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    ${error.message}
                </div>
            `;
        }
    }

    // Nút sao chép Base64
    copyBase64Btn.addEventListener('click', function () {
        if (base64Output.value) {
            base64Output.select();
            document.execCommand('copy');
            showNotification('Đã sao chép vào clipboard!', 'success');
        }
    });

    // Nút tải xuống hình ảnh
    downloadImageBtn.addEventListener('click', function () {
        const base64String = base64Input.value.trim();
        if (!base64String || !isValidBase64(base64String)) {
            showNotification('Vui lòng nhập chuỗi Base64 hợp lệ!', 'error');
            return;
        }

        const link = document.createElement('a');
        link.download = 'image.png';
        link.href = base64String;
        link.click();
        showNotification('Đã tải xuống hình ảnh!', 'success');
    });

    // Hàm kiểm tra chuỗi Base64 hợp lệ
    function isValidBase64(str) {
        try {
            if (!str.startsWith('data:image/')) {
                return false;
            }
            const base64Part = str.split(',')[1];
            return base64Part && btoa(atob(base64Part)) === base64Part;
        } catch (err) {
            return false;
        }
    }

    // Hàm hiển thị thông báo
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2"></i>
            ${message}
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Hàm nhúng nội dung vào Base64
    function embedContent(base64String, content) {
        try {
            // Kiểm tra định dạng JPEG
            if (!base64String.startsWith('data:image/jpeg')) {
                throw new Error('Chỉ hỗ trợ file JPEG!');
            }

            // Tách phần header và data của Base64
            const [header, data] = base64String.split(',');

            // Chuyển nội dung thành hex
            const contentHex = Array.from(content).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');

            // Tạo marker comment (FF FE) với kích thước và nội dung
            const markerSize = (contentHex.length / 2 + 2).toString(16).padStart(4, '0');
            const marker = 'FFFE' + markerSize + contentHex;

            // Chuyển marker từ hex sang Base64
            const markerBase64 = btoa(String.fromCharCode(...marker.match(/.{1,2}/g).map(byte => parseInt(byte, 16))));

            // Chèn marker vào trước FF DA (start of scan)
            const scanMarkerIndex = data.indexOf('FFDA');
            if (scanMarkerIndex === -1) {
                throw new Error('Không tìm thấy vị trí thích hợp để nhúng nội dung');
            }

            const newData = data.slice(0, scanMarkerIndex) + markerBase64 + data.slice(scanMarkerIndex);

            // Tính toán padding
            const paddingLength = (4 - newData.length % 4) % 4;
            const padding = '='.repeat(paddingLength);

            return header + ',' + newData + padding;
        } catch (error) {
            throw new Error('Không thể nhúng nội dung vào hình ảnh: ' + error.message);
        }
    }

    // Hàm trích xuất nội dung từ Base64
    function extractContent(base64String) {
        try {
            const [, data] = base64String.split(',');

            // Tìm marker comment (FF FE)
            const markerIndex = data.indexOf('FFFE');
            if (markerIndex === -1) {
                return null;
            }

            // Đọc kích thước của marker
            const sizeHex = data.slice(markerIndex + 4, markerIndex + 8);
            const size = parseInt(sizeHex, 16);

            // Đọc nội dung
            const contentHex = data.slice(markerIndex + 8, markerIndex + 8 + (size - 2) * 2);
            const content = String.fromCharCode(...contentHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

            return content;
        } catch (error) {
            return null;
        }
    }

    // Xử lý nút nhúng nội dung
    embedContentBtn.addEventListener('click', function () {
        const content = hiddenContent.value.trim();
        if (!content) {
            showNotification('Vui lòng nhập nội dung muốn ẩn!', 'error');
            return;
        }

        const base64String = base64Output.value;
        if (!base64String || !isValidBase64(base64String)) {
            showNotification('Vui lòng upload hình ảnh trước!', 'error');
            return;
        }

        try {
            const newBase64 = embedContent(base64String, content);
            base64Output.value = newBase64;
            base64Input.value = newBase64;
            updateImagePreview(newBase64);
            showNotification('Đã nhúng nội dung thành công!', 'success');
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    // Xử lý nút trích xuất nội dung
    extractContentBtn.addEventListener('click', function () {
        const base64String = base64Input.value.trim();
        if (!base64String || !isValidBase64(base64String)) {
            showNotification('Vui lòng nhập chuỗi Base64 hợp lệ!', 'error');
            return;
        }

        const content = extractContent(base64String);
        if (content) {
            hiddenContentDisplay.textContent = content;
            hiddenContentContainer.style.display = 'block';
            showNotification('Đã trích xuất nội dung thành công!', 'success');
        } else {
            showNotification('Không tìm thấy nội dung ẩn trong hình ảnh!', 'error');
        }
    });
}); 
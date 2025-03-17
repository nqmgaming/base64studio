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
    const removeContentBtn = document.getElementById('removeContent');

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
        if (!file.type.startsWith('image/')) {
            showNotification('Vui lòng chọn file hình ảnh hợp lệ!', 'error');
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
            updateEmbedButtonState();

            // Khôi phục giao diện drop zone
            dropZone.classList.remove('loading');
            dropZone.querySelector('.drop-zone-content').innerHTML = `
                <i class="fas fa-cloud-upload-alt fa-3x mb-3"></i>
                <p>Kéo thả hình ảnh vào đây hoặc click để chọn</p>
                <small class="text-muted">Hỗ trợ: JPG, PNG, GIF (Tối đa 10MB)</small>
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

            // Xóa ảnh cũ nếu có
            const oldImage = imagePreview.querySelector('img');
            if (oldImage) {
                oldImage.remove();
            }

            // Tạo ảnh mới
            const img = document.createElement('img');
            img.className = 'img-fluid loaded';
            img.style.maxWidth = '100%';
            img.style.maxHeight = '300px';
            img.style.objectFit = 'contain';

            // Thêm loading state
            imagePreview.innerHTML = `
                <div class="loading">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Đang tải...</span>
                    </div>
                </div>
            `;

            // Xử lý khi ảnh load thành công
            img.onload = function () {
                imagePreview.innerHTML = '';
                imagePreview.appendChild(img);
            };

            // Xử lý khi ảnh load thất bại
            img.onerror = function () {
                imagePreview.innerHTML = `
                    <div class="text-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Không thể tải hình ảnh. Vui lòng kiểm tra lại chuỗi Base64.
                    </div>
                `;
            };

            // Gán source cho ảnh
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
            if (!base64Part) return false;

            // Kiểm tra xem chuỗi có phải là Base64 hợp lệ không
            const decoded = atob(base64Part);
            const encoded = btoa(decoded);
            return encoded === base64Part;
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

    // Thêm các hàm hỗ trợ
    function base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    function uint8ArrayToBase64(bytes) {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    // Hàm nhúng nội dung vào Base64
    function embedContent(base64String, content) {
        try {
            if (base64String.startsWith('data:image/jpeg')) {
                return embedContentJPEG(base64String, content);
            } else if (base64String.startsWith('data:image/png')) {
                return embedContentPNG(base64String, content);
            } else {
                throw new Error('Định dạng không được hỗ trợ! Chỉ hỗ trợ JPEG và PNG.');
            }
        } catch (error) {
            throw new Error('Không thể nhúng nội dung: ' + error.message);
        }
    }

    // Hàm nhúng nội dung cho JPEG
    function embedContentJPEG(base64String, content) {
        try {
            // Tách header và data của Base64
            const [header, data] = base64String.split(',');

            // Giải mã Base64 thành Uint8Array
            const bytes = base64ToUint8Array(data);

            // Tìm và xóa marker comment cũ (FF FE) nếu có
            let cleanedBytes = removeExistingCommentMarkersJPEG(bytes);

            // Tìm vị trí FF DA (start of scan)
            let scanMarkerIndex = -1;
            for (let i = 0; i < cleanedBytes.length - 1; i++) {
                if (cleanedBytes[i] === 0xFF && cleanedBytes[i + 1] === 0xDA) {
                    scanMarkerIndex = i;
                    break;
                }
            }
            if (scanMarkerIndex === -1) {
                throw new Error('Không tìm thấy vị trí thích hợp để nhúng nội dung');
            }

            // Chuyển nội dung thành mảng byte
            const contentBytes = new TextEncoder().encode(content);

            // Tạo marker comment (FF FE)
            const marker = new Uint8Array(2 + 2 + contentBytes.length);
            marker[0] = 0xFF; // Byte đầu của marker
            marker[1] = 0xFE; // Byte thứ hai của marker
            const size = contentBytes.length + 2; // Kích thước = nội dung + 2 byte kích thước
            marker[2] = (size >> 8) & 0xFF; // Byte cao của kích thước
            marker[3] = size & 0xFF; // Byte thấp của kích thước
            marker.set(contentBytes, 4); // Chèn nội dung vào sau kích thước

            // Chèn marker vào trước FF DA
            const newBytes = new Uint8Array(cleanedBytes.length + marker.length);
            newBytes.set(cleanedBytes.slice(0, scanMarkerIndex), 0);
            newBytes.set(marker, scanMarkerIndex);
            newBytes.set(cleanedBytes.slice(scanMarkerIndex), scanMarkerIndex + marker.length);

            // Mã hóa lại thành Base64
            const newData = uint8ArrayToBase64(newBytes);

            return header + ',' + newData;
        } catch (error) {
            throw new Error('Không thể nhúng nội dung vào JPEG: ' + error.message);
        }
    }

    // Hàm nhúng nội dung cho PNG
    function embedContentPNG(base64String, content) {
        try {
            // Tách header và data của Base64
            const [header, data] = base64String.split(',');

            // Giải mã Base64 thành Uint8Array
            const bytes = base64ToUint8Array(data);

            // Xóa tEXt chunk cũ nếu có
            const cleanedBytes = removeExistingTextChunksPNG(bytes);

            // Tìm vị trí sau IHDR chunk
            const ihdrEnd = findIHDREnd(cleanedBytes);
            if (ihdrEnd === -1) {
                throw new Error('Không tìm thấy chunk IHDR trong file PNG');
            }

            // Tạo tEXt chunk với nội dung
            const keyword = 'Comment';
            const textData = keyword + '\0' + content;
            const textBytes = new TextEncoder().encode(textData);

            // Kích thước của dữ liệu chunk
            const chunkLength = textBytes.length;

            // Loại chunk: tEXt
            const chunkType = new Uint8Array([0x74, 0x45, 0x58, 0x74]); // "tEXt"

            // Tạo chunk hoàn chỉnh: length (4) + type (4) + data (n) + crc (4)
            const chunk = new Uint8Array(4 + 4 + chunkLength + 4);

            // Đặt kích thước
            chunk[0] = (chunkLength >> 24) & 0xFF;
            chunk[1] = (chunkLength >> 16) & 0xFF;
            chunk[2] = (chunkLength >> 8) & 0xFF;
            chunk[3] = chunkLength & 0xFF;

            // Đặt loại chunk
            chunk.set(chunkType, 4);

            // Đặt dữ liệu
            chunk.set(textBytes, 8);

            // Tính CRC
            const crc = calculateCRC32(new Uint8Array([...Array.from(chunkType), ...Array.from(textBytes)]));
            chunk[8 + chunkLength] = (crc >> 24) & 0xFF;
            chunk[8 + chunkLength + 1] = (crc >> 16) & 0xFF;
            chunk[8 + chunkLength + 2] = (crc >> 8) & 0xFF;
            chunk[8 + chunkLength + 3] = crc & 0xFF;

            // Chèn chunk vào sau IHDR
            const newBytes = new Uint8Array(cleanedBytes.length + chunk.length);
            newBytes.set(cleanedBytes.slice(0, ihdrEnd), 0);
            newBytes.set(chunk, ihdrEnd);
            newBytes.set(cleanedBytes.slice(ihdrEnd), ihdrEnd + chunk.length);

            // Mã hóa lại thành Base64
            const newData = uint8ArrayToBase64(newBytes);

            return header + ',' + newData;
        } catch (error) {
            throw new Error('Không thể nhúng nội dung vào PNG: ' + error.message);
        }
    }

    // Hàm tìm vị trí kết thúc của IHDR chunk
    function findIHDREnd(bytes) {
        // PNG signature: 8 bytes
        // Chunk = Length (4) + Type (4) + Data (Length) + CRC (4)
        // IHDR là chunk đầu tiên sau signature
        if (bytes.length < 24) return -1;

        // Kiểm tra signature PNG
        const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
        for (let i = 0; i < 8; i++) {
            if (bytes[i] !== pngSignature[i]) return -1;
        }

        // Kiểm tra IHDR
        const ihdrType = [73, 72, 68, 82]; // "IHDR"
        for (let i = 0; i < 4; i++) {
            if (bytes[12 + i] !== ihdrType[i]) return -1;
        }

        // Đọc kích thước của IHDR
        const ihdrLength = (bytes[8] << 24) | (bytes[9] << 16) | (bytes[10] << 8) | bytes[11];

        // Vị trí kết thúc của IHDR = 8 (signature) + 4 (length) + 4 (type) + ihdrLength + 4 (CRC)
        return 8 + 4 + 4 + ihdrLength + 4;
    }

    // Hàm xóa tất cả marker comment (FF FE) trong JPEG
    function removeExistingCommentMarkersJPEG(bytes) {
        const result = [];
        let i = 0;

        while (i < bytes.length) {
            // Nếu tìm thấy marker FF FE
            if (i < bytes.length - 3 && bytes[i] === 0xFF && bytes[i + 1] === 0xFE) {
                // Đọc kích thước
                const size = (bytes[i + 2] << 8) | bytes[i + 3];
                // Bỏ qua marker này
                i += 2 + size;
            } else {
                // Giữ lại byte hiện tại
                result.push(bytes[i]);
                i++;
            }
        }

        return new Uint8Array(result);
    }

    // Hàm xóa tất cả tEXt chunk trong PNG
    function removeExistingTextChunksPNG(bytes) {
        if (bytes.length < 8) return bytes;

        // Kiểm tra signature PNG
        const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
        for (let i = 0; i < 8; i++) {
            if (bytes[i] !== pngSignature[i]) return bytes;
        }

        const result = [];
        // Giữ lại PNG signature
        for (let i = 0; i < 8; i++) {
            result.push(bytes[i]);
        }

        let i = 8;
        while (i < bytes.length) {
            // Đọc kích thước chunk
            if (i + 4 > bytes.length) break;
            const length = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];

            // Đọc loại chunk
            if (i + 8 > bytes.length) break;
            const type = String.fromCharCode(bytes[i + 4], bytes[i + 5], bytes[i + 6], bytes[i + 7]);

            // Nếu là tEXt chunk với keyword "Comment", bỏ qua
            if (type === 'tEXt') {
                // Kiểm tra xem có đủ byte để đọc keyword không
                if (i + 8 + length > bytes.length) break;

                // Đọc keyword
                let j = i + 8;
                let keyword = '';
                while (j < i + 8 + length && bytes[j] !== 0) {
                    keyword += String.fromCharCode(bytes[j]);
                    j++;
                }

                if (keyword === 'Comment') {
                    // Bỏ qua chunk này
                    i += 8 + length + 4; // length + type + data + crc
                    continue;
                }
            }

            // Giữ lại chunk này
            for (let j = 0; j < 8 + length + 4; j++) {
                if (i + j < bytes.length) {
                    result.push(bytes[i + j]);
                }
            }

            i += 8 + length + 4;
        }

        return new Uint8Array(result);
    }

    // Hàm tính CRC32 cho PNG chunk
    function calculateCRC32(data) {
        let crc = 0xFFFFFFFF;
        const crcTable = makeCRCTable();

        for (let i = 0; i < data.length; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xFF];
        }

        return crc ^ 0xFFFFFFFF;
    }

    // Hàm tạo bảng CRC
    function makeCRCTable() {
        let c;
        const crcTable = [];

        for (let n = 0; n < 256; n++) {
            c = n;
            for (let k = 0; k < 8; k++) {
                c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            crcTable[n] = c;
        }

        return crcTable;
    }

    // Hàm trích xuất nội dung từ Base64
    function extractContent(base64String) {
        if (base64String.startsWith('data:image/jpeg')) {
            return extractContentJPEG(base64String);
        } else if (base64String.startsWith('data:image/png')) {
            return extractContentPNG(base64String);
        } else {
            return null;
        }
    }

    // Hàm trích xuất nội dung từ JPEG
    function extractContentJPEG(base64String) {
        try {
            const [, data] = base64String.split(',');
            const bytes = base64ToUint8Array(data);

            // Tìm marker comment (FF FE)
            for (let i = 0; i < bytes.length - 1; i++) {
                if (bytes[i] === 0xFF && bytes[i + 1] === 0xFE) {
                    // Đọc kích thước của marker
                    const size = (bytes[i + 2] << 8) | bytes[i + 3];
                    // Trích xuất nội dung
                    const contentBytes = bytes.slice(i + 4, i + 4 + size - 2);
                    return new TextDecoder().decode(contentBytes);
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    // Hàm trích xuất nội dung từ PNG
    function extractContentPNG(base64String) {
        try {
            const [, data] = base64String.split(',');
            const bytes = base64ToUint8Array(data);

            // Kiểm tra signature PNG
            const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
            for (let i = 0; i < 8; i++) {
                if (bytes[i] !== pngSignature[i]) return null;
            }

            let i = 8;
            while (i < bytes.length) {
                // Đọc kích thước chunk
                if (i + 4 > bytes.length) break;
                const length = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];

                // Đọc loại chunk
                if (i + 8 > bytes.length) break;
                const type = String.fromCharCode(bytes[i + 4], bytes[i + 5], bytes[i + 6], bytes[i + 7]);

                // Nếu là tEXt chunk
                if (type === 'tEXt') {
                    // Kiểm tra xem có đủ byte để đọc keyword không
                    if (i + 8 + length > bytes.length) break;

                    // Đọc keyword và nội dung
                    const textData = bytes.slice(i + 8, i + 8 + length);
                    const text = new TextDecoder().decode(textData);
                    const parts = text.split('\0');

                    if (parts.length >= 2 && parts[0] === 'Comment') {
                        return parts.slice(1).join('\0');
                    }
                }

                i += 8 + length + 4; // length + type + data + crc
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    // Hàm kiểm tra và cập nhật trạng thái nút embed
    function updateEmbedButtonState() {
        const base64String = base64Output.value;
        const isSupported = base64String && (base64String.startsWith('data:image/jpeg') || base64String.startsWith('data:image/png'));

        embedContentBtn.disabled = !isSupported;
        if (!isSupported && base64String) {
            embedContentBtn.title = 'Chỉ hỗ trợ file JPEG và PNG';
        } else {
            embedContentBtn.title = '';
        }
    }

    // Cập nhật trạng thái nút khi thay đổi Base64
    base64Output.addEventListener('input', updateEmbedButtonState);
    base64Input.addEventListener('input', updateEmbedButtonState);

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

    // Xử lý nút xóa nội dung ẩn
    removeContentBtn.addEventListener('click', function () {
        const base64String = base64Output.value;
        if (!base64String || !isValidBase64(base64String)) {
            showNotification('Vui lòng upload hình ảnh trước!', 'error');
            return;
        }

        try {
            // Tách header và data của Base64
            const [header, data] = base64String.split(',');

            // Giải mã Base64 thành Uint8Array
            const bytes = base64ToUint8Array(data);

            let cleanedBytes;
            if (base64String.startsWith('data:image/jpeg')) {
                // Xóa tất cả marker comment (FF FE)
                cleanedBytes = removeExistingCommentMarkersJPEG(bytes);
            } else if (base64String.startsWith('data:image/png')) {
                // Xóa tất cả tEXt chunk
                cleanedBytes = removeExistingTextChunksPNG(bytes);
            } else {
                throw new Error('Định dạng không được hỗ trợ! Chỉ hỗ trợ JPEG và PNG.');
            }

            // Mã hóa lại thành Base64
            const newData = uint8ArrayToBase64(cleanedBytes);
            const newBase64 = header + ',' + newData;

            // Cập nhật giá trị và preview
            base64Output.value = newBase64;
            base64Input.value = newBase64;
            updateImagePreview(newBase64);

            // Ẩn phần hiển thị nội dung ẩn
            hiddenContentContainer.style.display = 'none';
            hiddenContentDisplay.textContent = '';
            hiddenContent.value = '';

            showNotification('Đã xóa nội dung ẩn thành công!', 'success');
        } catch (error) {
            showNotification('Không thể xóa nội dung ẩn: ' + error.message, 'error');
        }
    });
}); 
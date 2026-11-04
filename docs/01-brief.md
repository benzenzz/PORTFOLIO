# Brief phân tích

Trạng thái: chờ Demi xác nhận mục 5. Mọi số liệu lấy từ CV, chưa có nguồn đối chiếu khác.

Cách đọc tài liệu: video được xem qua khung hình trích ra, không nghe tiếng. Trang lưu của Huy Phan được xem qua ảnh chụp, không đọc mã nguồn.

## 1. Chủ nhân portfolio

Sinh viên Kinh tế Quốc tế, Đại học Ngoại thương TP.HCM (dự kiến tốt nghiệp 1/2028), làm video và creative.

Câu chuyện mạnh nhất không phải "biết dựng video" mà là **người cầm trịch creative cho một chiến dịch quy mô quốc gia, đồng thời tự tay làm hình ảnh chuyển động**. Hồ sơ này khác với một video editor thuần túy, vì có cả tư duy marketing, điều phối đội ngũ, làm việc với nhà tài trợ và làm web.

Bằng chứng trong CV:

- Leader of Creative Communications, Marketing Arena 2026: 3.087 người tham gia, 1.029 đội, 80 trường
- Fanpage Creatio 48K+ follower; chiến dịch đạt 2,4M view, 37K+ tương tác, 14,2K click
- Website sự kiện đạt 7K+ session trong 3 tháng
- Đàm phán tài trợ OOH độc quyền từ Unique Media Group, trị giá gần 1.000 USD, 1 ngày tại phố đi bộ Nguyễn Huệ
- Dựng video cho Ngoc Ho Medicare (YouTube, TikTok), 11/2025 đến 3/2026
- Bán kết TVCreate 2026 (Top 20/190+); Quán quân INTERNALATIO 2025
- Công cụ: Photoshop, Premiere Pro, After Effects, WordPress, HTML/CSS, Codex và AI tạo sinh. IELTS 7.0

## 2. Tác phẩm hiện có

| Tác phẩm | Tài sản | Nhận xét |
|---|---|---|
| Showreel | `Hero Highlights.mpeg`, 89 giây, 1080p | Rất đa dạng: kể chuyện đời thường, trailer khoa học viễn tưởng, Gala đỏ. Là tài sản mạnh nhất cho hero |
| Marketing Arena 2026 | 4 KV, 16 post, 5 video | Dự án chủ lực, thế giới đỏ vàng kiểu sử thi, có câu chuyện chiến dịch đầy đủ từ teaser đến Gala |
| Marketing Arena 2026 OOH | `ma26-ooh-pho-di-bo.mp4`, dọc 1440x2448 | Bằng chứng ngoài đời hiếm có, gắn với chi tiết đàm phán OOH |
| First Event 2025 (SPYCOM) | 1 video 43 giây | Tông phim điệp viên, chất film, cho thấy dải phong cách khác hẳn MA26 |
| Websites | `marketingarena.vn`, `creatioftu2.com` | Có link, chưa có ảnh chụp |
| Ngoc Ho Medicare, TVC TVCreate, Tết "Hưng Tỵ Thái Bình", Marketing Arena 2025 | Không có thư mục riêng | Có trong CV, thiếu tài sản |

## 3. Phân tích moodboard và reference

**Moodboard.** Hai hệ màu: đen trắng nhiều hạt và đỏ đặc. Chất liệu lặp lại: nhòe chuyển động, halftone, cháy sáng, hình người bé giữa khoảng trống lớn. Chữ grotesk đậm và chữ condensed cao, kết hợp chữ mono nhỏ.

| Reference | Điều nên lấy | Điều nên tránh |
|---|---|---|
| `bandicam...mp4` và trang Huy Phan | Bố cục metadata theo cột, số thứ tự lớn, logo dọc, menu chữ thường rõ ràng | Hiển thị nội dung quá nhạt khi chưa chọn |
| `Caseys Portfolio.mp4` | Danh sách tên dự án lớn, di chuột là ảnh đổi, nền đổi theo dự án; bản mobile vẫn giữ tính cách | Chấm tròn đỏ và bố cục riêng của Casey |
| `Artwork preview selection.mp4` | Dải thumbnail phồng lên theo chuột | Quá nhiều màu so với hệ của Demi |
| `Change.mp4` | Mảng hình học làm mask mở ra cảnh quay, rất hợp với dân video | Thời lượng dài |
| `Which loading animation...mp4` | Loader là bộ thẻ tác phẩm xoay thành vòng cung | Loader dài chặn nội dung, trái `CLAUDE.md` |

## 3b. Reference chính: Production Portugal

Demi chọn [productionportugal.com/work](https://productionportugal.com/work) làm reference chính. Khi có mâu thuẫn, reference này quyết định cấu trúc và motion, moodboard quyết định chất hình ảnh. Chỉ học nguyên tắc, không sao chép giao diện.

Quan sát trên trang (GSAP, Lenis, 24 video, chữ Neue Haas Grotesk):

- **Trang Work:** nền trắng, tiêu đề "OUR WORK" lớn, mọi thứ còn lại nhỏ. Tác phẩm chiếm gần hết màn hình.
- **Hai chế độ xem:** Gallery View (lưới hai cột) và Full-Screen (một cột lớn), có nút chuyển.
- **Thumbnail là video chạy sẵn**, không phải ảnh tĩnh. Tên dự án đặt đè lên hình và tự đảo màu theo nền, logo cũng vậy.
- **Motion khi cuộn:** khung hình nghiêng theo tốc độ cuộn rồi trở về thẳng, chế độ Full-Screen có thêm tách màu RGB nhẹ.
- **Trang xem dự án:** video tràn màn hình, timecode ở trái, dải tên dự án dưới đáy để chuyển qua lại.
- **Menu:** chữ nhỏ trong ngoặc vuông, ví dụ `[ WORK ]`, rõ ràng và dễ đoán.

Điều cần làm khác: thẻ dự án nên là link thật để dùng được bằng bàn phím, có poster tĩnh để tải nhanh, và tắt nghiêng cùng tách màu khi reduced-motion. Trên điện thoại giả lập, trang vẫn trắng sau 4 giây, nên portfolio cần hiện nội dung sớm hơn. Neue Haas Grotesk là font trả phí, cần chọn font thay thế ở T-03.

## 4. Hướng đề xuất

**Ý tưởng: "Cut" — website như phòng dựng.** Trang Work nền giấy sáng, im lặng, để video là nguồn màu chính. Khi xem dự án, trang chuyển sang đen như phòng chiếu.

- **Màu đỏ là cây cầu.** Moodboard và MA26 cùng dùng đỏ, nên đỏ `#FF343B` nối giao diện với tác phẩm một cách tự nhiên.
- **Không phủ hiệu ứng tĩnh lên tác phẩm.** KV MA26 rất rực và nhiều chi tiết, nền sáng sẽ làm chúng nổi bật. Hiệu ứng chỉ xuất hiện khi đang cuộn rồi trả lại hình sạch.
- **Chất moodboard nằm ở các điểm chọn lọc:** chân dung đen trắng, trang About và Contact nền đen, grain ở khoảnh khắc chuyển trang. `Portrait.png` đã rất khớp moodboard.
- **Motion đặc trưng:** nghiêng theo tốc độ cuộn, tách màu nhẹ, mask hình học lấy từ `Change.mp4` khi chuyển trang.
- **Metadata như phòng dựng:** timecode, vai trò, năm đặt cạnh mỗi tác phẩm. Riêng chi tiết vai trò là thứ Production Portugal không có mà portfolio cá nhân cần.
- **Kể bằng video.** Hero là showreel cắt ngắn, chạy không tiếng, có nút bật tiếng rõ ràng.

Việc cần chuẩn bị: nén `Hero Highlights.mpeg` (336 MB) và `Portrait.png` (17 MB). `ffmpeg` đã có sẵn trên máy.

## 5. Demi cần xác nhận

1. **Tên hiển thị:** CV ghi XANDER PHAN, bản còn lại ghi DEMI PHAN.
2. **Email liên hệ:** cả hai CV ghi `trangbr2006@gmail.com`, còn tài khoản Figma và git dùng `trangvr2006@gmail.com`. Một trong hai có thể gõ nhầm.
3. **Định vị:** đề xuất "Creative Lead & Video Editor". Chức danh trên CV là Video Editor Intern.
4. **Vai trò trong MA26:** KV và 16 post do Demi tự làm, hay chỉ đạo đội làm? Từng video thì sao?
5. **Website:** file `link WEBSITE.docx` ghi thiết kế và phát triển `marketingarena.vn`, còn CV ghi quản lý WordPress và tùy chỉnh HTML/CSS. Nên dùng cách nói nào?
6. **Quyền hình ảnh:** showreel có các cảnh giống phim hoặc footage bên ngoài không? Có được đăng ảnh thí sinh, mentor và logo nhà tài trợ không?
7. **Số điện thoại:** có đưa lên web không? Đề xuất chỉ dùng email và LinkedIn.
8. **Tài sản còn thiếu:** có file cho Medicare, TVC TVCreate, Tết hay MA 2025 không?
9. **Hướng "Cut":** đồng ý hay muốn đổi?

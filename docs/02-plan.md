# Kế hoạch site

Trạng thái: chờ Demi duyệt. Dựa trên `docs/01-brief.md`.

Mục tiêu: creative director ở agency nước ngoài xem tay nghề của Demi trong 30 giây đầu, hiểu Demi làm phần nào, và liên hệ được ngay.

## Sitemap

| Trang | Đường dẫn | Việc của trang |
|---|---|---|
| Work | `/` | Hero showreel và danh sách video, là trang chính |
| Dự án | `/work/[slug]` | Xem video tràn màn hình, vai trò, bối cảnh, video kế tiếp |
| About | `/about` | Giới thiệu, chân dung, kỹ năng, tải CV |

Contact là phần cuối của mọi trang, không tách trang riêng. Không làm trang đích riêng, vì người xem cần thấy tác phẩm ngay.

**Thanh menu:** cố định ở đầu mọi trang, luôn nhìn thấy khi cuộn. Tên Demi Phan bên trái, bên phải là `[ WORK ]`, `[ ABOUT ]`, `[ CONTACT ]`. Mục đang xem được đánh dấu đỏ. Chữ tự đảo màu để đọc được trên cả nền sáng và trên video. Trên điện thoại rút gọn thành `[ MENU ]`, chạm để mở.

## Trang Work

1. **Hero:** tên Demi Phan, dòng "Video Editor", vòng lặp video ngắn lấy từ showreel (tránh giây 40 đến 56), nút `[ PLAY SHOWREEL ]` mở bản đầy đủ có tiếng.
2. **Danh sách video:** nút chuyển Gallery và Full-Screen. Mỗi thẻ có video xem trước, tên, loại video, năm, vai trò.
3. **Case study:** một thẻ nổi bật dẫn tới Marketing Arena 2026.
4. **Contact:** email lớn, LinkedIn, múi giờ, tải CV.

## Danh sách tác phẩm đề xuất

| # | Tác phẩm | File | Vai trò | Ghi chú |
|---|---|---|---|---|
| 1 | Gala Night film | `Video editor/gala-night...mp4` | Video Editor | Mở đầu danh sách |
| 2 | Time Pressure teaser | `Video editor/quy-thoi-gian...mp4` | Video Editor | Tên tiếng Anh tạm, cần Demi duyệt |
| 3 | First Event 2025 "Spycom" | `first-event-2025...mp4` | [Xác nhận vai trò] | CV ghi "contributed", cần rõ phần dựng |
| 4 | Top 4 announcement | `Vfx_motion/chinh-thuc...mp4` | Video Editor | |
| 5 | Nguyen Hue OOH | `Vfx_motion/ma26-ooh...mp4` | Video Editor | Video dọc |
| 6 | Countdown 72H | `Vfx_motion/cd-end-2.mp4` | Motion | Video dọc |
| 7 | Ngoc Ho Medicare | [Thiếu file] | Video Editor, remote | Ẩn cho tới khi có file và được phép đăng |

Tên video ở trên là tên làm việc. Video ghép footage phim hiển thị ghi chú nguồn footage và không xếp đầu.

## Case study Marketing Arena 2026

Bối cảnh, vai trò, các video, KV và post, kết quả. Số liệu lấy nguyên từ CV: 3.087 người tham gia, 1.029 đội, 80 trường, 2,4M view, 37K+ tương tác, 14,2K click, 7K+ session.

Phần việc ghi rõ: toàn bộ video do Demi làm; Demi thiết kế và quản lý `marketingarena.vn`; post gồm phần tự làm và phần chỉ đạo. Ẩn 4 post có ảnh thí sinh.

## About

Chân dung `Portrait.png` trên nền đen, đoạn giới thiệu ngắn, công cụ (Premiere Pro, After Effects, Photoshop), kinh nghiệm chính, giải thưởng, IELTS 7.0, nút tải CV. Câu "open to remote internships" đặt ở vị trí dễ thấy.

Nội dung chỉ lấy từ CV. Bản tiếng Anh sẽ được Claude viết và Demi duyệt ở bước design.

## Stack

| Hạng mục | Chọn | Lý do |
|---|---|---|
| Framework | Next.js, TypeScript | Route động cho dự án, tối ưu ảnh, `CLAUDE.md` đã nhắc tới |
| Style | Tailwind CSS | Extension đã cài, token dễ chia sẻ với Sixth |
| Motion | GSAP, ScrollTrigger, Lenis | Cùng công cụ với reference chính, đã có skill GSAP |
| Nội dung | File dữ liệu `content/projects.ts` | Thêm dự án không cần sửa giao diện |
| Font | Inter Tight | Miễn phí, gần Neue Haas Grotesk |
| Deploy | Vercel | Miễn phí, hợp với Next.js. Đăng public cần Demi duyệt |

Không dùng WebGL ở bản đầu. Chỉ thêm nếu hiệu ứng tách màu bằng CSS không đủ đẹp.

## Xử lý video

- Showreel đầy đủ: H.264 1080p, mục tiêu dưới 40 MB, từ file 336 MB.
- Video xem trước: 6 đến 8 giây, không tiếng, 720p, dưới 3 MB mỗi file, kèm poster tĩnh.
- Chỉ tải video trong màn hình đang xem. Trên mobile hoặc mạng yếu dùng poster, chạm để phát.
- Reduced-motion: dừng video tự chạy và hiện poster.
- Video tự host, không dùng YouTube. Nếu dung lượng vượt giới hạn Vercel thì chuyển sang Cloudflare R2.

## Việc Demi cần cung cấp

- Mẫu video Ngoc Ho Medicare và xác nhận được đăng
- Danh sách post và KV tự làm, phần còn lại ghi là director
- Vai trò trong First Event 2025
- Video nào là video ghép footage phim
- File CV tiếng Anh dùng để tải, đã đổi tên thành Demi Phan
- LinkedIn hiện có slug `trang-phan-aba4a8319`: giữ hay đổi?

Site vẫn dựng được khi thiếu các mục này, phần thiếu sẽ để placeholder rõ ràng.

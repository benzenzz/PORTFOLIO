# Kế hoạch làm lại trang chủ theo emotion-agency.com

Trạng thái: chờ Demi duyệt. Chưa có task nào trên `tasks/BOARD.md`.

## Cấu trúc của emotion (đã đo bằng trình duyệt ngày 2026-11-05)

- Một canvas Three.js r185 duy nhất trong `#gl`: `position: fixed`, `z-index: 0`, không nhận chuột.
- 5 section `hero-1` đến `hero-5` chồng lên nhau tại cùng một vị trí và đổi `opacity` khi cuộn. Nền trong suốt.
- `what-we-do`, `h-projects`, `awards` nằm sau khoảng 19 màn hình cuộn. Bản ghi màn hình cho thấy cảnh 3D tắt hẳn ở đây, các section này nằm trên nền đen với lưới mảnh.
- Font: Emotion Serif (riêng của họ), PP Neue Montreal, IBM Plex Mono.
- Trình duyệt headless bị sập khi render, nên phần chuyển động lấy từ bản ghi màn hình của Demi (2026-11-05).

Chỉ học cấu trúc và cách tương tác. Không dùng model, shader, font riêng hay chữ của họ.

## Trang chủ của Demi

| # | Section | Vị trí | Nội dung |
|---|---|---|---|
| 1 | Hero | Lớp 1 | Where the wildest ideas become interfaces people remember. |
| 2 | Approach | Lớp 2 | I build more than a website. Thêm ý open to learn |
| 3 | Vibes | Lớp 3 | I create digital experiences... I turn code into feeling... |
| 4 | Design | Lớp 4 | Beauty with a purpose. Every pixel has a reason... |
| 5 | Skills | Lớp 5 | 2 năm kinh nghiệm: Ae, Ps, Pr, Claude Code. Code: HTML, JavaScript, C++ |
| 6 | What I bring | Cuộn thường | Thay cho Services, vì Demi ứng tuyển intern |
| 7 | Projects | Cuộn thường | Some of my projects. Chờ thông tin từ Demi |
| 8 | Hire me | Cuộn thường | Thay cho Contact |

Hai giải thưởng để ở About.

## Hiệu ứng thấy trong bản ghi của emotion

- Chuột để lại vệt khói mờ trong canvas, tan sau khoảng một giây. Vệt nằm dưới chữ.
- Chữ gần con chuột đổi sang nghiêng và có bóng lệch màu, rồi trở lại bình thường.
- Khối hạt lớn giữa màn hình đổi hình theo từng section. Chuột đẩy hạt ra thành lỗ thủng và làm vùng đó sáng lên.
- Khi chuyển lớp, chữ cũ uốn cong như quấn quanh trụ, đổi màu rồi biến mất.
- Cuộn làm camera di chuyển qua phong cảnh bóng đen, có hồ và các vì sao.
- Màn đầu tiên cho chọn vào có âm thanh hay không.
- Cuối trang có thêm màn "keep scrolling" dẫn sang About. Chưa đưa vào kế hoạch.

## Bản của Demi

- Màu: xám `#E5E4E2`, tím `#3A0F34`, vàng `#EAAA00`. Vàng chỉ dùng làm highlight, như đốm cháy hoặc vùng dưới chuột.
- Font tiêu đề `Instrument Serif` có cả bản nghiêng, dùng cho hiệu ứng chữ theo chuột.
- Chữ vẫn là HTML: lớp bản nghiêng nằm chồng lên, chỉ hiện trong vòng tròn quanh chuột.
- Cảm ứng không có hiệu ứng chữ, khối hạt phản ứng khi chạm. Reduced motion tắt cả hai.

## Kỹ thuật

- Thêm một gói `three`. Không dùng `@react-three/fiber`: chỉ có một canvas điều khiển bằng shader, GSAP đổi uniform là đủ, và emotion cũng dùng Three.js thuần.
- Canvas đặt ở `app/layout.tsx` để phase 7 giữ được cảnh khi chuyển trang. Dynamic import để không chặn trang đầu.
- Dùng lại Lenis, ScrollTrigger và `prefersReducedMotion`, `canFollowPointer` trong `lib/`.
- Toàn bộ chữ là HTML nằm trên canvas, nên vẫn đọc được khi WebGL lỗi.
- Low Quality: nút High/Low, tự chọn Low trên điện thoại hoặc máy yếu.
- Reduced motion hoặc không có WebGL: ảnh tĩnh của cảnh, không có chuyển động.
- Âm thanh: tắt mặc định. Chờ file từ Demi.

## Các phase

Mỗi phase kết thúc bằng commit, rồi Demi xem trước khi làm tiếp.

| Phase | Việc | Xong khi |
|---|---|---|
| 1 | Cảnh đồng cỏ, khối hạt phản ứng với chuột, vệt khói theo chuột, trời sao, sao băng | Demi ưng cảnh, chạy mượt trên laptop và điện thoại |
| 2 | Palette, font, nút sáng/tối | Đạt tương phản trên cả hai chế độ |
| 3 | 5 lớp ghim, copy, chữ đổi nghiêng theo chuột, chữ uốn cong khi chuyển lớp | Cuộn được, dùng được bằng bàn phím và cảm ứng, chữ luôn đọc được |
| 4 | What I bring, Projects, Hire me trên nền tối, không có cảnh 3D | Có đủ nội dung hoặc ô ngoặc vuông |
| 5 | Màn tải theo tiến độ thật, màn chọn có âm thanh hay không, Low Quality | Vào được bằng bàn phím, không bắt xem lại ở lần sau |
| 6 | Nút Marketing Arena: đỏ than, vết nứt, bụi lửa khi hover và focus | Có bản tương đương trên cảm ứng |
| 7 | Bấm vào case study: cả site đổi sang núi lửa, lửa, tinh thể | Quay lại trang chủ thì trở về đồng cỏ |

Phase 1 làm trước vì đây là phần rủi ro nhất. Nếu cảnh không đạt thì chưa tốn công sửa các phần khác.

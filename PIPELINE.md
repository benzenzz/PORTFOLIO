# Pipeline làm portfolio — Claude Code + Sixth

Hai agent không nói chuyện trực tiếp với nhau. Chúng bàn giao qua file trong repo, và Demi là người mở từng agent lên để nhận việc.

- `CLAUDE.md`: luật chung về thiết kế, nội dung, chất lượng. Cả hai agent đều tuân theo.
- `PIPELINE.md`: file này, ai làm gì ở bước nào.
- `tasks/BOARD.md`: bảng việc chung, là nơi duy nhất ghi trạng thái.
- `.sixthrules/`: luật riêng cho Sixth, vì Sixth không tự đọc `CLAUDE.md`.

## Phân vai

| Agent | Vai trò | Có sẵn |
|---|---|---|
| Claude Code | Trưởng nhóm: phân tích, lập kế hoạch, Figma, motion, review, QA | Figma MCP, Playwright MCP, skill GSAP và taste |
| Sixth | Thợ dựng: code theo task đã chia nhỏ, sửa lỗi QA, đọc chéo bằng model khác | Công cụ trình duyệt riêng, chọn được nhiều model |
| Demi | Đạo diễn: duyệt ở các cổng, cung cấp sự thật về dự án, chuyển lượt giữa hai agent | Tài khoản Figma, nội dung gốc |

## Các bước

| # | Bước | Người làm | Đầu vào | Đầu ra | Cổng duyệt |
|---|---|---|---|---|---|
| 0 | Kiểm kê tài sản | Claude | Các thư mục media, CV | `content-raw/INVENTORY.md` | |
| 1 | Phân tích | Claude | Moodboard, reference, CV | `docs/01-brief.md` | Demi xác nhận thông tin |
| 2 | Kế hoạch | Claude | Brief | `docs/02-plan.md`: sitemap, nội dung, stack | Demi duyệt |
| 3 | Wireframe | Claude | Kế hoạch | Frame low-fi trên Figma | |
| 4 | Design draft | Claude, Demi chỉnh trên Figma | Wireframe | Frame hi-fi, `docs/03-design-spec.md` gồm token, type scale, grid, ghi chú motion | Demi duyệt |
| 5 | Nền móng code | Claude | Design spec | Project, token, layout, routes | |
| 6 | Dựng section | Sixth | Task trên board, design spec | Component và trang tĩnh | Claude review |
| 7 | Motion | Claude | Trang đã dựng | Hiệu ứng GSAP, có reduced-motion | Demi xem thử |
| 8 | QA | Claude tìm lỗi, Sixth sửa | Bản chạy được | Task sửa lỗi trên board | Checklist mục 11 của `CLAUDE.md` |
| 9 | Ra mắt | Claude | Bản đã qua QA | Deploy | Demi duyệt trước khi public |

Bước 7 tách khỏi bước 6 để giao diện vẫn hoàn chỉnh khi không có animation.

## Luật bàn giao

1. Mọi việc đều là một dòng trên `tasks/BOARD.md`, có người làm, phạm vi file và tiêu chí xong.
2. Mỗi lần chỉ một agent làm việc trên một nhóm file. Hai agent không được chạy song song trên cùng file.
3. Làm xong: tự kiểm tra, commit với mã task (ví dụ `T-06: dựng Selected Work`), chuyển task sang `REVIEW`, ghi một dòng vào cột Ghi chú.
4. Nếu thiếu thông tin: chuyển task sang `BLOCKED` và ghi câu hỏi cho Demi. Không tự chế nội dung.
5. Chuyển lượt: Demi mở agent kia và nói "nhận task tiếp theo". Với Sixth, gõ workflow `/nhan-task.md`.

## Giới hạn Figma

Tài khoản đang dùng gói Starter, nên Figma MCP chỉ có khoảng 6 lượt đọc mỗi tháng. Các lệnh ghi vào Figma không bị tính theo tài liệu của Figma. Vì vậy:

- Chỉ Claude dùng Figma MCP. Sixth không cần kết nối Figma.
- Sau khi chốt thiết kế, Demi export PNG các frame vào `design/frames/`. Agent đọc ảnh và `docs/03-design-spec.md` thay vì đọc Figma.
- Lượt đọc Figma chỉ để dành cho các frame đã chốt.

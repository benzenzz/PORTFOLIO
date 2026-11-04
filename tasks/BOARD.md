# Bảng việc chung

Trạng thái: `TODO`, `DOING`, `REVIEW`, `BLOCKED`, `DONE`. Luật xem `PIPELINE.md`.

| ID | Bước | Việc | Người làm | Phạm vi file | Xong khi | Trạng thái | Ghi chú |
|---|---|---|---|---|---|---|---|
| T-01 | 0 | Kiểm kê toàn bộ tài sản dự án | Claude | `content-raw/INVENTORY.md` | Mỗi dự án có danh sách ảnh, video, tài liệu | DONE | Chưa mở nội dung file |
| T-02 | 1 | Phân tích moodboard, reference, CV | Claude | `docs/01-brief.md` | Demi xác nhận thông tin | DONE | Còn phần tài sản Demi cung cấp, xem plan |
| T-02b | 1 | Đọc chéo brief, chỉ ra chỗ mơ hồ hoặc thiếu căn cứ | Sixth | `docs/01-brief-review.md` | Có danh sách nhận xét, không sửa `docs/01-brief.md` | TODO | Cũng là bài chạy thử luật bàn giao |
| T-03 | 2 | Lập sitemap, nội dung, chọn stack | Claude | `docs/02-plan.md` | Demi duyệt | DONE | Demi đã duyệt |
| T-04 | 3 | Wireframe trên Figma | Claude | Figma | Đủ các trang trong plan | DOING | Hero, Selected Work, Case study xong; còn About, Playground, Contact |
| T-05 | 4 | Design draft và design spec | Claude, Demi | Figma, `docs/03-design-spec.md` | Demi duyệt | TODO | |

Các task code cho bước 5 đến 9 sẽ được Claude thêm sau khi chốt thiết kế.

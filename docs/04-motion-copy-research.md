# Phân tích animation và copy từ reference

Nguồn đo ngày 2026-11-04, bằng Edge headless ở 1440×900. Số liệu lấy từ code thật của site, trừ chỗ ghi "quan sát". File này là tư liệu cho T-14 và phần copy, chưa phải quyết định cuối. Mục 5 ghi phương án khi ref khác `CLAUDE.md`.

| Site | Stack | Vai trò |
|---|---|---|
| productionportugal.com (PP) | Webflow, GSAP 3.15, ScrollTrigger, SplitText, CustomEase, Lenis 1.2.3 | Ref animation chính |
| auge-xp.com (AUGE) | Next.js, GSAP 3.15, SplitText, ScrambleText, WebGL tự viết, Cookiebot | Ref animation phụ |
| suho.studio | Next.js, Lenis, nhiều canvas | Ref copy, không phân tích motion |

Repo đã có `gsap` 3.15.1, `lenis` 1.3.27, và gói gsap có sẵn `SplitText`, `CustomEase`, `ScrambleTextPlugin`. Mọi hiệu ứng trong file này làm được mà không thêm dependency.

## 1. Production Portugal

### Hệ thống chung

| Thứ | Giá trị |
|---|---|
| Lenis | `lerp: 0.085`, `smoothWheel: true`, `syncTouch: false`, chạy qua `gsap.ticker` |
| Ease vào chính | `cubic-bezier(0.16, 1, 0.3, 1)` và `(0.22, 1, 0.36, 1)` (trùng `--ease-out` của repo) |
| Ease wipe | fill `0.76, 0, 0.24, 1` hoặc `0.85, 0, 0.15, 1`; reveal `0.16, 1, 0.3, 1` hoặc `0.19, 1, 0.22, 1` |
| Micro | 320 đến 650ms: màu 360ms, transform 480 đến 650ms |
| Intro | Chỉ chạy một lần mỗi tab qua `sessionStorage`. Lần sau thay bằng page transition |

### Loader (5.2 giây, khóa cuộn)

Chuỗi thời gian, tính bằng giây:

| Mốc | Việc xảy ra |
|---|---|
| 0.2 | Hai cột list dự án chạy dọc từ dưới lên, dài 3.4s, ease `M0,0 C0.42,0 0.3,1 1,1`, cột phải trễ 0.05. Từng dòng hiện với stagger 0.024 |
| 0.75 | Tiêu đề wipe từng dòng: khối màu `scaleX 0→1` trong 0.46s từ phải, đặt chữ hiện, khối `scaleX 1→0` trong 0.4s về trái, stagger 0.065 |
| 2.65 | List mờ đi 0.95s |
| 2.95 | Nền texture mờ đi 0.62s |
| 3.6 | Chữ chuyển sang canvas: vẽ từng từ đúng vị trí DOM, nền màu, sau đó đục chữ xuyên nền bằng `destination-out` |
| 4.15 | Zoom xuyên qua chữ: `scale = 1200 ** progress` trong 0.9s (mobile 800), gốc zoom nằm ở 14% chiều ngang chữ "you" |
| 4.8 | Canvas mờ đi, hero bắt đầu xuất hiện |
| 5.2 | Xong, mở cuộn |

Trên mobile, loader dừng ở nút "Tap to roll the camera". Nếu reduced-motion thì bỏ qua hoàn toàn. Font chờ tối đa 600ms.

### Hero: chuyển video bằng ống kính (900ms)

Bước chuyển đáng giá nhất của site.

- Video mới đặt trên video cũ. Khung `clip-path: inset(50% 50%)→inset(0)`, ease `cubic-bezier(0.65, 0, 0.35, 1)`.
- Bên trong khung `scale(2)→scale(1)`, ease `cubic-bezier(0.33, 1, 0.68, 1)`.
- Opacity 0 đến 20% thời gian, tăng tới 90%.
- SVG `feColorMatrix` đổi màu 3 lần trong vùng khung rồi về bình thường ở 78%, kèm contrast tăng theo `1 + 0.24 * sin`. Đây là chỗ ra màu tím, chanh, xanh mint.
- Dùng Web Animations API, chỉ đổi khi video mới đã có frame (`readyState >= 2`).

### Hero: các chi tiết khác

| Hiệu ứng | Số liệu |
|---|---|
| List dự án vào lần lượt | start = `0.25 + cột*0.15 + hàng*0.025`, fill 0.24s, reveal 0.28s |
| Panel thông tin trượt lên | `yPercent 100→0`, 1.1s, ease `0.25, 0.1, 0.04, 1`, bắt đầu ở 0.35s |
| Đổi chữ theo dự án | Ra `y:-12` 0.24s `power2.in`; vào từ `y:12` 0.6s `power3.out`. Chiều cao tiêu đề được đo trước để không nhảy layout |
| Thanh tiến độ | Hàng đang chọn được tô theo `currentTime/duration`, lưu trong biến CSS |
| Parallax theo chuột | Video `scale(1.12)`, lệch tối đa `min(72px, 5%W)` và `min(48px, 5%H)`, làm mượt `1 - exp(-dt/220)`. Chỉ trên chuột thật |
| Hover hàng list | Lớp sáng `scaleX 0→1` từ phía chuột vào, chữ lệch theo chuột (`0.62` và `-0.28`), `letter-spacing 0.025em` |
| Nút Back/Next | Nam châm theo chuột, tối đa `min(12%W, 18px)`, `min(35%H, 9px)`, mũi tên bung ra |
| Thẻ next video | Hover hiện halftone: vẽ video xuống canvas 1/2, `grayscale(1) contrast(1.6)`, `multiply`, thêm lưới 5px opacity 0.55, fade 0.45s |

### Con trỏ khung ngắm

Rất hợp với ý tưởng khung ngắm đã có trong hero của Demi.

- Khung 28×28px, 4 góc 6px viền 1px, `mix-blend-mode: difference`.
- Vào phần tử tương tác: khung thành 52×32px trong 720ms, góc 8px đổi màu.
- Nhấn: 44×28px trong 180ms. Trên ô nhập: co lại `scale(0.35)` và mờ đi.
- Nhãn đi kèm trôi chậm hơn con trỏ (`1 - 0.9^(dt/16.7)`). Từng ký tự vào từ `translateY(±110%)`, ký tự lẻ đi từ trên xuống, 0.65s.
- Bị gỡ hẳn trên thiết bị cảm ứng. Không thấy `cursor: none` trong CSS inline, nên có thể con trỏ thật vẫn còn.

### Chuỗi cuộn trang chủ

Toàn trang là một section ghim: `end: +=6900`, `scrub: 1.2`, 4 panel chồng nhau trong một ô grid.

1. Panel About trượt lên, `yPercent 100→0`. Đoạn văn vào từ `y: 50vh`, 0.7s, stagger 0.09.
2. Tiêu đề lớn wipe từng dòng: fill 0.8s `0.85, 0, 0.15, 1`, reveal 0.8s `0.19, 1, 0.22, 1`, stagger 0.1.
3. Chuyển ngang: từng dòng tiêu đề bay `x: -200vw` so le, panel Brands `xPercent 100→0` đẩy vào từ phải.
4. Footer trồi lên `yPercent 120→0`, ease `power2.out`. Bên trong, video `scale 2→1` và `yPercent -68→0`, dòng tiêu đề từ `yPercent 105`, khối contact `clip-path inset(0 100% 0 0)→0`, metadata `x: 24`.

Mobile không scrub nội dung: panel chạy theo cuộn, chữ tự chạy một lần khi vào khung nhìn, kiểu thác nước (món sau bắt đầu khi món trước xong 20%).

### Chuyển trang (850ms)

5 dải ngang. Rời trang: `translateX(100%→0)`, 0.6s `cubic-bezier(0.4, 0, 0.2, 1)`, trễ từ dưới lên 0.06s mỗi dải. Vào trang: `translateX(0→-100%)` cùng thông số. Bỏ qua link `#`, `mailto:`, `tel:`, tab mới, Ctrl/Cmd click. Có xử lý nút Back của trình duyệt.

## 2. AUGE

### Hệ thống chung

Ease: `expoOut` (`0.19, 1, .22, 1`), `expoInOut` (`.83, 0, .17, 1`), `settleOut` (`0.5, 1, .89, 1`).

### Trang chủ: dải ảnh vô hạn

- Trang không cuộn thật: chiều cao đúng 900px. Bắt `wheel` với `passive: false`, đổi cuộn dọc thành chuyển động ngang vô hạn. Có kéo bằng chuột.
- Đọc wheel chuẩn hóa `deltaMode`, gộp thành cử chỉ khi cách nhau dưới 500ms, có quán tính khi nhả.
- Quan sát: ảnh cao thấp khác nhau, cạnh dưới tạo đường so le. Tự trôi nhẹ khi đứng yên, cú vào đầu trang chạy 3s rồi chậm dần.
- Không trích được hằng số track từ bundle minify, phần này chỉ tái tạo theo quan sát.

### Hover và chữ

| Hiệu ứng | Số liệu |
|---|---|
| Phóng ảnh khi hover | `scale 1.04`, 0.6s, `expoOut` |
| Nhãn "View project" | Nền vàng bám con trỏ, chữ scramble |
| Scramble khi hover | Trễ 0.12s, dài 0.6s, ease `none`, khóa chiều rộng để không nhảy dòng |
| Scramble khi hiện | Tự chạy ngẫu nhiên từng nhịp trên các nhãn đang thấy |
| Hàng list có màn trượt | Màn trắng `mix-blend-mode: difference` vào từ cạnh gần chuột nhất, `yPercent ±100→0`, 0.5s `expoOut`, chữ scramble lệch nhau 0.04s |
| Chữ né chuột (letter push) | Mỗi ký tự bị đẩy ngang tối đa 4px, bán kính = rộng ký tự TB × 2.4, lực `0.5(1 + cos(πd/r))`, làm mượt `1 - 0.86^dt` |
| Nút menu | Hộp đen nở ra thành 3 mục, mục đang trỏ nền vàng và scramble |

### Trang Works

Quan sát: list tên dự án chạy dọc quanh ảnh lớn ở giữa, cột thumbnail nhỏ bên trái như minimap, nền đảo trắng đen khi cuộn. Bố cục này rất gần Selected Work của Demi.

### Chuyển trang và phần khác

- Bấm dự án: ảnh bay từ vị trí cũ đến đúng ô trên trang mới bằng curtain, sau đó nhả ra. Bản chất là shared element transition.
- Có âm thanh hover và click, mặc định tắt, có nút bật.
- Có canvas WebGL `data-gl-*`, toàn bộ ảnh và chữ được vẽ lại trên GPU. Không đánh giá được hiệu ứng thật vì máy đo render bằng phần mềm.

## 3. Copy của Suho

### Cấu trúc câu chuyện

1. **Tên, nghề, cách làm:** "Suho. Video editor. Editing stories through SFX, Storytelling, Motion Design and Sound Design."
2. **Lời chào, chạy từng từ theo cuộn:** "Hi, nice to meet you. I'm Suho" rồi 4 chặng: bắt đầu, say nghề, khách hàng, phong cách. Mỗi chặng có nhãn nhỏ (Where it started, Falling for the craft).
3. **"On the clock."** Việc đi làm, mỗi dự án có 1 đến 2 câu nói video đó giải quyết việc gì.
4. **"Off the clock."** Việc tự làm: "A few things I made when I was supposed to be taking a break."
5. **"Creators who trust my edit."** Bằng chứng là tên và số subscriber, không tính từ.
6. **Kết:** "Open for work approximately now", "Let's make the next edit.", "Mostly YouTube channels, sometimes brand work."

### Kỹ thuật đáng học

| Kỹ thuật | Ví dụ | Vì sao hiệu quả |
|---|---|---|
| Xương sống hai vế | On the clock / Off the clock | Một ý chia đôi toàn site, người đọc nhớ được |
| Nói bằng ngôi "I", như nói chuyện | "I liked how these colours looked together" | Người thật, không phải profile công ty |
| Nói động cơ, không tự khen | "I wanted to try different transitions" | Cho thấy cách nghĩ, là thứ creative lead cần |
| Nói công dụng | "can make an app easier to introduce" | Hiểu mục đích của edit |
| Khiêm tốn có kiểm soát | "probably says the most about what I like", "approximately now" | Tự tin mà không phô |
| Microcopy theo từng bước | "Scroll to run the film", "Keep scrolling", "Press play to watch it in full" | Hướng dẫn thao tác mà vẫn giữ giọng nghề |
| Số thay tính từ | "PACKGOD, 5.53M subscribers" | Không cần chữ "top" hay "leading" |
| Kết bằng việc tiếp theo | "Let's make the next edit." | Lời mời, không phải form |
| Tiêu đề rất ngắn, có dấu chấm | "On the clock." | Nhịp câu như nhịp cắt |

### Áp dụng cho Demi

Học cách viết, không lấy câu của Suho. Không có dữ kiện mới nào dưới đây ngoài `docs/02-plan.md`, chỗ thiếu giữ ngoặc vuông.

| Chỗ | Đề xuất |
|---|---|
| Hero | Giữ câu của Demi: "I turn messages into rhythm, then use VFX and motion to push how far video can carry them." Câu này đã đúng giọng |
| Xương sống hai vế | Work là "For the brief.", Playground là "For the feel." Cần Demi chọn |
| Microcopy cuộn | "Scroll to scrub", "Keep cutting", "Press play for the full cut" |
| Dòng dự án | Công thức: làm gì cho ai, rồi một quyết định. "[Điều Demi muốn thử]. [Quyết định khó nhất]." |
| Bằng chứng MA26 | Giữ số đã có: 2.4M views, 37K+ interactions. Ghi rõ là kết quả chiến dịch của team 5 người |
| Playground | Mỗi món một câu "I wanted to [lý do thật]" |
| About | 3 chặng ngắn: [Demi bắt đầu edit thế nào], [lúc nào thấy mê nghề], làm gì hiện nay |
| Contact | "Open for remote work from December 2026." rồi "Send me the brief." |

Các dòng cần Demi cung cấp: mốc bắt đầu làm nghề, lý do tự làm từng món Playground, quyết định khó nhất của từng dự án.

## 4. Map hiệu ứng vào site

Ưu tiên theo mức hợp với site video editor. Cột cuối là việc phải thích nghi, vì Demi chỉ có đỏ và đen trắng.

| # | Hiệu ứng | Từ | Đặt ở | Thích nghi |
|---|---|---|---|---|
| 1 | Con trỏ khung ngắm kèm nhãn | PP | Toàn site, chỉ chuột thật | Góc đỏ `#FF343B`, giữ con trỏ thật |
| 2 | Chuyển video qua ống kính | PP | Video xem trước của Selected Work | Bỏ tím mint, chỉ đỏ và đen trắng. Rút còn khoảng 450ms vì chạy theo hover, PP chạy theo click |
| 3 | Wipe chữ từng dòng | PP | Tiêu đề section, tên case study | Khối màu ink hoặc paper, không dùng đỏ tràn lan |
| 4 | Màn trượt theo hướng chuột | AUGE | Hàng project | Kết hợp với chữ đổi đỏ trong spec |
| 5 | Thanh tiến độ trong hàng | PP | Hàng đang chọn | Mỏng, không tự chuyển dự án |
| 6 | Scramble nhãn mono | AUGE | Menu, metadata, tab | Chỉ khi hover và lúc hiện, không chạy ngẫu nhiên. Giữ `aria-label` |
| 7 | Parallax video theo chuột | PP | Hero | Giữ nguyên số liệu |
| 8 | Halftone khi hover | PP | Thẻ `PLAY SHOWREEL` | Hợp moodboard, nhả về ảnh rõ khi rời chuột |
| 9 | Chuyển trang 5 dải | PP | Toàn site | Viết cho Next router, 850ms theo mục 5 |
| 10 | Contact trồi lên kèm video | PP | Contact | Nằm trong chuỗi ghim của mục 5 |
| 11 | Đổi chữ theo dự án | PP | Khu metadata Selected Work | Đo trước chiều cao để tránh nhảy layout |
| 12 | Chữ né chuột | AUGE | Chữ ký "Demi Phan" | Chỉ chuột thật |
| 13 | Phóng ảnh 1.04 | AUGE | Ảnh, thumbnail Playground | Giữ nguyên |
| 14 | Wipe list theo hàng | PP | Lúc list lọt vào màn hình | Tổng thời gian dưới 1s |

Không làm: âm thanh hover, WebGL vẽ lại toàn trang, nút chạm để vào site, tự chuyển dự án theo video.

## 5. Quyết định khi ref khác `CLAUDE.md`

Demi đã chốt: phần animation ưu tiên ref, không cần theo `CLAUDE.md` 100%. Bảng dưới là phương án mới, chỉ thêm những gì để site không bị kẹt và vẫn dùng được.

| Hiệu ứng ref | Trước đây | Phương án theo ref |
|---|---|---|
| Loader khoảng 5s | Rút dưới 2s | Giữ đủ chuỗi list, wipe, zoom xuyên chữ, dùng tên dự án thật. Thay khóa cuộn bằng bỏ qua: cuộn, bấm hoặc nhấn phím là vào site ngay. Một lần mỗi tab |
| Ghim trang, panel chuyển ngang | Chỉ ghim Selected Work | Làm trên desktop, dùng cuộn thật có scrub. Mobile theo cách của PP. Khi design phải gộp với list lặp 200vh và sửa dòng hero không ghim trong plan |
| AUGE bắt wheel | Không dùng | Không dùng ở trang chủ vì đụng ghim của PP. Có thể dùng cho Playground, kèm phím mũi tên và vuốt |
| Chuyển trang 850ms | Rút còn 500ms | Giữ 850ms, bỏ qua link `#`, tab mới, Ctrl/Cmd click như ref |
| Tím, mint, vàng | Thay bằng đỏ, đen trắng | Nền tối: đen, trắng, đỏ. Nền sáng: xám, tím, vàng, xem mục 5b |
| Nhấp màu khi chuyển video | Một nhịp | Giữ 3 nhịp như ref, đo để không quá 3 lần chớp mỗi giây |

Vẫn giữ, vì thiếu thì có người không dùng được site: reduced-motion, bàn phím, cảm ứng, không có bước nào bắt chờ mà không bỏ qua được, nội dung vẫn đọc được khi JS animation hỏng.

Với mọi hiệu ứng: tái tạo cơ chế bằng code mới, không chép code, câu chữ, font trả phí hay hình của ref. Font `Neue Haas Grotesk`, `PP Eiko`, `PP Neue Montreal`, `Greed` đều là font trả phí, site giữ Inter Tight và Chivo Mono theo spec.

Reduced-motion: tắt 1, 2 (đổi tức thì), 3, 4, 6, 7, 8, 9, 10, 12. Chữ và ảnh phải đọc được khi JS animation hỏng.

## 5b. Bảng màu theo nền (ĐÃ HỦY: Demi quay lại đen, trắng, đỏ cho cả hai nền)

Demi chốt: nền tối dùng đen, trắng, đỏ; nền sáng dùng xám, tím, vàng. Giả định "mode" là theo nền từng trang như spec, không làm nút đổi giao diện: Hero, Case study, About, Contact là nền tối; Work, Playground là nền sáng.

| Vai trò | Nền tối | Nền sáng |
|---|---|---|
| Nền | `#101010` | `#E5E4E2` |
| Chữ chính | `#F5F4F0` | `#3A0F34` |
| Điểm nhấn | `#FF343B` | `#EAAA00` |
| Chữ trên điểm nhấn | `#101010` | `#3A0F34` |
| Chữ phụ | `#B8B8B8` | `#5F5A5E` |
| Chữ lớn chưa chọn | `#8C8C8C` | `#7A7478` |
| Đường kẻ | `rgba(255,255,255,.2)` | `rgba(58,15,52,.16)` |
| Focus | `#FF343B` | `#3A0F34` |

Tương phản đo được: tím trên xám 12.7:1, tím trên vàng 7.9:1, vàng trên xám chỉ 1.6:1.

**Luật cho vàng:** không dùng vàng làm chữ hoặc viền mỏng trên nền xám. Vàng chỉ là mảng nền có chữ tím: nút CONTACT, hàng đang chọn, thanh tiến độ, khối wipe.

Trên nền sáng, hàng đang chọn không đổi chữ sang màu nhấn như nền tối mà lót khối vàng dưới chữ tím. Spec chưa đổi, sẽ cập nhật ở bước design để không ảnh hưởng Sixth đang dựng.

Màu của nhịp đổi màu khi chuyển video đi theo nền: đỏ ở nền tối, tím và vàng ở nền sáng.

## 6. Chưa kiểm được

- Chưa đo trên điện thoại thật. Hành vi mobile của PP chỉ đọc từ code. Hover của AUGE trên cảm ứng chưa xem.
- Video và WebGL render bằng phần mềm nên không đánh giá được độ mượt thật. FPS ở máy người dùng chưa đo.
- Hằng số track của AUGE không lấy được, phần đó là quan sát.
- Motion của Suho không phân tích, vì Demi chỉ dùng site này làm ref copy.
- Các trang con ngoài `/work` của PP và trang chi tiết dự án của AUGE chưa mở.

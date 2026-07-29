# 🎯 SẢN PHẨM MẪU (MVP / DEMO)

> **Triết lý thiết kế:** *Với D-SHIFTIFY, người khiếm thị không "cố dùng" một app dành cho người sáng mắt — họ dùng một app sinh ra cho chính họ. Giọng nói là giao diện, không phải tính năng phụ.*

## 👤 Trải nghiệm Ứng viên — "Nghe được việc làm, thay vì nhìn thấy nó"

Thiết kế **tối giản, đạt chuẩn quốc tế WCAG 2.2** — không phải để tuân thủ cho có, mà vì mỗi chi tiết là một rào cản được gỡ bỏ:

- **Không giới hạn thời gian thao tác** — người dùng thao tác theo nhịp của mình, không bị "timeout" đẩy ra ngoài.
- **Nút bấm lớn, tương phản cao** — hỗ trợ cả nhóm suy giảm thị lực (nhìn mờ), không chỉ mù hoàn toàn.
- **Trợ lý Giọng nói chủ động dẫn dắt:** Ngay khi mở app, trợ lý tự động chào và hướng dẫn — ứng viên **không cần chạm mù mẫm để tìm nút bắt đầu**. Toàn bộ hành trình, từ tạo hồ sơ đến ứng tuyển, diễn ra **hoàn toàn bằng giọng nói**.
- **"Match Score" có lời giải thích bằng âm thanh:** Đây là điểm chạm khác biệt. Hệ thống không chỉ đọc con số "khớp 92%" — nó **giải thích *tại sao* bằng âm thanh rõ ràng**:

  > 🔊 *"Công việc Nhập liệu tại công ty A khớp 92% với bạn — vì bạn gõ nhanh, đã thành thạo trình đọc màn hình, và công ty cho phép làm việc từ xa, phù hợp với thiết bị bạn đang dùng."*

  Người khiếm thị **hiểu được lý do**, nên tin tưởng và chủ động ứng tuyển — thay vì bị bỏ lại phía sau một con số vô hồn.

## 🏢 Trải nghiệm Doanh nghiệp — "Đảo ngược thế cờ tuyển dụng"

Thông thường ứng viên phải rải CV và chờ đợi. D-SHIFTIFY lật ngược lại: **doanh nghiệp chủ động đi tìm người.**

1. HR chỉ cần **upload một file JD thô** (hoặc dán mô tả công việc chưa chỉnh sửa).
2. Hệ thống **tự động điền form tuyển dụng** — HR không mất công nhập tay.
3. AI chấm **Inclusive Score (Điểm Bao hàm)** — đo mức độ "thân thiện" của công việc với người khuyết tật *(vị trí này remote được không? cần điều chỉnh môi trường gì?)*, đồng thời gợi ý HR cách viết JD bao hàm hơn.
4. **Lập tức hiển thị ngay trên màn hình danh sách ứng viên khiếm thị có kỹ năng khớp nhất** — kèm lý do khớp — để HR **chủ động liên hệ**.

> **Kết quả:** Chỉ tiêu ESG/DEI của doanh nghiệp — thứ trước đây nằm trên giấy vì "không tìm được ứng viên phù hợp" — nay được lấp đầy trong vài phút.

---

# ⚙️ ỨNG DỤNG CÔNG NGHỆ

| Công nghệ | Vai trò & Giá trị khác biệt |
|---|---|
| **🗣️ NLP & Speech-to-Text** | Chuyển giọng nói thành văn bản, và — điểm cốt lõi — **tự động "phiên dịch" ngôn ngữ đời thường thành ngôn ngữ kỹ năng chuyên ngành.** Ứng viên nói *"em nghe rồi gõ lại nhanh lắm"*, AI hiểu thành *"kỹ năng Transcription / Data Entry tốc độ cao"* — khớp đúng từ khóa JD mà trước đây họ luôn bị trượt. |
| **👁️ Computer Vision & Screen Reader Integration** | AI **nhận diện hình ảnh/môi trường và mô tả lại bằng âm thanh**, kết hợp hoàn hảo với các trình đọc màn hình phổ biến (JAWS, Apple VoiceOver, TalkBack). Người dùng không bị "mù thông tin" trước nội dung hình ảnh. |
| **🔒 Privacy-Preserving AI (Zero Data Retention)** | Kiến trúc **không lưu trữ dữ liệu rác**: dữ liệu sức khỏe nhạy cảm của người khuyết tật **bị xóa ngay sau khi AI xử lý xong** — không lưu lại, **không bị dùng để huấn luyện mô hình trái phép.** Đây vừa là cam kết đạo đức, vừa là lá chắn pháp lý (GDPR / Nghị định 13 về bảo vệ dữ liệu cá nhân). |

> **Vì sao bộ ba công nghệ này là một "moat" (rào cản cạnh tranh)?**
>
> Ba lớp công nghệ không rời rạc — chúng **hợp lực thành một hành trình accessible khép kín**: NLP gỡ rào cản *ngôn ngữ*, Computer Vision gỡ rào cản *thị giác*, Zero Data Retention gỡ rào cản *niềm tin*. Đối thủ có thể sao chép một tính năng, nhưng khó sao chép cả một hệ trải nghiệm được thiết kế lấy người khiếm thị làm trung tâm ngay từ dòng code đầu tiên.

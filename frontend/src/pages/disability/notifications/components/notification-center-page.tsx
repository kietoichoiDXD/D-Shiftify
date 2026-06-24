import { Card, CardContent } from '@/components/ui/card'

const notifications = [
  {
    id: 'noti-1',
    tag: 'Phỏng vấn',
    title: 'ABC Software đã xem CV của bạn',
    body: 'Hồ sơ Backend Developer đạt mức phù hợp 96%. Hãy xác nhận lịch phỏng vấn trực tuyến.'
  },
  {
    id: 'noti-2',
    tag: 'Hồ sơ',
    title: 'Cần bổ sung thiết bị hiện có',
    body: 'Thêm thông tin laptop/headset giúp AI matching tính điểm thiết bị chính xác hơn.'
  },
  {
    id: 'noti-3',
    tag: 'Đào tạo',
    title: 'Khóa học NodeJS mới từ trung tâm đào tạo',
    body: 'Khóa học có transcript và bài tập đọc được bằng screen reader.'
  }
]

export function NotificationCenterPage() {
  return (
    <section className='mx-auto w-full max-w-[1280px] bg-[#FAFAFA] px-5 py-8 sm:px-6'>
      <header className='mb-8 border-b border-[#E3E8F0] pb-6'>
        <p className='text-xs font-black uppercase tracking-[0.28em] text-[#006EFF]'>Thông báo</p>
        <h1 className='mt-2 text-[42px] font-black leading-none text-[#111]'>Thông báo của bạn</h1>
        <p className='mt-4 max-w-2xl text-[15px] leading-7 text-[#334155]'>
          Cập nhật từ nhà tuyển dụng, AI coach và trung tâm đào tạo.
        </p>
      </header>

      <div className='grid gap-4 md:grid-cols-3'>
        {notifications.map((item) => (
          <Card key={item.id} className='border-[#D9E2F0] bg-white shadow-[0_10px_32px_rgba(0,64,128,0.08)]'>
            <CardContent className='p-5'>
              <span className='inline-flex rounded-md bg-[#EAF4FF] px-2 py-1 text-xs font-bold text-[#004080]'>{item.tag}</span>
              <h2 className='mt-4 text-lg font-black text-slate-950'>{item.title}</h2>
              <p className='mt-2 text-sm leading-6 text-slate-600'>{item.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

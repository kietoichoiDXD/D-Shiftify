import { motion } from 'framer-motion'
import { Mic, Volume2, ShieldAlert, HeartHandshake, School } from 'lucide-react'
import { speakAccessibleText } from '@/core/services/speech.service'

const features = [
  {
    icon: Mic,
    title: 'Trợ lý Giọng nói (STT & TTS)',
    description: 'Hỗ trợ điều khiển đầu vào giọng nói tiếng Việt (Speech-to-Text) cực nhạy và trợ năng đọc to nhãn, văn bản (Text-to-Speech) thông qua AI Google Cloud. Tối ưu hoàn hảo cho người khiếm thị.',
    voiceText: 'Tính năng Trợ lý Giọng nói hỗ trợ nhận diện và đọc to nội dung trực tiếp bằng công nghệ AI của Google.'
  },
  {
    icon: HeartHandshake,
    title: 'Đánh giá Thiết bị Hỗ trợ',
    description: 'Tự động kiểm tra độ tương thích giữa thiết bị hỗ trợ ứng viên đang sở hữu (như máy đọc màn hình, màn hình chữ nổi, camera giám sát) với yêu cầu môi trường làm việc của nhà tuyển dụng.',
    voiceText: 'Tính năng Đánh giá Thiết bị Hỗ trợ giúp tính toán sự tương thích phần cứng và công cụ hỗ trợ giữa ứng viên và công ty.'
  },
  {
    icon: School,
    title: 'Hợp tác Đơn vị Đào tạo',
    description: 'Cầu nối liên kết giữa trung tâm đào tạo nghề người khuyết tật với doanh nghiệp. Quản lý lớp học, cấp chứng chỉ đầu ra và giới thiệu ứng viên đã qua đào tạo trực tiếp cho nhà tuyển dụng.',
    voiceText: 'Tính năng Hợp tác Đơn vị Đào tạo tạo ra liên kết chặt chẽ giữa nhà trường, học viên khuyết tật và doanh nghiệp.'
  }
]

export const FeaturesSection = () => {
  const handleSpeakFeature = (text: string) => {
    speakAccessibleText(text)
  }

  return (
    <section id='features' className='py-24 bg-[#0C0C0E] border-t border-slate-900 text-white relative overflow-hidden'>
      {/* Background ambient light */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none' />

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        <div className='text-center mb-20 space-y-4'>
          <h2 className='text-3xl sm:text-4xl font-black uppercase tracking-tight text-white'>
            Tính năng cốt lõi
          </h2>
          <p className='text-lg text-slate-400 font-medium max-w-3xl mx-auto'>
            Thiết kế đặc biệt mang lại trải nghiệm tiếp cận không rào cản cho cả ứng viên khuyết tật, nhà tuyển dụng và trung tâm dạy nghề.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className='bg-[#111115]/60 border border-slate-800 hover:border-indigo-500/40 p-8 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all flex flex-col justify-between group rounded-none'
            >
              <div className='text-left space-y-5'>
                <div className='w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center rounded-none group-hover:bg-indigo-600 group-hover:text-white transition-all'>
                  <feature.icon className='w-6 h-6' />
                </div>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-black uppercase text-white'>{feature.title}</h3>
                  <button
                    type='button'
                    onClick={() => handleSpeakFeature(feature.voiceText)}
                    aria-label={`Nghe giới thiệu về ${feature.title}`}
                    className='text-slate-400 hover:text-white transition focus:outline-none'
                  >
                    <Volume2 className='w-4 h-4' />
                  </button>
                </div>
                <p className='text-sm text-slate-400 leading-relaxed font-medium'>{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { Link } from 'react-router-dom'

export const AuthFooter = () => (
  <footer className='relative z-10 px-4 pb-6 text-center text-[10px] text-brand-primary/80 lg:hidden'>
    <p>&copy; 2026 D-SHIFTIFY. Xây dựng cho khả năng tiếp cận.</p>
    <div className='mt-1 flex justify-center gap-3'>
      <Link to='/' className='underline-offset-2 hover:underline'>
        Chính sách bảo mật
      </Link>
      <Link to='/' className='underline-offset-2 hover:underline'>
        Điều khoản
      </Link>
      <Link to='/' className='underline-offset-2 hover:underline'>
        Hỗ trợ
      </Link>
    </div>
  </footer>
)

import { LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import Logo from '@/components/logo/logo'
import { ThemeToggle } from '@/components/theme/theme-toogle'
import { useAuthStore } from '@/core/store/features/auth/authStore'

export default function TopNavigation() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className='h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-40'>
      {/* Left: Logo */}
      <div className='flex items-center'>
        <Logo />
      </div>

      {/* Center: Navigation Tabs */}
      <div className='hidden md:flex items-center gap-8'>
        <a href='/dashboard' className='text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors'>
          DASHBOARD
        </a>
        <a
          href='/messages'
          className='text-blue-700 border-b-2 border-blue-700 pb-1 text-sm font-bold transition-colors'
          aria-current='page'
        >
          TIN NHẮN
        </a>
        <a href='/candidates' className='text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors'>
          ỨNG VIÊN
        </a>
      </div>

      {/* Right: User Menu */}
      <div className='flex items-center gap-4'>
        <ThemeToggle />

        <div className='flex items-center gap-3 pl-4 border-l border-gray-200'>
          {user && (
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center'>
                <User size={16} className='text-white' />
              </div>
              <span className='text-sm font-medium text-gray-900 hidden sm:inline'>{user.name}</span>
            </div>
          )}

          <button
            onClick={handleLogout}
            aria-label='Logout'
            className='p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  )
}

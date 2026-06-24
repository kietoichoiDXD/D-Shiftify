import { Building2, GraduationCap } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'

export default function DisabilityMessagesLayout() {
  return (
    <div className='h-screen flex flex-col bg-white'>
      {/* Tab Navigation */}
      <div className='px-6 py-3 border-b border-gray-100 flex items-center gap-4'>
        <h1 className='text-lg font-semibold text-gray-900 tracking-tight'>Tin nhắn</h1>
        <div className='flex gap-1.5 ml-auto'>
          <NavLink
            to={ROUTE.DISABILITY.MESSAGES_BUSINESS}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Building2 size={16} />
            Công ty
          </NavLink>
          <NavLink
            to={ROUTE.DISABILITY.MESSAGES_EDUCATOR}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <GraduationCap size={16} />
            Cơ sở đào tạo
          </NavLink>
        </div>
      </div>

      {/* Render Sub-route Content */}
      <div className='flex-1 overflow-hidden'>
        <Outlet />
      </div>
    </div>
  )
}

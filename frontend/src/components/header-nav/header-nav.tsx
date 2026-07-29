import { useState } from 'react'

import { Menu, X, LogOut, User, Sparkles, LayoutDashboard, MessageSquare, FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { LanguageSwitcher } from '@/components/language/language-switcher'
import Logo from '@/components/logo/logo'
import { ThemeToggle } from '@/components/theme/theme-toogle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ROUTE } from '@/core/constants/path'
import { getDashboardRouteByRole, getMatchingRouteByRole } from '@/core/helpers/auth-route'
import { useAuthStore } from '@/core/store/features/auth/authStore'

const navLinks = [
  { labelKey: 'features.title', to: '#features' },
  { labelKey: 'techStack.title', to: '#tech-stack' },
  { labelKey: 'gettingStarted.title', to: '#getting-started' }
]

const handleSmoothScroll = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, to: string) => {
  e.preventDefault()
  const el = document.querySelector(to)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const Header = () => {
  const { t } = useTranslation('home')
  const { t: tAuth } = useTranslation('auth')
  const [menuOpen, setMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()

  const getInitials = (name: string) => {
    return (name || 'U')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const handleLogout = () => logout()

  const UserMenuContent = () => (
    <div className='space-y-3 p-1'>
      <div className='space-y-1 pb-2 border-b border-gray-100 dark:border-gray-800'>
        <p className='text-sm font-semibold truncate text-gray-900 dark:text-white'>{user?.name || user?.fullName || user?.email}</p>
        <p className='text-xs text-gray-500 dark:text-gray-400 truncate'>{user?.email}</p>
      </div>
      <div className='space-y-1'>
        <Button variant='ghost' asChild className='w-full justify-start text-xs font-semibold h-9 px-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400'>
          <Link to={getMatchingRouteByRole(user?.role)} className='flex items-center gap-2'>
            <Sparkles className='w-4 h-4 text-brand-primary' />
            <span>Ghép nối AI & Việc làm</span>
          </Link>
        </Button>
        <Button variant='ghost' asChild className='w-full justify-start text-xs font-semibold h-9 px-2'>
          <Link to={ROUTE.DISABILITY.CV_CREATE} className='flex items-center gap-2'>
            <FileText className='w-4 h-4 text-slate-500' />
            <span>Tạo & Cập nhật CV</span>
          </Link>
        </Button>
        <Button variant='ghost' asChild className='w-full justify-start text-xs font-semibold h-9 px-2'>
          <Link to={getDashboardRouteByRole(user?.role)} className='flex items-center gap-2'>
            <LayoutDashboard className='w-4 h-4 text-slate-500' />
            <span>Bảng điều khiển</span>
          </Link>
        </Button>
        <Button variant='ghost' asChild className='w-full justify-start text-xs font-semibold h-9 px-2'>
          <Link to={ROUTE.COMMON_PRIVATE.CHAT} className='flex items-center gap-2'>
            <MessageSquare className='w-4 h-4 text-slate-500' />
            <span>Trò chuyện</span>
          </Link>
        </Button>
        <Button variant='ghost' asChild className='w-full justify-start text-xs font-semibold h-9 px-2'>
          <Link to={ROUTE.COMMON_PRIVATE.ACCOUNT_SETTINGS} className='flex items-center gap-2'>
            <User className='w-4 h-4 text-slate-500' />
            <span>Hồ sơ cá nhân</span>
          </Link>
        </Button>
        <div className='pt-1 border-t border-gray-100 dark:border-gray-800'>
          <Button variant='destructive' className='w-full text-xs font-semibold h-9' onClick={handleLogout}>
            <LogOut className='mr-2 w-4 h-4' />
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <header className='fixed top-0 left-0 z-50 w-full border-b border-brand-border backdrop-blur bg-gradient-to-r from-brand-bg-start/95 to-brand-bg-end/95 dark:bg-gray-900/80 dark:border-gray-800'>
      <nav className='container flex justify-between items-center px-4 py-3 mx-auto'>
        <Logo />

        <ul className='hidden gap-6 items-center md:flex'>
          {isAuthenticated ? (
            <>
              <li>
                <Link
                  to={getMatchingRouteByRole(user?.role)}
                  className='inline-flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-full transition-all hover:bg-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300'
                >
                  <Sparkles className='w-3.5 h-3.5 animate-pulse text-indigo-600 dark:text-indigo-400' />
                  <span>Ghép nối AI</span>
                </Link>
              </li>
              <li>
                <Link
                  to={getDashboardRouteByRole(user?.role)}
                  className='px-2 py-1 font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary transition-colors text-sm'
                >
                  Bảng điều khiển
                </Link>
              </li>
              <li>
                <Link
                  to={ROUTE.COMMON_PRIVATE.CHAT}
                  className='px-2 py-1 font-medium text-gray-700 dark:text-gray-200 hover:text-brand-primary transition-colors text-sm'
                >
                  Trò chuyện
                </Link>
              </li>
            </>
          ) : (
            navLinks.map((link) => (
              <li key={link.to}>
                <button
                  onClick={(e) => handleSmoothScroll(e, link.to)}
                  className='px-2 py-1 font-medium text-gray-700 bg-transparent rounded border-none transition-colors cursor-pointer dark:text-gray-200 hover:text-brand-primary dark:hover:text-brand-bg-end focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
                  tabIndex={0}
                  aria-label={t(`home.${link.labelKey}`)}
                >
                  {t(`home.${link.labelKey}`)}
                </button>
              </li>
            ))
          )}
        </ul>

        <div className='flex gap-4 items-center'>
          <ThemeToggle />
          <LanguageSwitcher />

          {isAuthenticated ? (
            <div className='flex'>
              <Popover>
                <PopoverTrigger asChild>
                  <div
                    role='button'
                    tabIndex={0}
                    className='relative w-10 h-10 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ring-2 ring-indigo-500/20'
                  >
                    <Avatar className='w-10 h-10'>
                      <AvatarImage src={'/images/avatar.png'} alt={user?.name || user?.fullName} />
                      <AvatarFallback className='bg-indigo-600 text-white font-bold text-xs'>
                        {getInitials(user?.name || user?.fullName || user?.email || '')}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </PopoverTrigger>
                <PopoverContent className='p-3 w-64' align='end'>
                  <UserMenuContent />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className='hidden gap-2 items-center md:flex'>
              <Button
                variant='outline'
                className='px-4 py-2 font-medium rounded-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-primary'
              >
                <Link to={ROUTE.PUBLIC.LOGIN}>{tAuth('auth.login')}</Link>
              </Button>
              <Button className='px-4 py-2 font-medium text-white bg-brand-primary rounded-md transition-all duration-200 hover:bg-brand-primary-hover focus-visible:ring-2 focus-visible:ring-brand-primary'>
                <Link to={ROUTE.PUBLIC.REGISTER}>{tAuth('auth.register')}</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className='flex justify-center items-center p-2 rounded md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className='w-7 h-7 text-gray-700 dark:text-gray-200' />
          ) : (
            <Menu className='w-7 h-7 text-gray-700 dark:text-gray-200' />
          )}
        </button>
      </nav>

      {/* Mobile nav menu */}
      {menuOpen && (
        <div className='absolute left-0 top-full w-full bg-white border-b border-brand-border shadow-lg md:hidden dark:bg-gray-900 dark:border-gray-800 animate-fade-in'>
          <ul className='flex flex-col gap-2 p-4'>
            {isAuthenticated ? (
              <>
                <li>
                  <Link
                    to={getMatchingRouteByRole(user?.role)}
                    onClick={() => setMenuOpen(false)}
                    className='flex items-center gap-2 p-2.5 font-bold text-xs uppercase tracking-wider text-indigo-700 bg-indigo-50 rounded-lg dark:bg-indigo-950/40 dark:text-indigo-300'
                  >
                    <Sparkles className='w-4 h-4 text-indigo-600' />
                    <span>Ghép nối AI & Việc làm</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={getDashboardRouteByRole(user?.role)}
                    onClick={() => setMenuOpen(false)}
                    className='block p-2 font-medium text-gray-700 dark:text-gray-200'
                  >
                    Bảng điều khiển
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTE.COMMON_PRIVATE.CHAT}
                    onClick={() => setMenuOpen(false)}
                    className='block p-2 font-medium text-gray-700 dark:text-gray-200'
                  >
                    Trò chuyện
                  </Link>
                </li>
              </>
            ) : (
              navLinks.map((link) => (
                <li key={link.to}>
                  <button
                    onClick={(e) => {
                      handleSmoothScroll(e, link.to)
                      setMenuOpen(false)
                    }}
                    className='px-2 py-2 w-full font-medium text-left text-gray-700 bg-transparent rounded border-none transition-colors cursor-pointer dark:text-gray-200 hover:text-brand-primary dark:hover:text-brand-bg-end focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary'
                    tabIndex={0}
                    aria-label={t(`home.${link.labelKey}`)}
                  >
                    {t(`home.${link.labelKey}`)}
                  </button>
                </li>
              ))
            )}
            {!isAuthenticated && (
              <div className='flex flex-col gap-2 pt-2'>
                <Button
                  variant='outline'
                  className='px-4 py-2 font-medium rounded-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-primary'
                >
                  <Link to={ROUTE.PUBLIC.LOGIN} onClick={() => setMenuOpen(false)}>
                    {tAuth('auth.login')}
                  </Link>
                </Button>
                <Button className='px-4 py-2 font-medium text-white bg-brand-primary rounded-md transition-all duration-200 hover:bg-brand-primary-hover focus-visible:ring-2 focus-visible:ring-brand-primary'>
                  <Link to={ROUTE.PUBLIC.REGISTER} onClick={() => setMenuOpen(false)}>
                    {tAuth('auth.register')}
                  </Link>
                </Button>
              </div>
            )}
          </ul>
        </div>
      )}
      <style>{`html { scroll-behavior: smooth; }`}</style>
    </header>
  )
}

export default Header


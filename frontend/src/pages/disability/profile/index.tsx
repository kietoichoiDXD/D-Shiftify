import { Loader2, Mail, MapPin, Phone, Volume2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ROUTE } from '@/core/constants/path'
import { speakAccessibleText } from '@/core/services/speech.service'
import { useCandidateProfile } from '@/hooks/useCandidateProfile'

function SpeakButton({ text, label, size = 'sm' }: { text: string; label: string; size?: 'sm' | 'md' }) {
  return (
    <button
      type='button'
      aria-label={label}
      onClick={() => void speakAccessibleText(text)}
      className='inline-flex shrink-0 items-center justify-center rounded-full text-[#004080] transition hover:bg-[#EAF4FF]'
      style={{ width: size === 'md' ? 40 : 36, height: size === 'md' ? 40 : 36 }}
    >
      <Volume2 className={size === 'md' ? 'size-5' : 'size-4'} />
    </button>
  )
}

export default function DisabilityProfilePage() {
  const { profile, isLoading, error } = useCandidateProfile()

  if (isLoading) {
    return (
      <div className='flex min-h-[40vh] items-center justify-center text-[#004080]'>
        <Loader2 className='size-7 animate-spin' aria-label='Đang tải hồ sơ' />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className='mx-auto w-full max-w-[820px] px-4 py-16 text-center'>
        <h1 className='text-2xl font-black text-[#004080]'>Chưa có thông tin hồ sơ</h1>
        <p className='mt-2 text-[#5A718B]'>Hãy cập nhật thông tin cá nhân để doanh nghiệp hiểu rõ hơn về bạn.</p>
        <Link
          to={ROUTE.DISABILITY.PROFILE_UPDATE}
          className='mt-5 inline-block bg-[#004080] px-6 py-3 font-bold text-white transition hover:bg-[#003466]'
        >
          Cập nhật thông tin
        </Link>
      </div>
    )
  }

  const summary = `Hồ sơ của ${profile.fullName}. ${profile.headline ?? ''}. ${profile.bio ?? ''}`

  return (
    <div className='mx-auto w-full max-w-[900px] px-4 py-10 sm:px-6'>
      <div className='border border-[#CFE3F7] bg-white shadow-sm'>
        <div className='flex flex-col gap-5 border-b border-[#EAF4FF] bg-gradient-to-r from-[#004080] to-[#0A57A8] p-6 text-white sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='flex size-16 items-center justify-center overflow-hidden rounded-md bg-white/15 text-xl font-black'>
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={`Ảnh đại diện ${profile.fullName}`} className='size-full object-cover' />
              ) : (
                profile.fullName.slice(0, 1).toUpperCase()
              )}
            </div>
            <div>
              <h1 className='text-balance text-2xl font-black'>{profile.fullName}</h1>
              {profile.headline ? <p className='mt-1 text-sm text-white/85'>{profile.headline}</p> : null}
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <SpeakButton text={summary} label='Nghe tóm tắt hồ sơ' size='md' />
            <Link
              to={ROUTE.DISABILITY.PROFILE_UPDATE}
              className='bg-white px-4 py-2 text-sm font-bold text-[#004080] transition hover:bg-[#EAF4FF]'
            >
              Chỉnh sửa
            </Link>
          </div>
        </div>

        <dl className='grid gap-4 p-6 sm:grid-cols-2'>
          <Field icon={<Mail className='size-4' />} label='Email' value={profile.email} />
          {profile.phone ? <Field icon={<Phone className='size-4' />} label='Số điện thoại' value={profile.phone} /> : null}
          {profile.location ? <Field icon={<MapPin className='size-4' />} label='Địa chỉ' value={profile.location} /> : null}
        </dl>

        {profile.bio ? (
          <section className='border-t border-[#EAF4FF] p-6'>
            <div className='flex items-center gap-2'>
              <h2 className='text-sm font-black uppercase tracking-[0.04em] text-[#004080]'>Giới thiệu</h2>
              <SpeakButton text={profile.bio} label='Nghe phần giới thiệu' />
            </div>
            <p className='mt-2 text-pretty leading-7 text-[#33506E]'>{profile.bio}</p>
          </section>
        ) : null}

        {profile.skills.length > 0 ? (
          <section className='border-t border-[#EAF4FF] p-6'>
            <h2 className='text-sm font-black uppercase tracking-[0.04em] text-[#004080]'>Kỹ năng</h2>
            <ul className='mt-3 flex flex-wrap gap-2'>
              {profile.skills.map((skill) => (
                <li key={skill} className='rounded-full bg-[#EAF4FF] px-3 py-1 text-sm font-semibold text-[#004080]'>
                  {skill}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  )
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className='flex items-start gap-3'>
      <span className='mt-0.5 inline-flex size-9 items-center justify-center rounded-md bg-[#EAF4FF] text-[#004080]'>{icon}</span>
      <div>
        <dt className='text-xs font-bold uppercase tracking-[0.04em] text-[#5A718B]'>{label}</dt>
        <dd className='mt-0.5 font-semibold text-[#102033]'>{value}</dd>
      </div>
    </div>
  )
}

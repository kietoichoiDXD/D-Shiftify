import { useEffect, useState } from 'react'
import { Volume2, Loader2 } from 'lucide-react'

import { trainingApi, type TrainingCenterProfile } from '@/core/services/training.service'
import { cvApi } from '@/core/services/cv.service'
import { speakAccessibleText } from '@/core/services/speech.service'
import toastifyCommon from '@/core/lib/toastify-common'
import { cn } from '@/core/lib/utils'

import { FigmaField, PrimaryAction, UploadBox, Chip } from './form-controls'
import { AnimatedButton } from './interactive'
import { WorkspaceShell } from './workspace-shell'

export function FigmaEducatorProfilePage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploadingLicense, setUploadingLicense] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Profile states
  const [name, setName] = useState('')
  const [slogan, setSlogan] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('')
  const [address, setAddress] = useState('')
  const [organizationType, setOrganizationType] = useState('Trường nghề nhà nước')
  
  const [supportForDisabled, setSupportForDisabled] = useState<string[]>(['Khiếm thị'])
  const [customGroup, setCustomGroup] = useState('')
  
  const [partnerCompanies, setPartnerCompanies] = useState('')
  const [achievements, setAchievements] = useState('')
  
  const [licenseFile, setLicenseFile] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await trainingApi.getMine()
        if (data) {
          setName(data.name || '')
          setSlogan(data.slogan || '')
          setPhone(data.phone || '')
          setEmail(data.email || '')
          setWebsite(data.website || '')
          
          // Split address out of achievements if it was stored together by backend
          // Backend maps Achievements as achievements + address string:
          // [body.achievements, body.address ? `Địa chỉ: ${body.address}` : ''].filter(Boolean).join('\n')
          // So let's extract address from achievements if present.
          let rawAchievements = data.achievements || ''
          let extractedAddress = ''
          if (rawAchievements.includes('Địa chỉ:')) {
            const parts = rawAchievements.split('\n')
            const addrLine = parts.find(p => p.startsWith('Địa chỉ:'))
            if (addrLine) {
              extractedAddress = addrLine.replace('Địa chỉ:', '').trim()
              rawAchievements = parts.filter(p => !p.startsWith('Địa chỉ:')).join('\n')
            }
          }
          setAddress(extractedAddress || data.address || '')
          setAchievements(rawAchievements)
          
          setOrganizationType(data.organizationType || 'Trường nghề nhà nước')
          
          if (data.supportForDisabled) {
            setSupportForDisabled(data.supportForDisabled.split(',').map(s => s.trim()).filter(Boolean))
          }
          setPartnerCompanies(data.partnerCompanies || '')
          setLicenseFile(data.licenseFile || '')
          setLogoUrl(data.logoUrl || '')
        }
      } catch (err: any) {
        console.error('Không tìm thấy thông tin cơ sở đào tạo, vui lòng điền mới.', err)
      } finally {
        setFetching(false)
      }
    }
    loadProfile()
  }, [])

  const handleUploadLicense = async (file: File) => {
    setUploadingLicense(true)
    try {
      const response = await cvApi.uploadAvatar(file)
      setLicenseFile(response.avatarUrl)
      toastifyCommon.success('Tải giấy phép lên thành công!')
    } catch (err) {
      console.error(err)
      toastifyCommon.error('Tải giấy phép lên thất bại.')
    } finally {
      setUploadingLicense(false)
    }
  }

  const handleUploadLogo = async (file: File) => {
    setUploadingLogo(true)
    try {
      const response = await cvApi.uploadAvatar(file)
      setLogoUrl(response.avatarUrl)
      toastifyCommon.success('Tải logo lên thành công!')
    } catch (err) {
      console.error(err)
      toastifyCommon.error('Tải logo lên thất bại.')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleToggleSupport = (group: string) => {
    if (supportForDisabled.includes(group)) {
      setSupportForDisabled(supportForDisabled.filter(g => g !== group))
    } else {
      setSupportForDisabled([...supportForDisabled, group])
    }
  }

  const handleAddCustomGroup = () => {
    if (customGroup.trim()) {
      if (!supportForDisabled.includes(customGroup.trim())) {
        setSupportForDisabled([...supportForDisabled, customGroup.trim()])
      }
      setCustomGroup('')
    }
  }

  const handleSpeakLabel = (label: string) => {
    speakAccessibleText(label)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toastifyCommon.error('Vui lòng nhập tên cơ sở đào tạo.')
      return
    }
    if (!email.trim()) {
      toastifyCommon.error('Vui lòng nhập email liên hệ.')
      return
    }

    setLoading(true)
    try {
      const payload: TrainingCenterProfile = {
        name,
        slogan,
        phone,
        email,
        website,
        address,
        organizationType,
        supportForDisabled: supportForDisabled.join(', '),
        partnerCompanies,
        achievements,
        licenseFile,
        logoUrl
      }
      await trainingApi.save(payload)
      toastifyCommon.success('Cập nhật hồ sơ cơ sở đào tạo thành công!')
    } catch (err) {
      console.error(err)
      toastifyCommon.error('Cập nhật hồ sơ thất bại.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <WorkspaceShell role='educator'>
        <div className='flex h-64 w-full items-center justify-center gap-2'>
          <Loader2 className='h-8 w-8 animate-spin text-black' />
          <span className='text-[13px] font-bold'>Đang tải thông tin...</span>
        </div>
      </WorkspaceShell>
    )
  }

  return (
    <WorkspaceShell role='educator'>
      <div className='mx-auto w-full max-w-[620px]'>
        <h1 className='mb-8 flex items-center gap-2 text-[34px] font-black uppercase text-black'>
          Cơ sở đào tạo
          <button
            type='button'
            onClick={() => handleSpeakLabel('Cơ sở đào tạo')}
            aria-label='Đọc tiêu đề Cơ sở đào tạo'
            className='rounded-full p-1 transition hover:bg-black/5 hover:text-black'
          >
            <Volume2 className='h-5 w-5 text-black' aria-hidden='true' />
          </button>
        </h1>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='grid gap-4 md:grid-cols-2'>
            <UploadBox
              title='Giấy phép hoạt động'
              action='Chọn tệp tin'
              value={licenseFile}
              onFileSelect={handleUploadLicense}
              uploading={uploadingLicense}
              accept='.pdf,.doc,.docx,.jpg,.jpeg,.png'
            />
            <UploadBox
              title='Import logo'
              action='Tải ảnh lên'
              value={logoUrl}
              onFileSelect={handleUploadLogo}
              uploading={uploadingLogo}
              accept='image/*'
            />
          </div>
          <div className='space-y-4'>
            <FigmaField
              label='Tên cơ sở đào tạo'
              placeholder='Nhập tên chính thức...'
              value={name}
              onChange={setName}
            />
            <FigmaField
              label='Slogan'
              placeholder='Khẩu hiệu hành động...'
              value={slogan}
              onChange={setSlogan}
            />
            <div className='grid gap-4 md:grid-cols-2'>
              <FigmaField
                label='SĐT'
                placeholder='090...'
                value={phone}
                onChange={setPhone}
              />
              <FigmaField
                label='Email'
                placeholder='contact@domain.com'
                value={email}
                onChange={setEmail}
              />
            </div>
            <FigmaField
              label='Website'
              placeholder='https://...'
              value={website}
              onChange={setWebsite}
            />
            <FigmaField
              label='Địa chỉ'
              placeholder='Số nhà, tên đường, quận/huyện...'
              value={address}
              onChange={setAddress}
            />
            <div className='space-y-2'>
              <span className='flex items-center gap-1.5 text-[12px] font-black text-black'>
                Loại hình tổ chức
                <button
                  type='button'
                  onClick={() => handleSpeakLabel('Loại hình tổ chức')}
                  aria-label='Đọc nhãn loại hình tổ chức'
                  className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'
                >
                  <Volume2 className='h-3 w-3 text-[#777]' aria-hidden='true' />
                </button>
              </span>
              {['Trường nghề nhà nước', 'Trung tâm tư nhân'].map((item) => {
                const isSelected = organizationType === item
                return (
                  <AnimatedButton
                    key={item}
                    type='button'
                    onClick={() => setOrganizationType(item)}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex h-12 w-full items-center justify-between border-l-[3px] bg-white px-4 text-[13px] font-black transition-all hover:bg-[#F5F5F5]',
                      isSelected ? 'border-black bg-[#F5F5F5]' : 'border-transparent text-[#555]'
                    )}
                  >
                    {item}
                    <Volume2 className='h-4 w-4 text-[#555]' aria-hidden='true' />
                  </AnimatedButton>
                )
              })}
            </div>
            <div className='space-y-2'>
              <span className='flex items-center gap-1.5 text-[12px] font-black text-black'>
                Hỗ trợ nhóm khuyết tật
                <button
                  type='button'
                  onClick={() => handleSpeakLabel('Hỗ trợ nhóm khuyết tật')}
                  aria-label='Đọc nhãn hỗ trợ nhóm khuyết tật'
                  className='rounded-full p-0.5 transition hover:bg-black/5 hover:text-black'
                >
                  <Volume2 className='h-3 w-3 text-[#777]' aria-hidden='true' />
                </button>
              </span>
              <div className='flex flex-wrap gap-2 mb-2'>
                {supportForDisabled.map((group) => (
                  <Chip key={group} removable onRemove={() => handleToggleSupport(group)}>
                    {group}
                  </Chip>
                ))}
              </div>
              <div className='flex gap-3'>
                {['Khiếm thị', 'Khiếm thính'].map((item) => {
                  const isSelected = supportForDisabled.includes(item)
                  return (
                    <AnimatedButton
                      key={item}
                      type='button'
                      onClick={() => handleToggleSupport(item)}
                      aria-pressed={isSelected}
                      className={cn(
                        'flex-1 flex h-12 items-center justify-between border-l-[3px] bg-white px-4 text-[13px] font-black transition-all hover:bg-[#F5F5F5]',
                        isSelected ? 'border-black bg-[#F5F5F5]' : 'border-transparent text-[#555]'
                      )}
                    >
                      {item}
                      <Volume2 className='h-4 w-4 text-[#555]' aria-hidden='true' />
                    </AnimatedButton>
                  )
                })}
              </div>
              <div className='flex gap-2 items-end'>
                <FigmaField
                  label=''
                  placeholder='Thêm nhóm khác...'
                  className='flex-1'
                  value={customGroup}
                  onChange={setCustomGroup}
                />
                <AnimatedButton
                  type='button'
                  onClick={handleAddCustomGroup}
                  className='h-12 bg-black px-4 text-[11px] font-black uppercase text-white hover:bg-[#222]'
                >
                  Thêm
                </AnimatedButton>
              </div>
            </div>
            <FigmaField
              label='Doanh nghiệp liên kết'
              placeholder='Nhập tên doanh nghiệp...'
              value={partnerCompanies}
              onChange={setPartnerCompanies}
            />
            <FigmaField
              label='Thành tựu'
              placeholder='Mô tả các giải thưởng, chứng nhận đạt được...'
              textarea
              value={achievements}
              onChange={setAchievements}
            />
          </div>
          <PrimaryAction type='submit' disabled={loading}>
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                ĐANG CẬP NHẬT...
              </span>
            ) : (
              'HOÀN TẤT'
            )}
          </PrimaryAction>
        </form>
      </div>
    </WorkspaceShell>
  )
}

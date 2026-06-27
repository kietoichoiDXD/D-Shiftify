import { useEffect, useState } from 'react'
import { Volume2, Loader2 } from 'lucide-react'

import { companyApi, type CompanyProfile } from '@/core/services/company.service'
import { cvApi } from '@/core/services/cv.service'
import { speakAccessibleText } from '@/core/services/speech.service'
import toastifyCommon from '@/core/lib/toastify-common'

import { FigmaField, PrimaryAction, UploadBox } from './form-controls'
import { WorkspaceShell } from './workspace-shell'

export function FigmaBusinessProfilePage({ edit = false }: { edit?: boolean }) {
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
  const [industry, setIndustry] = useState('')
  const [taxCode, setTaxCode] = useState('')
  const [address, setAddress] = useState('')
  const [policyForDisabled, setPolicyForDisabled] = useState('')
  const [experienceWithDisabled, setExperienceWithDisabled] = useState('')
  
  const [licenseFile, setLicenseFile] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await companyApi.getMine()
        if (data) {
          setName(data.name || '')
          setSlogan(data.slogan || '')
          setPhone(data.phone || '')
          setEmail(data.email || '')
          setWebsite(data.website || '')
          setIndustry(data.industry || '')
          setTaxCode(data.taxCode || '')
          setAddress(data.address || '')
          setPolicyForDisabled(data.policyForDisabled || '')
          setExperienceWithDisabled(data.experienceWithDisabled || '')
          setLicenseFile(data.licenseFile || '')
          setLogoUrl(data.logoUrl || '')
        }
      } catch (err: any) {
        console.error('Không tìm thấy thông tin doanh nghiệp, vui lòng điền mới.', err)
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

  const handleSpeakLabel = (label: string) => {
    speakAccessibleText(label)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toastifyCommon.error('Vui lòng nhập tên doanh nghiệp.')
      return
    }
    if (!email.trim()) {
      toastifyCommon.error('Vui lòng nhập email liên hệ.')
      return
    }

    setLoading(true)
    try {
      const payload: CompanyProfile = {
        name,
        slogan,
        phone,
        email,
        website,
        industry,
        taxCode,
        address,
        policyForDisabled,
        experienceWithDisabled,
        licenseFile,
        logoUrl
      }
      await companyApi.save(payload)
      toastifyCommon.success('Cập nhật hồ sơ doanh nghiệp thành công!')
    } catch (err) {
      console.error(err)
      toastifyCommon.error('Cập nhật hồ sơ thất bại.')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <WorkspaceShell role='business'>
        <div className='flex h-64 w-full items-center justify-center gap-2'>
          <Loader2 className='h-8 w-8 animate-spin text-black' />
          <span className='text-[13px] font-bold'>Đang tải thông tin...</span>
        </div>
      </WorkspaceShell>
    )
  }

  return (
    <WorkspaceShell role='business'>
      <div className='mx-auto w-full max-w-[760px]'>
        <h1 className='mb-8 flex items-center gap-2 text-[34px] font-black uppercase text-[#004080]'>
          Doanh nghiệp
          <button
            type='button'
            onClick={() => handleSpeakLabel('Doanh nghiệp')}
            aria-label='Đọc tiêu đề Doanh nghiệp'
            className='rounded-full p-1 transition hover:bg-[#004080]/5'
          >
            <Volume2 className='h-5 w-5 text-[#004080]' aria-hidden='true' />
          </button>
        </h1>
        <form onSubmit={handleSubmit} className='space-y-8'>
          <div className='grid gap-8 md:grid-cols-2'>
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
          <div className='grid gap-5 md:grid-cols-2'>
            <FigmaField
              label='Tên doanh nghiệp'
              placeholder='Nhập tên chính thức'
              className='md:col-span-2'
              value={name}
              onChange={setName}
            />
            <FigmaField
              label='Slogan'
              placeholder='Khẩu hiệu của doanh nghiệp'
              className='md:col-span-2'
              value={slogan}
              onChange={setSlogan}
            />
            <FigmaField
              label='SĐT'
              placeholder='0xxx xxx xxx'
              value={phone}
              onChange={setPhone}
            />
            <FigmaField
              label='Email'
              placeholder='contact@domain.com'
              value={email}
              onChange={setEmail}
            />
            <FigmaField
              label='Website'
              placeholder='https://...'
              value={website}
              onChange={setWebsite}
            />
            <FigmaField
              label='Lĩnh vực hoạt động'
              placeholder='Chọn lĩnh vực'
              select
              options={['Công nghệ thông tin', 'Thương mại điện tử', 'Giáo dục', 'Dịch vụ', 'Sản xuất', 'Khác']}
              value={industry}
              onChange={setIndustry}
            />
            <FigmaField
              label='Mã số thuế'
              placeholder='Nhập mã số thuế'
              value={taxCode}
              onChange={setTaxCode}
            />
            <FigmaField
              label='Địa chỉ'
              placeholder='Địa chỉ trụ sở chính'
              value={address}
              onChange={setAddress}
            />
            <FigmaField
              label='Chính sách phúc lợi cho người khiếm thị'
              placeholder='Các chế độ đặc biệt cho người khuyết tật'
              className='md:col-span-2'
              value={policyForDisabled}
              onChange={setPolicyForDisabled}
            />
            <FigmaField
              label='Kinh nghiệm làm việc với người khiếm thị'
              placeholder='Chia sẻ về các dự án hoặc kinh nghiệm tuyển dụng NKT của doanh nghiệp...'
              textarea
              className='md:col-span-2'
              value={experienceWithDisabled}
              onChange={setExperienceWithDisabled}
            />
          </div>
          <PrimaryAction type='submit' disabled={loading}>
            {loading ? (
              <span className='flex items-center justify-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                ĐANG CẬP NHẬT...
              </span>
            ) : edit ? (
              'Hoàn tất'
            ) : (
              'Cập nhật'
            )}
          </PrimaryAction>
        </form>
      </div>
    </WorkspaceShell>
  )
}

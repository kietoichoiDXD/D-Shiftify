import { type CvRecord } from '@/models/interface/cv.interfaces'

export const FALLBACK_STATUSES = [
  { id: 'visual', label: 'Khiếm thị' },
  { id: 'hearing', label: 'Khiếm thính' },
  { id: 'mobility', label: 'Khiếm khuyết vận động' },
  { id: 'intellectual', label: 'Khuyết tật trí tuệ' },
  { id: 'other', label: 'Khác' }
]

export const FALLBACK_GENDERS = [
  { id: 'male', label: 'Nam' },
  { id: 'female', label: 'Nữ' },
  { id: 'other', label: 'Khác' }
]

export const FALLBACK_WORK_TIMES = [
  { id: 'full_time', label: 'Toàn thời gian' },
  { id: 'part_time', label: 'Bán thời gian' },
  { id: 'flexible', label: 'Linh hoạt' }
]

export const FALLBACK_WORK_MODES = [
  { id: 'onsite', label: 'Tại văn phòng' },
  { id: 'remote', label: 'Làm từ xa' },
  { id: 'hybrid', label: 'Kết hợp' }
]

export const FALLBACK_SOFT_SKILLS = [
  { id: 'communication', label: 'Giao tiếp' },
  { id: 'teamwork', label: 'Làm việc nhóm' },
  { id: 'problem_solving', label: 'Giải quyết vấn đề' },
  { id: 'time_management', label: 'Quản lý thời gian' },
  { id: 'adaptability', label: 'Khả năng thích nghi' }
]

export const FALLBACK_HARD_SKILLS = [
  { id: 'microsoft_office', label: 'Microsoft Office' },
  { id: 'data_entry', label: 'Nhập liệu' },
  { id: 'customer_service', label: 'Chăm sóc khách hàng' },
  { id: 'accounting', label: 'Kế toán' },
  { id: 'programming', label: 'Lập trình' }
]

export const FALLBACK_WORK_CONDITIONS = [
  { id: 'quiet_environment', label: 'Môi trường yên tĩnh' },
  { id: 'accessible_facilities', label: 'Cơ sở vật chất tiếp cận' },
  { id: 'flexible_hours', label: 'Giờ làm việc linh hoạt' },
  { id: 'remote_work', label: 'Làm việc từ xa' }
]

export const FALLBACK_EQUIPMENT = [
  { id: 'screen_reader', label: 'Phần mềm đọc màn hình' },
  { id: 'braille_display', label: 'Màn hình Braille' },
  { id: 'hearing_aid', label: 'Máy trợ thính' },
  { id: 'wheelchair', label: 'Xe lăn' },
  { id: 'voice_control', label: 'Điều khiển bằng giọng nói' }
]

export const FALLBACK_CERTIFICATIONS = [
  { id: 'computer_basics', label: 'Tin học cơ bản' },
  { id: 'english_a2', label: 'Tiếng Anh A2' },
  { id: 'vocational_training', label: 'Đào tạo nghề' }
]

export const DEFAULT_CV_RECORD: CvRecord = {
  id: 'current',
  avatarUrl: '',
  fullName: '',
  birthday: '',
  address: '',
  gender: '',
  phone: '',
  email: '',
  disabilityStatus: '',
  disabilityTypes: [],
  disabilityLevel: '',
  supportNeeds: '',
  workExperiences: [],
  education: '',
  schoolName: '',
  major: '',
  achievement: '',
  educationStart: '',
  educationEnd: '',
  certifications: '',
  softSkills: '',
  hardSkills: '',
  careerGoals: '',
  workConditions: [],
  availableEquipment: [],
  status: 'draft',
  updatedAt: new Date().toISOString(),
  previewScore: 0
}

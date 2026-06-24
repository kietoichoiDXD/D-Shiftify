import { type ComponentType } from 'react'

import { Building2, Monitor, Wifi } from 'lucide-react'

export type WorkspaceRole = 'business' | 'educator'

export type CandidateJob = {
  id: string
  title: string
  company: string
  location: string
  technical: string
  softSkill: string
  mode: string
  score: number
}

export type FilterKey = 'technical' | 'softSkill' | 'location'

export type FilterState = Record<FilterKey, string>

export const allFilterLabel = 'Tất cả'

export const candidateJobs: CandidateJob[] = [
  {
    id: 'data-analyst-senior',
    title: 'Chuyên viên phân tích dữ liệu (Senior)',
    company: 'Tập đoàn Công nghệ Alpha',
    location: 'Quận 1, TP. Hồ Chí Minh',
    technical: 'Data Analysis',
    softSkill: 'Tư duy phân tích',
    mode: 'Online',
    score: 95
  },
  {
    id: 'uiux-designer',
    title: 'Thiết kế UI/UX trải nghiệm người dùng',
    company: 'Sáng tạo Việt Agency',
    location: 'Quận 7, TP. Hồ Chí Minh',
    technical: 'UI/UX',
    softSkill: 'Giao tiếp',
    mode: 'Hybrid',
    score: 88
  },
  {
    id: 'agile-pm',
    title: 'Quản lý dự án phần mềm (Agile)',
    company: 'Zion Tech Solutions',
    location: 'Cầu Giấy, Hà Nội',
    technical: 'Agile',
    softSkill: 'Lãnh đạo nhóm',
    mode: 'Hybrid',
    score: 92
  },
  {
    id: 'content-marketing',
    title: 'Content Marketing Specialist',
    company: 'Media Nexus Group',
    location: 'Quận Phú Nhuận, TP. HCM',
    technical: 'Content Marketing',
    softSkill: 'Sáng tạo',
    mode: 'Remote',
    score: 81
  }
]

export const filterGroups: Array<{
  key: FilterKey
  label: string
  options: string[]
}> = [
  {
    key: 'technical',
    label: 'Lọc theo kỹ năng chuyên môn',
    options: [allFilterLabel, 'Data Analysis', 'UI/UX', 'Agile', 'Content Marketing']
  },
  {
    key: 'softSkill',
    label: 'Lọc theo kỹ năng mềm',
    options: [allFilterLabel, 'Tư duy phân tích', 'Giao tiếp', 'Lãnh đạo nhóm', 'Sáng tạo']
  },
  {
    key: 'location',
    label: 'Lọc theo địa điểm',
    options: [allFilterLabel, 'TP. Hồ Chí Minh', 'Hà Nội', 'Remote']
  }
]

export const initialFilters: FilterState = {
  technical: allFilterLabel,
  softSkill: allFilterLabel,
  location: allFilterLabel
}

export const workModeOptions: Array<[ComponentType<{ className?: string }>, string]> = [
  [Wifi, 'Online'],
  [Building2, 'Offline'],
  [Monitor, 'Hybrid']
]

export const matchReasons = [
  ['Kinh nghiệm', 'Trùng khớp 2/3 năm yêu cầu ở vị trí tương đương.'],
  ['Kỹ năng', 'Đáp ứng tất cả kỹ năng cốt lõi: React, Node.js.'],
  ['Chứng chỉ', 'Đã xác thực chứng chỉ chuyên môn theo yêu cầu.'],
  ['Địa chỉ', 'Sẵn sàng làm việc tại khu vực.'],
  ['Mục tiêu nghề nghiệp', 'Định hướng phát triển cá nhân đồng điệu với lộ trình của dự án.']
]

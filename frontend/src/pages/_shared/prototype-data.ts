export type PrototypeJob = {
  id: string
  title: string
  company: string
  location: string
  mode: string
  salary: string
  match: number
  status: string
  postedAt: string
  skills: string[]
  supports: string[]
  reasons: string[]
}

export type PrototypeCandidate = {
  id: string
  name: string
  role: string
  disability: string
  location: string
  match: number
  status: string
  skills: string[]
  devices: string[]
  notes: string[]
}

export type PrototypeMessage = {
  id: string
  sender: string
  role: string
  preview: string
  time: string
  unread?: boolean
}

export type PrototypeClass = {
  id: string
  title: string
  students: number
  schedule: string
  accessibility: string
  status: string
}

export const prototypeJobs: PrototypeJob[] = [
  {
    id: 'job-backend',
    title: 'Backend Developer',
    company: 'ABC Software',
    location: 'Đà Nẵng',
    mode: 'Remote',
    salary: '18 - 28 triệu',
    match: 96,
    status: 'Đang tuyển',
    postedAt: '18/06/2026',
    skills: ['NodeJS', 'PostgreSQL', 'REST API'],
    supports: ['Laptop', 'Remote onboarding', 'Flexible hours'],
    reasons: [
      'Kinh nghiệm Backend gần với JD',
      'Kỹ năng NodeJS và PostgreSQL khớp cao',
      'Remote phù hợp ưu tiên làm việc'
    ]
  },
  {
    id: 'job-data',
    title: 'Data Entry Specialist',
    company: 'Hoa Sen Group',
    location: 'TP. Hồ Chí Minh',
    mode: 'Hybrid',
    salary: '9 - 14 triệu',
    match: 88,
    status: 'Phỏng vấn',
    postedAt: '17/06/2026',
    skills: ['Excel', 'Communication', 'Accuracy'],
    supports: ['Screen reader', 'Caption meeting', 'Quiet workspace'],
    reasons: ['Môi trường làm việc ít di chuyển', 'Có phụ đề họp trực tuyến', 'KPI rõ ràng theo ca']
  },
  {
    id: 'job-support',
    title: 'Customer Support Agent',
    company: 'D-Shiftify Partner',
    location: 'Hà Nội',
    mode: 'On-site',
    salary: '10 - 16 triệu',
    match: 79,
    status: 'Mới',
    postedAt: '16/06/2026',
    skills: ['Empathy', 'CRM', 'Problem solving'],
    supports: ['Wheelchair access', 'Elevator', 'Mentor buddy'],
    reasons: ['Phù hợp kỹ năng mềm', 'Cần xác minh thêm lịch di chuyển', 'Công ty có chính sách bảo hiểm']
  }
]

export const prototypeCandidates: PrototypeCandidate[] = [
  {
    id: 'cand-thu',
    name: 'Nguyễn Anh Thư',
    role: 'Backend Developer',
    disability: 'Không công khai',
    location: 'Đà Nẵng',
    match: 94,
    status: 'Mới ứng tuyển',
    skills: ['NodeJS', 'PostgreSQL', 'Communication'],
    devices: ['Laptop', 'Headset', 'Stable internet'],
    notes: ['Đã có 18 tháng kinh nghiệm API', 'Mong muốn remote', 'Cần giờ làm linh hoạt']
  },
  {
    id: 'cand-minh',
    name: 'Trần Quang Minh',
    role: 'Data Analyst Intern',
    disability: 'Khiếm thính',
    location: 'TP. Hồ Chí Minh',
    match: 87,
    status: 'Chờ review',
    skills: ['Excel', 'SQL', 'Power BI'],
    devices: ['Caption app', 'Laptop'],
    notes: ['Phù hợp nhóm data entry', 'Cần caption khi phỏng vấn', 'CV đầy đủ chứng chỉ']
  },
  {
    id: 'cand-linh',
    name: 'Lê Mỹ Linh',
    role: 'Customer Support',
    disability: 'Khuyết tật vận động',
    location: 'Hà Nội',
    match: 81,
    status: 'Hẹn lịch',
    skills: ['CRM', 'Empathy', 'English B1'],
    devices: ['Wheelchair', 'Smartphone'],
    notes: ['Cần workspace di chuyển thuận tiện', 'Kinh nghiệm CSKH 1 năm', 'Sẵn sàng hybrid']
  }
]

export const prototypeMessages: PrototypeMessage[] = [
  {
    id: 'msg-1',
    sender: 'ABC Software',
    role: 'Recruiter',
    preview: 'Công ty muốn hẹn phỏng vấn online vị trí Backend Developer vào thứ Sáu.',
    time: '09:30',
    unread: true
  },
  {
    id: 'msg-2',
    sender: 'Nguyễn Anh Thư',
    role: 'Candidate',
    preview: 'Em đã cập nhật CV và bổ sung chứng chỉ AWS Cloud Practitioner.',
    time: 'Hôm qua'
  },
  {
    id: 'msg-3',
    sender: 'AI Match Coach',
    role: 'Assistant',
    preview: 'Nếu ưu tiên thiết bị, điểm match của job Backend sẽ tăng từ 91 lên 96.',
    time: '15/06'
  }
]

export const prototypeClasses: PrototypeClass[] = [
  {
    id: 'class-node',
    title: 'NodeJS API cho người mới',
    students: 28,
    schedule: 'Thu 3, Thu 5 - 19:00',
    accessibility: 'Caption, transcript, audio summary',
    status: 'Đang mở'
  },
  {
    id: 'class-office',
    title: 'Office và Excel ứng dụng',
    students: 42,
    schedule: 'Thu 7 - 09:00',
    accessibility: 'Screen reader friendly',
    status: 'Sắp khai giảng'
  }
]

export const prototypeNotifications = [
  {
    id: 'noti-1',
    title: 'ABC Software đã xem CV của bạn',
    body: 'Hồ sơ Backend Developer đạt mức phù hợp 96%. Hãy xác nhận lịch phỏng vấn trực tuyến.',
    type: 'Phỏng vấn'
  },
  {
    id: 'noti-2',
    title: 'Cần bổ sung thiết bị hiện có',
    body: 'Thêm thông tin laptop/headset giúp AI matching tính điểm thiết bị chính xác hơn.',
    type: 'Hồ sơ'
  },
  {
    id: 'noti-3',
    title: 'Khóa học NodeJS mới từ trung tâm đào tạo',
    body: 'Khóa học có transcript và bài tập đọc được bằng screen reader.',
    type: 'Đào tạo'
  }
]

export const prototypeSchedule = [
  { id: 'event-1', title: 'Phỏng vấn Backend Developer', time: '20/06/2026 09:30', owner: 'ABC Software' },
  { id: 'event-2', title: 'Review ứng viên Data Entry', time: '21/06/2026 14:00', owner: 'Hoa Sen Group' },
  { id: 'event-3', title: 'Mentor session: CV accessibility', time: '22/06/2026 19:00', owner: 'AI Coach' }
]

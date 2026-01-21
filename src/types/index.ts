// User and Profile Types
export interface User {
  id: string
  type: string[]
  branchId: string | null
  deviceEnrollId: string | null
  deviceIsAdmin: boolean
  deviceFpfFlag: boolean
  deviceIsEnabled: boolean
  deviceShiftId: string | null
  departmentId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  profile?: Profile
}

export interface Shift {
  id: string
  name: string
  description: string
  isDefault: boolean
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  branchId: string
  departments: Department[]
}

export interface Profile {
  id: string
  username: string
  email: string
  name: string | null
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  phone: string | null
}

export interface AttendeeProfile {
  id: string
  username: string | null
  email: string | null
  name: string | null
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  phone: string | null
  password: string | null
  userId: string
}

export interface Attendee {
  id: string
  type: string[]
  hasConsole: 'ALLOWED' | 'DENIED'
  branchId: string
  deviceEnrollId: number
  deviceIsAdmin: boolean
  deviceFpfFlag: boolean
  deviceIsEnabled: boolean
  deviceShiftId: string | null
  createdAt: string
  updatedAt: string
  deletedAt?: string
  profile: AttendeeProfile
  department: Department
}

export interface DepartmentUser {
  id: string
  type: string[]
  branchId: string
  deviceEnrollId: number
  deviceIsAdmin: boolean
  deviceFpfFlag: boolean
  deviceIsEnabled: boolean
  deviceShiftId: number
  departmentId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Department {
  id: string
  branchId: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  users: DepartmentUser[]
  shift: Shift
}

export interface DepartmentDetail extends Department {
  users: DepartmentUser[]
}

// Attendance Types
export interface Attendance {
  id: string
  userId: string
  branchId: string
  time: string
  isTimeIn: boolean
  deviceMode: string
  status: string
  remarks: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  user: Attendee
  timezone: string
  departmentName: string
  startTime: string
  endTime: string
}

// Branch Types
export interface Branch {
  id: string
  name: string
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  deviceSerialNumber: string
  shifts: Shift[]
  departments: Department[]
  defaultShift: Shift
  timezone: string
}

// Company Types
export interface Company {
  id: string
  name: string
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  phone: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  owner?: User
}

export interface CompanyBranch {
  id: string
  name: string
  address1: string | null
  address2: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  phone: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  timezone: string
  deviceSerialNumber: string
  companyId: string
}

// API Response Types
export interface LoginResponse {
  user: User
  profile: Profile
  accessToken: string
  refreshToken: string
  branch: Branch
}

export interface CompanyLoginResponse {
  user: User
  company: Company
  profile: Profile
  accessToken: string
  refreshToken: string
}

export interface AttendeeLoginResponse {
  user: User
  profile: AttendeeProfile
  accessToken: string
  refreshToken: string
}

export interface AttendeeDetailsResponse {
  id: string
  type: string[]
  branchId: string | null
  deviceEnrollId: number | null
  deviceIsAdmin: boolean
  deviceFpfFlag: boolean
  deviceIsEnabled: boolean
  deviceShiftId: string | null
  departmentId: string | null
  hasConsole: 'ALLOWED' | 'DENIED'
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  profile: AttendeeProfile
  branch: Branch & {
    company: Company
  }
}

export interface AttendeeCounts {
  totalAttendees: number
  presentAttendees: number
  absentAttendees: number
}

// New type for the /api/v1/me/branch endpoint response
export interface BranchInfoResponse {
  user: User
  branch: Branch
  counts: AttendeeCounts
}

// Daily Attendance Logs Types
export interface DailyAttendee {
  name: string
  enrollId: number
  departmentName: string
  startTime: string
  endTime: string
  duration: string
  status: string
}

export interface DailyLog {
  date: string
  day: string
  attendees: DailyAttendee[]
}

import api from '../utils/axios'
import type {
  Profile,
  Attendee,
  Attendance,
  Branch,
  LoginResponse,
  CompanyLoginResponse,
  AttendeeLoginResponse,
  AttendeeDetailsResponse,
  AttendeeCounts,
  Department,
  DepartmentDetail,
  BranchInfoResponse,
  Shift,
  Company,
  CompanyBranch,
  User,
} from '../types'

// API Service Class
class ApiService {
  // Auth endpoints
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/api/v1/auth/branch/login', {
        username,
        password,
      })
      return response.data
    } catch (error: any) {
      console.error('Login API error:', error)
      throw this.handleApiError(error, 'Login failed')
    }
  }

  async companyLogin(
    username: string,
    password: string,
    companyName: string,
  ): Promise<CompanyLoginResponse> {
    try {
      const response = await api.post<CompanyLoginResponse>('/api/v1/auth/company/login', {
        username,
        password,
        companyName,
      })
      return response.data
    } catch (error: any) {
      console.error('Company login API error:', error)
      throw this.handleApiError(error, 'Company login failed')
    }
  }

  async attendeeLogin(emailOrUsername: string, password: string): Promise<AttendeeLoginResponse> {
    try {
      // Determine if email or username was provided
      const isEmail = emailOrUsername.includes('@')
      const payload = isEmail
        ? { email: emailOrUsername, password }
        : { username: emailOrUsername, password }

      const response = await api.post<AttendeeLoginResponse>('/api/v1/auth/attendee/login', payload)
      return response.data
    } catch (error: any) {
      console.error('Attendee login API error:', error)
      throw this.handleApiError(error, 'Attendee login failed')
    }
  }

  async getAttendeeDetails(): Promise<AttendeeDetailsResponse> {
    try {
      const response = await api.get<AttendeeDetailsResponse>('/api/v1/me/attendee')
      return response.data
    } catch (error: any) {
      console.error('Get attendee details API error:', error)
      throw this.handleApiError(error, 'Failed to fetch attendee details')
    }
  }

  async getMyAttendanceLogs(queryParams?: {
    startDate?: string
    endDate?: string
  }): Promise<Attendance[]> {
    try {
      let url = '/api/v1/me/attendee/attendance'

      if (queryParams) {
        const params = new URLSearchParams()
        if (queryParams.startDate) params.append('startDate', queryParams.startDate)
        if (queryParams.endDate) params.append('endDate', queryParams.endDate)

        if (params.toString()) {
          url += `?${params.toString()}`
        }
      }

      const response = await api.get<Attendance[]>(url)
      return response.data
    } catch (error: any) {
      console.error('Get my attendance logs API error:', error)
      throw this.handleApiError(error, 'Failed to fetch attendance logs')
    }
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const response = await api.post('/api/v1/auth/refresh', { refreshToken })
      return response.data
    } catch (error: any) {
      console.error('Token refresh API error:', error)
      throw this.handleApiError(error, 'Token refresh failed')
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/api/v1/auth/logout')
    } catch (error: any) {
      console.error('Logout API error:', error)
      // Don't throw error for logout as it's not critical
    }
  }

  // Dashboard endpoints
  async getAttendeeCounts(): Promise<AttendeeCounts> {
    try {
      const response = await api.get<AttendeeCounts>('/api/v1/me/branch/attendees/counts')
      return response.data
    } catch (error: any) {
      console.error('Get attendee counts API error:', error)
      throw this.handleApiError(error, 'Failed to fetch attendee counts')
    }
  }

  async getAttendees(): Promise<Attendee[]> {
    try {
      const response = await api.get<Attendee[]>('/api/v1/me/branch/attendees')
      console.log('Attendees:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Get attendees API error:', error)
      throw this.handleApiError(error, 'Failed to fetch attendees')
    }
  }

  async getAttendances(
    branchId: string,
    queryParams?: {
      attendeeId?: string
      startDate?: string
      endDate?: string
    },
  ): Promise<Attendance[]> {
    try {
      let url = `/api/v1/clock/attendance-log/branch/${branchId}`

      if (queryParams) {
        const params = new URLSearchParams()
        if (queryParams.attendeeId) params.append('attendeeId', queryParams.attendeeId)
        if (queryParams.startDate) params.append('startDate', queryParams.startDate)
        if (queryParams.endDate) params.append('endDate', queryParams.endDate)

        if (params.toString()) {
          url += `?${params.toString()}`
        }
      }

      const response = await api.get<Attendance[]>(url)
      return response.data
    } catch (error: any) {
      console.error('Get attendances API error:', error)
      throw this.handleApiError(error, 'Failed to fetch attendances')
    }
  }

  async getDailyAttendanceLogs(
    branchId: string,
    queryParams?: {
      attendeeId?: string
      startDate?: string
      endDate?: string
    },
  ): Promise<any[]> {
    try {
      let url = `/api/v1/clock/attendance-users-log/branch/${branchId}`

      if (queryParams) {
        const params = new URLSearchParams()
        if (queryParams.attendeeId) params.append('attendeeId', queryParams.attendeeId)
        if (queryParams.startDate) params.append('startDate', queryParams.startDate)
        if (queryParams.endDate) params.append('endDate', queryParams.endDate)

        if (params.toString()) {
          url += `?${params.toString()}`
        }
      }

      const response = await api.get<any[]>(url)
      return response.data
    } catch (error: any) {
      console.error('Get daily attendance logs API error:', error)
      throw this.handleApiError(error, 'Failed to fetch daily attendance logs')
    }
  }

  // User profile endpoints
  async getUserProfile(): Promise<Profile> {
    try {
      const response = await api.get<Profile>('/api/v1/me/profile')
      return response.data
    } catch (error: any) {
      console.error('Get user profile API error:', error)
      throw this.handleApiError(error, 'Failed to fetch user profile')
    }
  }

  async updateUserProfile(profileData: Partial<Profile>): Promise<Profile> {
    try {
      const response = await api.put<Profile>('/api/v1/me/profile', profileData)
      return response.data
    } catch (error: any) {
      console.error('Update user profile API error:', error)
      throw this.handleApiError(error, 'Failed to update user profile')
    }
  }

  // Branch endpoints
  async getBranchInfo(): Promise<Branch> {
    try {
      const response = await api.get<Branch>('/api/v1/me/branch')
      return response.data
    } catch (error: any) {
      console.error('Get branch info API error:', error)
      throw this.handleApiError(error, 'Failed to fetch branch information')
    }
  }

  async getBranchInfoWithCounts(): Promise<BranchInfoResponse> {
    try {
      const response = await api.get<BranchInfoResponse>('/api/v1/me/branch')
      return response.data
    } catch (error: any) {
      console.error('Get branch info with counts API error:', error)
      throw this.handleApiError(error, 'Failed to fetch branch information')
    }
  }

  async updateBranchInfo(branchData: { name?: string; timezone?: string }): Promise<Branch> {
    try {
      const response = await api.patch<Branch>('/api/v1/me/branch', branchData)
      return response.data
    } catch (error: any) {
      console.error('Update branch info API error:', error)
      throw this.handleApiError(error, 'Failed to update branch information')
    }
  }

  async getAllBranches(): Promise<Branch[]> {
    try {
      const response = await api.get<Branch[]>('/api/v1/branches')
      return response.data
    } catch (error: any) {
      console.error('Get all branches API error:', error)
      throw this.handleApiError(error, 'Failed to fetch all branches')
    }
  }

  // Department endpoints
  async getDepartments(): Promise<Department[]> {
    try {
      const response = await api.get<Department[]>('/api/v1/me/department')
      return response.data
    } catch (error: any) {
      console.error('Get departments API error:', error)
      throw this.handleApiError(error, 'Failed to fetch departments')
    }
  }

  async createDepartment(departmentData: {
    name: string
    description?: string
  }): Promise<Department> {
    try {
      const response = await api.post<Department>('/api/v1/me/department', departmentData)
      return response.data
    } catch (error: any) {
      console.error('Create department API error:', error)
      throw this.handleApiError(error, 'Failed to create department')
    }
  }

  async getDepartmentDetail(departmentId: string): Promise<DepartmentDetail> {
    try {
      const response = await api.get<DepartmentDetail>(`/api/v1/me/department/${departmentId}`)
      return response.data
    } catch (error: any) {
      console.error('Get department detail API error:', error)
      throw this.handleApiError(error, 'Failed to fetch department details')
    }
  }

  async addUserToDepartment(departmentId: string, userId: string): Promise<DepartmentDetail> {
    try {
      const response = await api.post<DepartmentDetail>(
        `/api/v1/me/department/${departmentId}/user/${userId}`,
      )
      return response.data
    } catch (error: any) {
      console.error('Add user to department API error:', error)
      throw this.handleApiError(error, 'Failed to add user to department')
    }
  }

  async removeUserFromDepartment(departmentId: string, userId: string): Promise<void> {
    try {
      await api.delete(`/api/v1/me/department/${departmentId}/user/${userId}`)
    } catch (error: any) {
      console.error('Remove user from department API error:', error)
      throw this.handleApiError(error, 'Failed to remove user from department')
    }
  }

  async getAllBranchAttendees(): Promise<Attendee[]> {
    try {
      const response = await api.get<Attendee[]>('/api/v1/me/branch/attendees')
      return response.data
    } catch (error: any) {
      console.error('Get all branch attendees API error:', error)
      throw this.handleApiError(error, 'Failed to fetch branch attendees')
    }
  }

  async updateDepartment(
    departmentId: string,
    departmentData: Partial<Department>,
  ): Promise<DepartmentDetail> {
    try {
      const response = await api.put<DepartmentDetail>(
        `/api/v1/me/department/${departmentId}`,
        departmentData,
      )
      return response.data
    } catch (error: any) {
      console.error('Update department API error:', error)
      throw this.handleApiError(error, 'Failed to update department')
    }
  }

  async deleteDepartment(departmentId: string): Promise<void> {
    try {
      await api.delete(`/api/v1/me/department/${departmentId}`)
    } catch (error: any) {
      console.error('Delete department API error:', error)
      throw this.handleApiError(error, 'Failed to delete department')
    }
  }

  // Shift endpoints
  async getShifts(): Promise<Shift[]> {
    try {
      const response = await api.get<Shift[]>('/api/v1/me/shift')
      return response.data
    } catch (error: any) {
      console.error('Get shifts API error:', error)
      throw this.handleApiError(error, 'Failed to fetch shifts')
    }
  }

  async getShift(shiftId: string): Promise<Shift> {
    try {
      const response = await api.get<Shift>(`/api/v1/me/shift/${shiftId}`)
      return response.data
    } catch (error: any) {
      console.error('Get shift API error:', error)
      throw this.handleApiError(error, 'Failed to fetch shift')
    }
  }

  async createShift(shiftData: {
    name: string
    description?: string
    startTime: string
    endTime: string
  }): Promise<Shift> {
    try {
      const response = await api.post<Shift>('/api/v1/me/shift', shiftData)
      return response.data
    } catch (error: any) {
      console.error('Create shift API error:', error)
      throw this.handleApiError(error, 'Failed to create shift')
    }
  }

  async updateShift(
    shiftId: string,
    shiftData: {
      name: string
      description?: string
      startTime: string
      endTime: string
    },
  ): Promise<Shift> {
    try {
      const response = await api.put<Shift>(`/api/v1/me/shift/${shiftId}`, shiftData)
      return response.data
    } catch (error: any) {
      console.error('Update shift API error:', error)
      throw this.handleApiError(error, 'Failed to update shift')
    }
  }

  async deleteShift(shiftId: string): Promise<void> {
    try {
      await api.delete(`/api/v1/me/shift/${shiftId}`)
    } catch (error: any) {
      console.error('Delete shift API error:', error)
      throw this.handleApiError(error, 'Failed to delete shift')
    }
  }

  async tagDepartmentToShift(shiftId: string, departmentId: string): Promise<Shift> {
    try {
      const response = await api.post<Shift>(
        `/api/v1/me/shift/${shiftId}/department/${departmentId}`,
      )
      return response.data
    } catch (error: any) {
      console.error('Tag department to shift API error:', error)
      throw this.handleApiError(error, 'Failed to tag department to shift')
    }
  }

  async untagDepartmentFromShift(shiftId: string, departmentId: string): Promise<void> {
    try {
      await api.delete(`/api/v1/me/shift/${shiftId}/department/${departmentId}`)
    } catch (error: any) {
      console.error('Untag department from shift API error:', error)
      throw this.handleApiError(error, 'Failed to untag department from shift')
    }
  }

  // Device endpoints
  async updateDeviceSerialNumber(serialNumber: string, password: string): Promise<void> {
    try {
      const response = await api.patch(`/api/v1/me/branch/device/${serialNumber}`, {
        password,
      })
      return response.data
    } catch (error: any) {
      console.error('Update device serial number API error:', error)
      throw this.handleApiError(error, 'Failed to update device serial number')
    }
  }

  // Password endpoints
  async changePassword(password: string, newPassword: string): Promise<void> {
    try {
      const response = await api.patch('/api/v1/me/branch/change-password', {
        password,
        newPassword,
      })
      return response.data
    } catch (error: any) {
      console.error('Change password API error:', error)
      throw this.handleApiError(error, 'Failed to change password')
    }
  }

  // User role assignment endpoints
  async assignUserRole(userId: string, role: string): Promise<void> {
    try {
      const response = await api.patch(`/api/v1/users/${userId}/make-as/${role}`)
      return response.data
    } catch (error: any) {
      console.error('Assign user role API error:', error)
      throw this.handleApiError(error, 'Failed to assign user role')
    }
  }

  async revokeUserRole(userId: string, role: string): Promise<void> {
    try {
      const response = await api.patch(`/api/v1/users/${userId}/make-as/${role}/revoke`)
      return response.data
    } catch (error: any) {
      console.error('Revoke user role API error:', error)
      throw this.handleApiError(error, 'Failed to revoke user role')
    }
  }

  async allowConsoleAccess(
    employeeId: string,
    data: { email: string; password: string },
  ): Promise<void> {
    try {
      const response = await api.post(`/api/v1/attendees/${employeeId}/allow-console-access`, data)
      return response.data
    } catch (error: any) {
      console.error('Allow console access API error:', error)
      throw this.handleApiError(error, 'Failed to allow console access')
    }
  }

  async revokeConsoleAccess(employeeId: string): Promise<void> {
    try {
      const response = await api.delete(`/api/v1/attendees/${employeeId}/revoke-console-access`)
      return response.data
    } catch (error: any) {
      console.error('Revoke console access API error:', error)
      throw this.handleApiError(error, 'Failed to revoke console access')
    }
  }

  // Company endpoints
  async getCompanyBranches(companyId: string): Promise<CompanyBranch[]> {
    try {
      const response = await api.get<CompanyBranch[]>(`/api/v1/companies/${companyId}/branches`)
      return response.data
    } catch (error: any) {
      console.error('Get company branches API error:', error)
      throw this.handleApiError(error, 'Failed to fetch company branches')
    }
  }

  async getCompany(companyId: string): Promise<Company> {
    try {
      const response = await api.get<Company>(`/api/v1/companies/${companyId}`)
      return response.data
    } catch (error: any) {
      console.error('Get company API error:', error)
      throw this.handleApiError(error, 'Failed to fetch company details')
    }
  }

  async updateCompany(companyId: string, companyData: Partial<Company>): Promise<Company> {
    try {
      const response = await api.patch<Company>(`/api/v1/companies/${companyId}`, companyData)
      return response.data
    } catch (error: any) {
      console.error('Update company API error:', error)
      throw this.handleApiError(error, 'Failed to update company details')
    }
  }

  // User endpoints
  async getUser(userId: string): Promise<User> {
    try {
      const response = await api.get<User>(`/api/v1/users/${userId}`)
      return response.data
    } catch (error: any) {
      console.error('Get user API error:', error)
      throw this.handleApiError(error, 'Failed to fetch user details')
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.patch<User>(`/api/v1/users/${userId}`, userData)
      return response.data
    } catch (error: any) {
      console.error('Update user API error:', error)
      throw this.handleApiError(error, 'Failed to update user details')
    }
  }

  // Error handling utility
  private handleApiError(error: any, defaultMessage: string): Error {
    let message = defaultMessage

    console.log('Error:', error)

    if (error.code === 'ERR_NETWORK') {
      message = 'Network error: Please check your connection and ensure the API server is running'
    } else if (error.response?.status === 401) {
      message = 'Unauthorized: Please log in again'
    } else if (error.response?.status === 403) {
      message = 'Forbidden: You do not have permission to perform this action'
    } else if (error.response?.status === 404) {
      message = 'API endpoint not found. Please check the server configuration'
    } else if (error.response?.status >= 500) {
      message = 'Server error. Please try again later'
    } else if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.response?.data?.details?.message) {
      message = error.response.data.details.message
    }

    const apiError = new Error(message)
    apiError.name = 'ApiError'
    ;(apiError as any).status = error.response?.status
    ;(apiError as any).originalError = error

    return apiError
  }
}

// Export singleton instance
export const apiService = new ApiService()

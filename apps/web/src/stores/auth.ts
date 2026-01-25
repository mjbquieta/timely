import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '../services/api'
import type { User, Profile, AttendeeProfile, Branch, Company } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const branch = ref<Branch | null>(null)
  const company = ref<Company | null>(null)
  const allBranches = ref<Branch[]>([])
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => !!accessToken.value)
  const userType = computed(() => user.value?.type || [])
  const isBranchOwner = computed(() => userType.value.includes('BRANCH_OWNER'))
  const isCompanyOwner = computed(() => userType.value.includes('COMPANY_OWNER'))
  const isAttendee = computed(() => userType.value.includes('ATTENDEE'))
  const isPayrollMaster = computed(() => userType.value.includes('PAYROLL_MASTER'))

  // Initialize auth state from localStorage
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('accessToken')
    const storedUser = localStorage.getItem('user')
    const storedProfile = localStorage.getItem('profile')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedBranch = localStorage.getItem('branch')
    const storedCompany = localStorage.getItem('company')

    if (storedToken && storedUser && storedProfile) {
      accessToken.value = storedToken
      user.value = JSON.parse(storedUser)
      profile.value = JSON.parse(storedProfile)
      refreshToken.value = storedRefreshToken
      if (storedBranch) {
        branch.value = JSON.parse(storedBranch)
      }
      if (storedCompany) {
        company.value = JSON.parse(storedCompany)
      }
    }
  }

  // Login function
  const login = async (username: string, password: string) => {
    isLoading.value = true
    error.value = null // Clear any previous errors

    console.log('login', username, password)

    try {
      const response = await apiService.login(username, password)

      const {
        user: userData,
        profile: profileData,
        accessToken: token,
        refreshToken: refresh,
        branch: branchData,
      } = response

      // Store in state
      user.value = userData
      profile.value = profileData
      accessToken.value = token
      refreshToken.value = refresh
      branch.value = branchData
      company.value = null // Clear company for branch login

      // Store in localStorage
      localStorage.setItem('accessToken', token)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('profile', JSON.stringify(profileData))
      localStorage.setItem('refreshToken', refresh)
      localStorage.setItem('branch', JSON.stringify(branchData))
      localStorage.removeItem('company') // Clear company for branch login

      return response
    } catch (err: any) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Company login function
  const companyLogin = async (username: string, password: string, companyName: string) => {
    isLoading.value = true
    error.value = null // Clear any previous errors

    try {
      const response = await apiService.companyLogin(username, password, companyName)

      const {
        user: userData,
        profile: profileData,
        accessToken: token,
        refreshToken: refresh,
        company: companyData,
      } = response

      // Store in state
      user.value = userData
      profile.value = profileData
      accessToken.value = token
      refreshToken.value = refresh
      company.value = companyData
      branch.value = null // Clear branch for company login

      // Store in localStorage
      localStorage.setItem('accessToken', token)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('profile', JSON.stringify(profileData))
      localStorage.setItem('refreshToken', refresh)
      localStorage.setItem('company', JSON.stringify(companyData))
      localStorage.removeItem('branch') // Clear branch for company login

      return response
    } catch (err: any) {
      error.value = err.message || 'Company login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Attendee login function
  const attendeeLogin = async (emailOrUsername: string, password: string) => {
    isLoading.value = true
    error.value = null // Clear any previous errors

    try {
      const response = await apiService.attendeeLogin(emailOrUsername, password)

      const {
        user: userData,
        profile: profileData,
        accessToken: token,
        refreshToken: refresh,
      } = response

      // Store in state
      user.value = userData
      // Convert AttendeeProfile to Profile format for compatibility
      profile.value = {
        id: profileData.id,
        username: profileData.username || '',
        email: profileData.email || '',
        name: profileData.name,
        address1: profileData.address1,
        address2: profileData.address2,
        city: profileData.city,
        state: profileData.state,
        zip: profileData.zip,
        country: profileData.country,
        phone: profileData.phone,
      }
      accessToken.value = token
      refreshToken.value = refresh
      branch.value = null // Will be fetched separately
      company.value = null // Will be fetched separately

      // Store in localStorage
      localStorage.setItem('accessToken', token)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('profile', JSON.stringify(profile.value))
      localStorage.setItem('refreshToken', refresh)
      localStorage.removeItem('branch') // Clear branch for attendee login
      localStorage.removeItem('company') // Clear company for attendee login

      return response
    } catch (err: any) {
      error.value = err.message || 'Attendee login failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Fetch attendee details (includes branch and company info)
  const fetchAttendeeDetails = async () => {
    try {
      isLoading.value = true
      const attendeeData = await apiService.getAttendeeDetails()

      // Update user - map AttendeeDetailsResponse to User type
      user.value = {
        id: attendeeData.id,
        type: attendeeData.type,
        branchId: attendeeData.branchId,
        deviceEnrollId: attendeeData.deviceEnrollId?.toString() ?? null,
        deviceIsAdmin: attendeeData.deviceIsAdmin,
        deviceFpfFlag: attendeeData.deviceFpfFlag,
        deviceIsEnabled: attendeeData.deviceIsEnabled,
        deviceShiftId: attendeeData.deviceShiftId,
        departmentId: attendeeData.departmentId,
        createdAt: attendeeData.createdAt,
        updatedAt: attendeeData.updatedAt,
        deletedAt: attendeeData.deletedAt,
      }
      if (attendeeData.profile) {
        profile.value = {
          id: attendeeData.profile.id,
          username: attendeeData.profile.username || '',
          email: attendeeData.profile.email || '',
          name: attendeeData.profile.name,
          address1: attendeeData.profile.address1,
          address2: attendeeData.profile.address2,
          city: attendeeData.profile.city,
          state: attendeeData.profile.state,
          zip: attendeeData.profile.zip,
          country: attendeeData.profile.country,
          phone: attendeeData.profile.phone,
        }
        localStorage.setItem('profile', JSON.stringify(profile.value))
      }

      // Update branch and company if available
      if (attendeeData.branch) {
        branch.value = attendeeData.branch
        localStorage.setItem('branch', JSON.stringify(attendeeData.branch))
      }

      if (attendeeData.branch?.company) {
        company.value = attendeeData.branch.company
        localStorage.setItem('company', JSON.stringify(attendeeData.branch.company))
      }

      localStorage.setItem('user', JSON.stringify(attendeeData))

      return attendeeData
    } catch (error: any) {
      console.error('Failed to fetch attendee details:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Logout function
  const logout = () => {
    user.value = null
    profile.value = null
    accessToken.value = null
    refreshToken.value = null
    branch.value = null
    company.value = null
    error.value = null

    // Clear localStorage
    localStorage.removeItem('accessToken')
    localStorage.removeItem('user')
    localStorage.removeItem('profile')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('branch')
    localStorage.removeItem('company')
  }

  // Update tokens
  const updateTokens = (newAccessToken: string, newRefreshToken?: string) => {
    accessToken.value = newAccessToken
    if (newRefreshToken) {
      refreshToken.value = newRefreshToken
      localStorage.setItem('refreshToken', newRefreshToken)
    }
    localStorage.setItem('accessToken', newAccessToken)
  }

  // Fetch and update branch information
  const fetchBranchInfo = async () => {
    try {
      isLoading.value = true
      const branchData = await apiService.getBranchInfo()
      branch.value = branchData
      localStorage.setItem('branch', JSON.stringify(branchData))
      return branchData
    } catch (error: any) {
      console.error('Failed to fetch branch information:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Fetch branch info with counts (for dashboard and other components)
  const fetchBranchInfoWithCounts = async () => {
    try {
      isLoading.value = true
      const branchData = await apiService.getBranchInfoWithCounts()
      // Update branch info in store if available
      if (branchData.branch) {
        branch.value = branchData.branch
        localStorage.setItem('branch', JSON.stringify(branchData.branch))
      }
      return branchData
    } catch (error: any) {
      console.error('Failed to fetch branch information with counts:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Update branch information in store (for when branch data changes)
  const updateBranchInfo = (newBranchData: Branch) => {
    branch.value = newBranchData
    localStorage.setItem('branch', JSON.stringify(newBranchData))
  }

  // Fetch all branches
  const fetchAllBranches = async () => {
    try {
      isLoading.value = true
      const branches = await apiService.getAllBranches()
      allBranches.value = branches
      localStorage.setItem('allBranches', JSON.stringify(branches))
      return branches
    } catch (error: any) {
      console.error('Failed to fetch all branches:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Get branch options for dropdowns (formatted for UI)
  const getBranchOptions = computed(() => {
    return allBranches.value.map((branch) => ({
      id: branch.id,
      name: branch.name,
      timezone: branch.timezone,
      deviceSerialNumber: branch.deviceSerialNumber,
    }))
  })

  return {
    user,
    profile,
    branch,
    company,
    allBranches,
    accessToken,
    refreshToken,
    isLoading,
    error,
    isAuthenticated,
    userType,
    isBranchOwner,
    isCompanyOwner,
    isAttendee,
    isPayrollMaster,
    initializeAuth,
    login,
    companyLogin,
    attendeeLogin,
    logout,
    updateTokens,
    fetchBranchInfo,
    fetchBranchInfoWithCounts,
    updateBranchInfo,
    fetchAllBranches,
    getBranchOptions,
    fetchAttendeeDetails,
  }
})

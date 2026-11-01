const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface RegisterData {
  email: string
  username: string
  password: string
  fullName: string
  phoneNumber?: string
}

export interface LoginData {
  identifier: string
  password: string
}

export interface User {
  _id: string
  email: string
  username: string
  fullName: string
  role: 'user' | 'admin' | 'moderator'
  isActive: boolean
  isEmailVerified: boolean
  stats: {
    totalMatches: number
    wins: number
    losses: number
    draws: number
    totalWinnings: number
    tournamentsPlayed: number
    tournamentsWon: number
  }
  avatar?: {
    url: string
    publicId: string
  }
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: User
    token: string
    refreshToken: string
  }
}

class ApiService {
  private token: string | null = null
  private refreshToken: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
      this.refreshToken = localStorage.getItem('refreshToken')
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401 && this.refreshToken) {
          // Try to refresh token
          const refreshed = await this.refreshAccessToken()
          if (refreshed) {
            // Retry original request
            return this.request(endpoint, options)
          }
        }
        throw new Error(data.message || 'Something went wrong')
      }

      return data
    } catch (error: any) {
      throw new Error(error.message || 'Network error')
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      })

      const data = await response.json()

      if (data.success) {
        this.setToken(data.data.token)
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }

    this.clearToken()
    return false
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  setRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', refreshToken)
    }
  }

  clearToken() {
    this.token = null
    this.refreshToken = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    }
  }

  getToken() {
    return this.token
  }

  isAuthenticated() {
    return !!this.token
  }

  getUserRole(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userRole')
    }
    return null
  }

  setUserRole(role: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', role)
    }
  }

  // Auth endpoints
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    
    if (response.success) {
      this.setToken(response.data.token)
      this.setRefreshToken(response.data.refreshToken)
      this.setUserRole(response.data.user.role)
    }
    
    return response
  }

  async login(identifier: string, password: string): Promise<AuthResponse> {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    })
    
    if (response.success) {
      this.setToken(response.data.token)
      this.setRefreshToken(response.data.refreshToken)
      this.setUserRole(response.data.user.role)
    }
    
    return response
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearToken()
    }
  }

  async getMe() {
    return this.request('/auth/me', { method: 'GET' })
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

  async resetPassword(token: string, newPassword: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    })
  }

  // User endpoints
  async getProfile() {
    return this.request('/users/profile', { method: 'GET' })
  }

  async updateProfile(data: { fullName?: string; phoneNumber?: string; avatar?: any }) {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async getUserStats() {
    return this.request('/users/stats', { method: 'GET' })
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`, { method: 'GET' })
  }

  // Admin endpoints
  async getAllUsers() {
    return this.request('/users', { method: 'GET' })
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  }

  async banUser(userId: string) {
    return this.request(`/admin/users/${userId}/ban`, { method: 'PATCH' })
  }

  async getPlatformStats() {
    return this.request('/admin/dashboard/stats', { method: 'GET' })
  }

  // Wallet endpoints
  async getWalletBalance() {
    return this.request('/wallet/balance', { method: 'GET' })
  }

  async getTransactions() {
    return this.request('/wallet/transactions', { method: 'GET' })
  }

  async initializeDeposit(amount: number) {
    return this.request('/wallet/deposit/initialize', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  // Tournament endpoints
  async getTournaments() {
    return this.request('/tournaments', { method: 'GET' })
  }

  async getTournamentById(id: string) {
    return this.request(`/tournaments/${id}`, { method: 'GET' })
  }

  async joinTournament(tournamentId: string) {
    return this.request(`/tournaments/${tournamentId}/join`, { method: 'POST' })
  }
}

export const api = new ApiService()
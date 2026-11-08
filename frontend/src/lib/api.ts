const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface RegisterData {
  email: string
  username: string
  first_name: string
  last_name: string
  phone_number?: string
  password: string
  password_confirm: string
}

export interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  phone_number?: string
  role: string
  is_email_verified: boolean
  date_joined: string
  last_login: string | null
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

  private async request(
    endpoint: string,
    options: RequestInit = {},
    retried = false
  ): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    let response: Response
    try {
      response = await fetch(url, { ...options, headers })
    } catch {
      throw new Error('Network error. Is the server running?')
    }

    let data: any = null
    try {
      data = await response.json()
    } catch {
      data = null // empty or non-JSON body (e.g. 204)
    }

    if (!response.ok) {
      // Expired access token: refresh once, then retry the original request
      if (response.status === 401 && this.refreshToken && !retried) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          return this.request(endpoint, options, true)
        }
      }

      throw new Error(this.extractError(data))
    }

    return data
  }

  // Turns Django/DRF error shapes into one readable message
  private extractError(data: any): string {
    if (!data) return 'Something went wrong'
    if (typeof data === 'string') return data
    if (data.detail) return data.detail
    if (data.message) return data.message

    for (const [key, value] of Object.entries(data)) {
      if (key === 'status' || key === 'code') continue
      if (Array.isArray(value) && value.length) {
        const msg = String(value[0])
        return key === 'non_field_errors' ? msg : `${key}: ${msg}`
      }
    }

    return 'Something went wrong'
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      // Adjust this path if your Django refresh endpoint is different
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: this.refreshToken }),
      })

      const data = await response.json()

      if (response.ok && data.access) {
        this.setToken(data.access)
        // If rotation is on, Django returns a new refresh token too
        if (data.refresh) this.setRefreshToken(data.refresh)
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
      localStorage.removeItem('userRole')
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
    const res = await this.request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    this.setToken(res.tokens.access)
    this.setRefreshToken(res.tokens.refresh)
    this.setUserRole(res.user.role)

    return {
      success: true,
      message: 'Registration successful',
      data: {
        user: res.user,
        token: res.tokens.access,
        refreshToken: res.tokens.refresh,
      },
    }
  }

  async login(
    identifier: string,
    password: string,
    type: 'username' | 'email' = 'username'
  ): Promise<AuthResponse> {
    const body =
      type === 'username'
        ? { username: identifier, password }
        : { email: identifier, password }

    const res = await this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(body),
    })

    this.setToken(res.tokens.access)
    this.setRefreshToken(res.tokens.refresh)
    this.setUserRole(res.user.role)

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: res.user,
        token: res.tokens.access,
        refreshToken: res.tokens.refresh,
      },
    }
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: this.refreshToken }),
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearToken()
    }
  }

  // Normalised so AuthContext can keep using response.success / response.data.user
  async getMe(): Promise<{ success: boolean; data: { user: User } }> {
    const res = await this.request('/auth/me/', { method: 'GET' })
    return {
      success: true,
      data: { user: res.user ?? res },
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/change-password/', {
      method: 'PATCH',
      body: JSON.stringify({
        old_password: currentPassword,
        new_password: newPassword,
      }),
    })
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }

async resetPassword(
  uid: string,
  token: string,
  newPassword: string,
  confirmPassword: string
) {
  return this.request('/auth/reset-password/', {
    method: 'POST',
    body: JSON.stringify({
      uid,
      token,
      new_password: newPassword,
      new_password_confirm: confirmPassword,
    }),
  })
}

  // User endpoints
  async getProfile() {
    return this.request('/users/profile/', { method: 'GET' })
  }

  async updateProfile(data: {
    first_name?: string
    last_name?: string
    phone_number?: string
    avatar?: any
  }) {
    return this.request('/users/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async getUserStats() {
    return this.request('/users/stats/', { method: 'GET' })
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}/`, { method: 'GET' })
  }

  // Admin endpoints
  async getAllUsers() {
    return this.request('/users/', { method: 'GET' })
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/users/${userId}/role/`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    })
  }

  async banUser(userId: string) {
    return this.request(`/admin/users/${userId}/ban/`, { method: 'PATCH' })
  }

  async getPlatformStats() {
    return this.request('/admin/dashboard/stats/', { method: 'GET' })
  }

  // Wallet endpoints
  async getWalletBalance() {
    return this.request('/wallet/balance/', { method: 'GET' })
  }

  async getTransactions() {
    return this.request('/wallet/transactions/', { method: 'GET' })
  }

  async initializeDeposit(amount: number) {
    return this.request('/wallet/deposit/initialize/', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  // Tournament endpoints
  async getTournaments() {
    return this.request('/tournaments/', { method: 'GET' })
  }

  async getTournamentById(id: string) {
    return this.request(`/tournaments/${id}/`, { method: 'GET' })
  }

  async joinTournament(tournamentId: string) {
    return this.request(`/tournaments/${tournamentId}/join/`, { method: 'POST' })
  }
}

export const api = new ApiService()
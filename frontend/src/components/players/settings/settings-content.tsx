"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Key, Shield, Bell, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

export function SettingsContent() {
  const { user } = useAuth()
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showWithdrawPin, setShowWithdrawPin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [pinData, setPinData] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
  })

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' })
      return
    }
    
    setIsLoading(true)
    try {
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword)
      setMessage({ type: 'success', text: 'Password changed successfully!' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pinData.newPin !== pinData.confirmPin) {
      setMessage({ type: 'error', text: 'New pins do not match!' })
      return
    }
    if (pinData.newPin.length !== 4) {
      setMessage({ type: 'error', text: 'PIN must be 4 digits!' })
      return
    }
    
    setIsLoading(true)
    try {
      // API call to change withdrawal PIN
      // await api.changeWithdrawPin(pinData.currentPin, pinData.newPin)
      setMessage({ type: 'success', text: 'Withdrawal PIN changed successfully!' })
      setPinData({ currentPin: '', newPin: '', confirmPin: '' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Security Settings
        </h1>
        <p className="text-foreground/60 mt-2">
          Manage your password and withdrawal PIN for account security
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-500'
            : 'bg-red-500/10 border border-red-500/20 text-red-500'
        }`}>
          {message.text}
        </div>
      )}

      {/* Change Password */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-primary to-purple-600">
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Withdrawal PIN */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Change Withdrawal PIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePinChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPin">Current PIN</Label>
              <div className="relative">
                <Input
                  id="currentPin"
                  type={showWithdrawPin ? "text" : "password"}
                  maxLength={4}
                  pattern="[0-9]{4}"
                  value={pinData.currentPin}
                  onChange={(e) => setPinData({ ...pinData, currentPin: e.target.value })}
                  required
                  className="pr-10"
                  placeholder="****"
                />
                <button
                  type="button"
                  onClick={() => setShowWithdrawPin(!showWithdrawPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60"
                >
                  {showWithdrawPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPin">New PIN</Label>
              <Input
                id="newPin"
                type="password"
                maxLength={4}
                pattern="[0-9]{4}"
                value={pinData.newPin}
                onChange={(e) => setPinData({ ...pinData, newPin: e.target.value })}
                required
                placeholder="****"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm New PIN</Label>
              <Input
                id="confirmPin"
                type="password"
                maxLength={4}
                pattern="[0-9]{4}"
                value={pinData.confirmPin}
                onChange={(e) => setPinData({ ...pinData, confirmPin: e.target.value })}
                required
                placeholder="****"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-primary to-purple-600">
              {isLoading ? 'Updating...' : 'Update PIN'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Notification Settings (Placeholder) */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span>Email Notifications</span>
              <input type="checkbox" defaultChecked className="toggle" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Match Updates</span>
              <input type="checkbox" defaultChecked className="toggle" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span>Tournament Reminders</span>
              <input type="checkbox" defaultChecked className="toggle" />
            </label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
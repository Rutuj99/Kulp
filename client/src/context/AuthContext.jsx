import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Load user from token
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get('http://localhost:5000/api/users/me')
          setUser(res.data.data)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Error loading user:', error)
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
          setIsAuthenticated(false)
        }
      }
      setIsLoading(false)
    }

    loadUser()
  }, [token])

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', userData)
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
        setToken(res.data.token)
        setUser(res.data.user)
        setIsAuthenticated(true)
        return { success: true }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  // Login user
  const login = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', userData)
      
      if (res.data.token) {
        localStorage.setItem('token', res.data.token)
        setToken(res.data.token)
        setUser(res.data.user)
        setIsAuthenticated(true)
        return { success: true }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setIsAuthenticated(false)
  }

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const res = await axios.put('http://localhost:5000/api/users/me', userData)
      setUser(res.data.data)
      return { success: true }
    } catch (error) {
      console.error('Update profile error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed'
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        register,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
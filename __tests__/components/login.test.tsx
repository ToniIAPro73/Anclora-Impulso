import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/auth/login/page'

// Mock the auth context
jest.mock('@/lib/contexts/auth-context', () => ({
  useAuth: jest.fn(),
}))

// Mock the language context
jest.mock('@/lib/contexts/language-context', () => ({
  useLanguage: jest.fn(() => ({
    t: {
      auth: {
        email: 'Email',
        password: 'Password',
        signIn: 'Sign In',
        welcomeBack: 'Welcome Back',
        signInMessage: 'Sign in to your account',
        error: 'An error occurred',
      },
    },
  })),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

import { useAuth } from '@/lib/contexts/auth-context'

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form', () => {
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
      user: null,
      isLoading: false,
    } as any)

    render(<LoginPage />)

    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('should accept email input', async () => {
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
      logout: jest.fn(),
      signup: jest.fn(),
      user: null,
      isLoading: false,
    } as any)

    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    await user.type(emailInput, 'test@example.com')

    expect(emailInput.value).toBe('test@example.com')
  })

  it('should accept password input', async () => {
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
      logout: jest.fn(),
      signup: jest.fn(),
      user: null,
      isLoading: false,
    } as any)

    const user = userEvent.setup()
    render(<LoginPage />)

    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    await user.type(passwordInput, 'password123')

    expect(passwordInput.value).toBe('password123')
  })

  it('should call login function on form submit', async () => {
    const mockLogin = jest.fn().mockResolvedValue({})
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      logout: jest.fn(),
      signup: jest.fn(),
      user: null,
      isLoading: false,
    } as any)

    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should handle login error', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'))
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      logout: jest.fn(),
      signup: jest.fn(),
      user: null,
      isLoading: false,
    } as any)

    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrong-password')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('should disable submit button while loading', async () => {
    const mockLogin = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      logout: jest.fn(),
      signup: jest.fn(),
      user: null,
      isLoading: false,
    } as any)

    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i }) as HTMLButtonElement

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Button should be disabled while loading
    expect(submitButton.disabled).toBeTruthy()
  })

  it('should redirect to dashboard after successful login', async () => {
    const mockPush = jest.fn()
    jest.doMock('next/navigation', () => ({
      useRouter: jest.fn(() => ({
        push: mockPush,
      })),
    }))

    const mockLogin = jest.fn().mockResolvedValue({})
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      logout: jest.fn(),
      signup: jest.fn(),
      user: null,
      isLoading: false,
    } as any)

    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should require email field', async () => {
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
      logout: jest.fn(),
      signup: jest.fn(),
      user: null,
      isLoading: false,
    } as any)

    render(<LoginPage />)

    const emailInput = screen.getByLabelText('Email') as HTMLInputElement
    expect(emailInput.required).toBeTruthy()
  })

  it('should require password field', async () => {
    mockUseAuth.mockReturnValue({
      login: jest.fn(),
      logout: jest.fn(),
      signup: jest.fn(),
      user: null,
      isLoading: false,
    } as any)

    render(<LoginPage />)

    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement
    expect(passwordInput.required).toBeTruthy()
  })
})

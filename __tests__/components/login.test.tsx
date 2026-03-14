import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/auth/login/page'

// Mock the language context
jest.mock('@/lib/contexts/language-context', () => ({
  useLanguage: jest.fn(() => ({
    t: {
      auth: {
        email: 'Email',
        password: 'Password',
        signIn: 'Sign In',
        signingIn: 'Signing In',
        welcomeBack: 'Welcome Back',
        signInMessage: 'Sign in to your account',
        error: 'An error occurred',
        noAccount: "Don't have an account?",
        signUp: 'Sign Up',
      },
    },
  })),
}))

const mockReplace = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    replace: mockReplace,
  })),
}))

jest.mock('@/lib/api/auth', () => ({
  authApi: {
    login: jest.fn(),
  },
}))

import { authApi } from '@/lib/api/auth'

const mockLogin = authApi.login as jest.MockedFunction<typeof authApi.login>

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render login form', () => {
    render(<LoginPage />)

    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('should accept email input', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    await user.type(emailInput, 'test@example.com')

    expect(emailInput.value).toBe('test@example.com')
  })

  it('should accept password input', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    await user.type(passwordInput, 'password123')

    expect(passwordInput.value).toBe('password123')
  })

  it('should call login function on form submit', async () => {
    mockLogin.mockResolvedValue({} as never)

    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('should handle login error', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'))

    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'wrong-password')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('should disable submit button while loading', async () => {
    mockLogin.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )

    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i }) as HTMLButtonElement

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    // Button should be disabled while loading
    expect(submitButton.disabled).toBeTruthy()
  })

  it('should redirect to dashboard after successful login', async () => {
    mockLogin.mockResolvedValue({} as never)

    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    const submitButton = screen.getByRole('button', { name: /sign in/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('should require email field', async () => {
    render(<LoginPage />)

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    expect(emailInput.required).toBeTruthy()
  })

  it('should require password field', async () => {
    render(<LoginPage />)

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
    expect(passwordInput.required).toBeTruthy()
  })
})

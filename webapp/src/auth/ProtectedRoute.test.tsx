import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ProtectedRoute from './ProtectedRoute'
import authReducer from '../slices/authSlice'

const renderWithAuth = (isAuthenticated: boolean) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        isAuthenticated,
        uid: isAuthenticated ? 'uid-1' : null,
        email: isAuthenticated ? 'alice@example.com' : null,
      },
    },
  })
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )
}

describe('ProtectedRoute', () => {
  it('redirects to /login when unauthenticated', () => {
    const { getByText } = renderWithAuth(false)
    expect(getByText('Login Page')).toBeTruthy()
  })

  it('renders children when authenticated', () => {
    const { getByText } = renderWithAuth(true)
    expect(getByText('Protected Content')).toBeTruthy()
  })
})

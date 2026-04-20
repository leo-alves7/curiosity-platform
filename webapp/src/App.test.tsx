import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'

vi.mock('maplibre-gl', () => ({
  default: {
    Map: vi.fn().mockImplementation(() => ({ remove: vi.fn() })),
  },
}))

vi.mock('./auth/firebase', () => ({
  auth: { currentUser: null },
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn().mockReturnValue(() => {}),
  signOut: vi.fn(),
}))

vi.mock('@capacitor-firebase/authentication', () => ({
  FirebaseAuthentication: {
    signInWithGoogle: vi.fn(),
    signInWithApple: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  },
}))

vi.mock('@ionic/react', async () => {
  const actual = await vi.importActual('@ionic/react')
  return { ...actual, setupIonicReact: vi.fn() }
})

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Provider store={store}>
        <App />
      </Provider>,
    )
    expect(container).toBeDefined()
  })
})

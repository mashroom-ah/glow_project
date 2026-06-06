import { createBrowserRouter } from 'react-router-dom'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RegisterDetailsPage from './pages/RegisterDetailsPage'
import MainPage from './pages/MainPage'
import ProfilePage from './pages/ProfilePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },

  {
    path: '/login',
    element: <LoginPage />,
  },

  {
    path: '/register',
    element: <RegisterPage />,
  },

  {
    path: '/register/details',
    element: <RegisterDetailsPage />,
  },

  {
    path: '/main',
    element: <MainPage />,
  },

  {
    path: '/profile',
    element: <ProfilePage />,
  },

  {
    path: '/constructor',
    element: <div>Constructor</div>,
  },

  {
    path: '/water',
    element: <div>Water</div>,
  },

  {
    path: '/analytics',
    element: <div>Analytics</div>,
  },
])
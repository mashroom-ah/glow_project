import { createBrowserRouter } from 'react-router-dom'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import RegisterDetailsPage from './pages/RegisterDetailsPage'
import MainPage from './pages/MainPage'
import ProfilePage from './pages/ProfilePage'
import WaterPage from './pages/WaterPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ConstructorPage from './pages/ConstructorPage';
import ConstructorEditPage from './pages/ConstructorEditPage'

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
    element: <ConstructorPage />,
  },

  {
    path: '/water',
    element: <WaterPage />,
  },

  {
    path: '/analytics',
    element: <AnalyticsPage />,
  },
  {
    path: '/constructor/create',
    element: <ConstructorEditPage />
  },
  {
    path: '/constructor/edit/:id',
    element: <ConstructorEditPage />
  },
])
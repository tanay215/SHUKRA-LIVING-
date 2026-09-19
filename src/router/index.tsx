import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import OTPVerificationPage from '../pages/OTPVerificationPage';
import SetCredentialsPage from '../pages/SetCredentialsPage';
import DashboardPage from '../pages/DashboardPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrderConfirmationPage from '../pages/OrderConfirmationPage';
import OrderTrackingPage from '../pages/OrderTrackingPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import ProfilePage from '../pages/ProfilePage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminOrderDetail from '../pages/admin/AdminOrderDetail';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminProtectedRoute from '../components/AdminProtectedRoute';
import CreateCredentialsPage from '../pages/CreateCredentialsPage';
import ErrorBoundary from '../components/ErrorBoundary';
import HomePage from '../pages/HomePage';
import CollectionPage from '../pages/CollectionPage';
import ContactPage from '../pages/ContactPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'collection',
        element: <CollectionPage />
      },
      {
        path: 'contact',
        element: <ContactPage />
      },
      {
        path: 'login',
        element: <LoginPage />
      },
      {
        path: 'signup',
        element: <SignupPage />
      },
      {
        path: 'verify-otp',
        element: <OTPVerificationPage />
      },
      {
        path: 'set-credentials',
        element: <SetCredentialsPage />
      },
      {
        path: 'create-credentials',
        element: <CreateCredentialsPage />
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />
      },
      {
        path: 'dashboard',
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>
      },
      {
        path: 'product/:id',
        element: <ProductDetailPage />
      },
      {
        path: 'checkout',
        element: <ProtectedRoute><CheckoutPage /></ProtectedRoute>
      },
      {
        path: 'order-confirmation',
        element: <ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>
      },
      {
        path: 'order-tracking/:trackingNumber?',
        element: <ProtectedRoute><OrderTrackingPage /></ProtectedRoute>
      },
      {
        path: 'orders',
        element: <ProtectedRoute><OrderHistoryPage /></ProtectedRoute>
      },
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
      },
      {
        path: 'orders',
        element: <ProtectedRoute><OrderHistoryPage /></ProtectedRoute>
      }
    ]
  },
  {
    path: '/admin',
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: 'login',
        element: <AdminLoginPage />
      },
      {
        path: 'dashboard',
        element: <AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>
      },
      {
        path: 'products',
        element: <AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>
      },
      {
        path: 'orders',
        element: <AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>
      },
      {
        path: 'orders/:id',
        element: <AdminProtectedRoute><AdminOrderDetail /></AdminProtectedRoute>
      },
      {
        path: 'settings',
        element: <AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>
      },
      {
        path: 'analytics',
        element: <AdminProtectedRoute><AdminAnalytics /></AdminProtectedRoute>
      },
      {
        index: true,
        element: <Navigate to="/admin/login" replace />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);
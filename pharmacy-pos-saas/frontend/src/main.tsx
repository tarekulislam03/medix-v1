import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast';
import { ConfirmationProvider } from './context/ConfirmationContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfirmationProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <Toaster position="top-right" toastOptions={{
        className: 'bg-white text-gray-900 shadow-lg border border-gray-100',
        duration: 4000,
        style: {
          minWidth: '250px',
        }
      }} />
    </ConfirmationProvider>
  </StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1B4332',
              color: '#F5F0E8',
              fontFamily: 'DM Sans, sans-serif',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#74C69D', secondary: '#1B4332' } },
            error: { iconTheme: { primary: '#E85D04', secondary: '#F5F0E8' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

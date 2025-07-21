import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { AppProvider } from '../context/AppContext.jsx'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

createRoot(document.getElementById('root')).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
    </BrowserRouter>
  </ClerkProvider>,
  //Không có <BrowserRouter> → các đường link <Link to="/about" /> sẽ không hoạt động.
  //Có <BrowserRouter> → bạn có thể chuyển trang như /about, /home, /product/123 mà không reload trình duyệt.

)

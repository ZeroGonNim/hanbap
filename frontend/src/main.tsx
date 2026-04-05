import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'))
const App = React.lazy(() => import('./App'))

const isAdmin = window.location.pathname === '/admin';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Suspense fallback={<div className="min-h-screen bg-orange-50 flex items-center justify-center"><p className="text-gray-400">로딩 중...</p></div>}>
            {isAdmin ? <AdminDashboard /> : <App />}
        </Suspense>
    </React.StrictMode>,
)

import React, { Suspense } from 'react'
import './App.css'
// Using dynamic import for code splitting
const AdminPage = React.lazy(() => import('./pages/AdminPage'))

function App() {
  return (
    <>
      {/* Suspense boundary for the lazy-loaded component */}
      <Suspense fallback={<div className="loading">Loading application...</div>}>
        <AdminPage />
      </Suspense>
    </>
  )
}

export default App

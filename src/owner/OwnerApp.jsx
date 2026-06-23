import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext } from 'react'
import OwnerLogin from './OwnerLogin'
import OwnerDashboard from './OwnerDashboard'
import OwnerOrders from './OwnerOrders'
import OwnerAnalytics from './OwnerAnalytics'

const OwnerAuthContext = createContext({ owner: null })
export const useOwner = () => useContext(OwnerAuthContext)

const OWNER_PASSWORD = 'OMD-OWNER-2025'

export default function OwnerApp() {
  const [owner, setOwner] = useState(() => sessionStorage.getItem('owner') === 'true')

  function login(pw) {
    if (pw === OWNER_PASSWORD) { setOwner(true); sessionStorage.setItem('owner', 'true'); return true }
    return false
  }

  function logout() { setOwner(false); sessionStorage.removeItem('owner') }

  return (
    <OwnerAuthContext.Provider value={{ owner, login, logout }}>
      <Routes>
        <Route path="login" element={!owner ? <OwnerLogin /> : <Navigate to="/owner" />} />
        <Route path="" element={owner ? <OwnerDashboard /> : <Navigate to="/owner/login" />} />
        <Route path="orders" element={owner ? <OwnerOrders /> : <Navigate to="/owner/login" />} />
        <Route path="analytics" element={owner ? <OwnerAnalytics /> : <Navigate to="/owner/login" />} />
      </Routes>
    </OwnerAuthContext.Provider>
  )
}

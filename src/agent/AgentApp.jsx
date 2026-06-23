import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext } from 'react'
import AgentLogin from './AgentLogin'
import AgentDashboard from './AgentDashboard'
import AgentUpload from './AgentUpload'
import AgentOrders from './AgentOrders'

export const AgentAuthContext = createContext({ agent: null })
export const useAgent = () => useContext(AgentAuthContext)

export default function AgentApp() {
  const [agent, setAgent] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('agent') || 'null') } catch { return null }
  })

  function loginAgent(data) {
    setAgent(data)
    sessionStorage.setItem('agent', JSON.stringify(data))
  }

  function logoutAgent() {
    setAgent(null)
    sessionStorage.removeItem('agent')
  }

  return (
    <AgentAuthContext.Provider value={{ agent, loginAgent, logoutAgent }}>
      <Routes>
        <Route path="login" element={!agent ? <AgentLogin /> : <Navigate to="/agent" />} />
        <Route path="" element={agent ? <AgentDashboard /> : <Navigate to="/agent/login" />} />
        <Route path="upload" element={agent ? <AgentUpload /> : <Navigate to="/agent/login" />} />
        <Route path="orders" element={agent ? <AgentOrders /> : <Navigate to="/agent/login" />} />
      </Routes>
    </AgentAuthContext.Provider>
  )
}

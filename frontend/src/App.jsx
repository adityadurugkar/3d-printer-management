import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Printers from './pages/Printers'
import PrinterForm from './pages/PrinterForm'
import Repairs from './pages/Repairs'
import RepairForm from './pages/RepairForm'
import Inventory from './pages/Inventory'
import InventoryForm from './pages/InventoryForm'
import Technicians from './pages/Technicians'
import TechnicianForm from './pages/TechnicianForm'
import SpareParts from './pages/SpareParts'
import SparePartForm from './pages/SparePartForm'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="printers" element={<Printers />} />
        <Route path="printers/new" element={<PrinterForm />} />
        <Route path="printers/:id/edit" element={<PrinterForm />} />
        <Route path="repairs" element={<Repairs />} />
        <Route path="repairs/new" element={<RepairForm />} />
        <Route path="repairs/:id/edit" element={<RepairForm />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="inventory/new" element={<InventoryForm />} />
        <Route path="inventory/:id/edit" element={<InventoryForm />} />
        <Route path="spare-parts" element={<SpareParts />} />
        <Route path="spare-parts/new" element={<SparePartForm />} />
        <Route path="spare-parts/:id/edit" element={<SparePartForm />} />
        <Route path="technicians" element={<Technicians />} />
        <Route path="technicians/new" element={<TechnicianForm />} />
        <Route path="technicians/:id/edit" element={<TechnicianForm />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

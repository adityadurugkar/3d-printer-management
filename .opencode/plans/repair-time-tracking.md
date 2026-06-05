# Repair Machine Time Tracking — Implementation Plan

## Overview
Add technician time tracking to the Repair module: start/stop timers, auto-calculated hours, dashboard analytics, technician performance metrics.

---

## Backend Changes

### 1. `backend/models/Repair.js`
**Add fields after `status`:**
```js
startTime:  { type: Date, default: null },
endTime:    { type: Date, default: null },
totalHours: { type: Number, default: 0 },
```

### 2. `backend/controllers/repairController.js`
**Add two new exports (existing methods untouched):**

- `startRepair` — sets `startTime = new Date()`, `status = 'in-progress'`, emits `repair_started` notification
- `completeRepair` — sets `endTime = new Date()`, calculates `totalHours = (endTime - startTime) / 3600000`, sets `status = 'completed'`, emits `repair_completed` notification

### 3. `backend/routes/repairs.js`
**Add two new routes above the `/:id` route:**
```js
router.put('/:id/start', protect, startRepair);
router.put('/:id/complete', protect, completeRepair);
```

### 4. `backend/controllers/exportController.js` — `getDashboardStats`
**Add after existing stats (no existing code modified):**
- `activeRepairs` — `Repair.countDocuments({ status: 'in-progress' })`
- `totalRepairHoursThisMonth` — aggregate totalHours for repairs completed this month
- `fastestRepair` — min totalHours from completed repairs
- `slowestRepair` — max totalHours from completed repairs
- `avgTechnicianRepairTime` — aggregate by technicianName, `$avg: '$totalHours'`

---

## Frontend Changes

### 5. `frontend/src/api/index.js`
**Add to `repairAPI`:**
```js
startRepair: (id) => api.put(`/repairs/${id}/start`),
completeRepair: (id) => api.put(`/repairs/${id}/complete`),
```

### 6. `frontend/src/pages/Repairs.jsx`
**Enhanced table — add columns (no existing columns removed):**
- Start Time — `r.startTime ? new Date(r.startTime).toLocaleString() : '—'`
- End Time — `r.endTime ? new Date(r.endTime).toLocaleString() : '—'`
- Total Hours — `r.totalHours ? r.totalHours.toFixed(1) + 'h' : '—'`

**Add action buttons per row (before Edit/Delete):**
- **Start Repair** button (visible when `r.status === 'pending'`) — blue, calls `startRepair`
- **Complete Repair** button (visible when `r.status === 'in-progress'`) — green, calls `completeRepair`
- Both show spinner while loading, refresh list on success

### 7. `frontend/src/pages/Dashboard.jsx`
**Add 4 new stat cards (insert after existing ones):**
- Active Repairs → `key: 'activeRepairs'`, icon: `Clock`, color: blue
- Repair Hours (Month) → `key: 'totalRepairHoursThisMonth'`, icon: `Clock`, color: amber
- Fastest Repair → `key: 'fastestRepair'`, icon: `Zap`, color: emerald
- Slowest Repair → `key: 'slowestRepair'`, icon: `AlertTriangle`, color: rose

**Add new chart row (after existing charts):**
- `<RepairAvgTimeChart data={stats.avgTechnicianRepairTime} />` — new l-grid column

### 8. NEW: `frontend/src/components/charts/RepairAvgTimeChart.jsx`
Recharts `BarChart` — technician name (X), avg hours (Y). Same styling as TechnicianWorkloadChart.

---

## Files NOT Touched
- Printer, Inventory, SparePart, Technician, User models
- Auth, Settings, Notification modules
- All form pages, Sidebar, Navbar, Layout
- UI components (Button, Card, Table, etc.)
- Existing dashboard KPI cards and charts

## Verification
- Backend: `node -e "require('./server')"` — must show no errors
- Frontend: `npm run build` — must pass

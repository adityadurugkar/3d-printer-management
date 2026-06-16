require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const auditLogRoutes = require('./routes/auditLogs');
const printerRoutes = require('./routes/printers');
const repairRoutes = require('./routes/repairs');
const inventoryRoutes = require('./routes/inventory');
const sparePartRoutes = require('./routes/spareParts');
const technicianRoutes = require('./routes/technicians');
const exportRoutes = require('./routes/export');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/printers', printerRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/spare-parts', sparePartRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '3D Printer Management API' });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

connectDB().then(() => {
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

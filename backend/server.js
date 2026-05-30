require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

const authRoutes = require('./routes/auth');
const printerRoutes = require('./routes/printers');
const repairRoutes = require('./routes/repairs');
const inventoryRoutes = require('./routes/inventory');
const technicianRoutes = require('./routes/technicians');
const exportRoutes = require('./routes/export');
const notificationRoutes = require('./routes/notifications');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/printers', printerRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/notifications', notificationRoutes);

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

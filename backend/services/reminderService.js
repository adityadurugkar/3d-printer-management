const Repair = require('../models/Repair');
const User = require('../models/User');
const { taskDueSoonEmail, taskOverdueEmail } = require('./emailService');
const { createAndEmitNotification } = require('../controllers/notificationController');

const CHECK_INTERVAL = 30 * 60 * 1000;

let intervalHandle = null;

function startReminderService() {
  console.log('Reminder service started');
  checkReminders();
  intervalHandle = setInterval(checkReminders, CHECK_INTERVAL);
}

function stopReminderService() {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}

async function checkReminders() {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const nonCompleted = await Repair.find({ status: { $in: ['pending', 'in-progress'] } });

    for (const repair of nonCompleted) {
      if (!repair.dueDate) continue;

      const dueDate = new Date(repair.dueDate);

      if (dueDate < now && !repair.notifiedOverdue) {
        const admins = await User.find({ role: 'admin' });
        const adminEmail = admins.length > 0 ? admins[0].email : null;

        if (repair.technicianEmail) {
          await taskOverdueEmail({
            to: repair.technicianEmail,
            technicianName: repair.technicianName,
            ticketNumber: repair.ticketNumber,
            printerName: repair.printerName,
            dueDate: repair.dueDate,
          });
        }

        if (adminEmail) {
          await taskOverdueEmail({
            to: adminEmail,
            technicianName: repair.technicianName,
            ticketNumber: repair.ticketNumber,
            printerName: repair.printerName,
            dueDate: repair.dueDate,
          });
        }

        await createAndEmitNotification({
          type: 'repair_overdue',
          title: 'Repair Task Overdue',
          message: `${repair.ticketNumber} — ${repair.printerName} overdue (due ${dueDate.toLocaleDateString()})`,
          resourceId: repair._id.toString(),
          resourceModel: 'Repair',
        });

        repair.notifiedOverdue = true;
        await repair.save();
      } else if (dueDate > now && dueDate < in24Hours && !repair.notifiedDueSoon) {
        if (repair.technicianEmail) {
          await taskDueSoonEmail({
            to: repair.technicianEmail,
            technicianName: repair.technicianName,
            ticketNumber: repair.ticketNumber,
            printerName: repair.printerName,
            dueDate: repair.dueDate,
          });
        }

        await createAndEmitNotification({
          type: 'repair_due_soon',
          title: 'Repair Due in 24 Hours',
          message: `${repair.ticketNumber} — ${repair.printerName} due ${dueDate.toLocaleDateString()}`,
          resourceId: repair._id.toString(),
          resourceModel: 'Repair',
        });

        repair.notifiedDueSoon = true;
        await repair.save();
      }
    }
  } catch (error) {
    console.error('Reminder check failed:', error.message);
  }
}

module.exports = { startReminderService, stopReminderService };

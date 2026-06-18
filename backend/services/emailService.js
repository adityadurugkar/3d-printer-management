const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const useGmail = process.env.EMAIL_SERVICE === 'gmail';

  if (useGmail) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
}

const FROM_ADDRESS = process.env.EMAIL_FROM || 'noreply@phn3d.com';

function sendEmail({ to, subject, html }) {
  return new Promise((resolve, reject) => {
    try {
      const t = getTransporter();
      t.sendMail({ from: FROM_ADDRESS, to, subject, html }, (err, info) => {
        if (err) {
          console.error('Email send failed:', err.message);
          resolve(false);
        } else {
          console.log('Email sent:', info.messageId);
          resolve(true);
        }
      });
    } catch (err) {
      console.error('Email error:', err.message);
      resolve(false);
    }
  });
}

function taskAssignedEmail({ to, technicianName, ticketNumber, printerName, printerNumber, problemDescription, priority, dueDate, repairId }) {
  const dueStr = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set';
  const baseUrl = process.env.FRONTEND_URL || 'https://threed-printer-management.onrender.com';
  const completeLink = `${baseUrl}/repairs/${repairId}/complete`;
  const priorityColor = priority === 'critical' ? '#ef4444' : priority === 'high' ? '#f97316' : priority === 'medium' ? '#eab308' : '#6b7280';

  return sendEmail({
    to,
    subject: `[${ticketNumber}] New Repair Task Assigned — ${printerName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f24; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
        <div style="background: linear-gradient(135deg, #7c3aed, #6366f1); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">New Repair Task Assigned</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">${ticketNumber}</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #e2e8f0; font-size: 16px;">Hi <strong style="color: #fff;">${technicianName}</strong>,</p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">A new repair task has been assigned to you. Please review the details below and begin work at your earliest convenience.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #64748b; font-size: 13px;">Ticket</td><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #e2e8f0; font-weight: 600; font-size: 14px;">${ticketNumber}</td></tr>
            <tr><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #64748b; font-size: 13px;">Printer</td><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #e2e8f0; font-size: 14px;">${printerName} (${printerNumber})</td></tr>
            <tr><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #64748b; font-size: 13px;">Priority</td><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06);"><span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: ${priorityColor}22; color: ${priorityColor};">${priority.toUpperCase()}</span></td></tr>
            <tr><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #64748b; font-size: 13px;">Due Date</td><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #e2e8f0; font-size: 14px;">${dueStr}</td></tr>
            <tr><td style="padding: 12px; color: #64748b; font-size: 13px; vertical-align: top;">Description</td><td style="padding: 12px; color: #94a3b8; font-size: 14px; line-height: 1.5;">${problemDescription}</td></tr>
          </table>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${completeLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #7c3aed, #6366f1); color: #fff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">Start Repair Task</a>
          </div>
          <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 24px;">This is an automated message from PHN 3D Printer Management System.</p>
        </div>
      </div>
    `,
  });
}

function taskCompletedEmail({ adminEmail, adminName, ticketNumber, printerName, technicianName, completionReport }) {
  const baseUrl = process.env.FRONTEND_URL || 'https://threed-printer-management.onrender.com';
  return sendEmail({
    to: adminEmail,
    subject: `[${ticketNumber}] Repair Completed — ${printerName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f24; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Repair Completed</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">${ticketNumber}</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #e2e8f0; font-size: 16px;">Hi <strong style="color: #fff;">${adminName || 'Admin'}</strong>,</p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">Technician <strong style="color: #fff;">${technicianName}</strong> has completed the repair for <strong style="color: #fff;">${printerName}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #64748b; font-size: 13px;">Ticket</td><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #e2e8f0; font-weight: 600;">${ticketNumber}</td></tr>
            <tr><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #64748b; font-size: 13px;">Technician</td><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #e2e8f0;">${technicianName}</td></tr>
            <tr><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #64748b; font-size: 13px; vertical-align: top;">Actions</td><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #94a3b8;">${completionReport?.actionsPerformed || 'N/A'}</td></tr>
            <tr><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #64748b; font-size: 13px; vertical-align: top;">Root Cause</td><td style="padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.06); color: #94a3b8;">${completionReport?.rootCause || 'N/A'}</td></tr>
            <tr><td style="padding: 12px; color: #64748b; font-size: 13px;">Time Taken</td><td style="padding: 12px; color: #e2e8f0;">${completionReport?.timeTaken || 0} hours</td></tr>
          </table>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${baseUrl}/repairs" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px;">Review in Dashboard</a>
          </div>
        </div>
      </div>
    `,
  });
}

function taskOverdueEmail({ to, technicianName, ticketNumber, printerName, dueDate }) {
  return sendEmail({
    to,
    subject: `[URGENT] [${ticketNumber}] Repair Task Overdue — ${printerName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f24; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Task Overdue</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">${ticketNumber}</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #e2e8f0; font-size: 16px;">Hi <strong style="color: #fff;">${technicianName}</strong>,</p>
          <p style="color: #ef4444; font-size: 14px; font-weight: 600;">This task is now overdue.</p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">The repair task for <strong style="color: #fff;">${printerName}</strong> (${ticketNumber}) was due on <strong style="color: #fff;">${new Date(dueDate).toLocaleDateString()}</strong>. Please complete it as soon as possible.</p>
        </div>
      </div>
    `,
  });
}

function taskDueSoonEmail({ to, technicianName, ticketNumber, printerName, dueDate }) {
  return sendEmail({
    to,
    subject: `[REMINDER] [${ticketNumber}] Task Due in 24 Hours — ${printerName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f24; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Task Due Soon</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">${ticketNumber}</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #e2e8f0; font-size: 16px;">Hi <strong style="color: #fff;">${technicianName}</strong>,</p>
          <p style="color: #f97316; font-size: 14px; font-weight: 600;">This task is due within the next 24 hours.</p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">The repair task for <strong style="color: #fff;">${printerName}</strong> (${ticketNumber}) is due on <strong style="color: #fff;">${new Date(dueDate).toLocaleDateString()}</strong>.</p>
        </div>
      </div>
    `,
  });
}

function taskVerifiedEmail({ to, technicianName, ticketNumber, printerName }) {
  return sendEmail({
    to,
    subject: `[${ticketNumber}] Repair Verified — ${printerName}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f24; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
        <div style="background: linear-gradient(135deg, #6366f1, #4f46e5); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Repair Verified</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">${ticketNumber}</p>
        </div>
        <div style="padding: 32px;">
          <p style="color: #e2e8f0; font-size: 16px;">Hi <strong style="color: #fff;">${technicianName}</strong>,</p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">The repair for <strong style="color: #fff;">${printerName}</strong> (${ticketNumber}) has been reviewed and <strong style="color: #6366f1;">verified</strong> by an administrator.</p>
        </div>
      </div>
    `,
  });
}

function lowInventoryEmail({ to, itemName, quantity, supplier }) {
  return sendEmail({
    to,
    subject: `[LOW STOCK] ${itemName} — Only ${quantity} left`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f24; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
        <div style="background: linear-gradient(135deg, #eab308, #ca8a04); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Low Stock Alert</h1>
        </div>
        <div style="padding: 32px;">
          <p style="color: #e2e8f0; font-size: 16px;">Hi,</p>
          <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;"><strong style="color: #fff;">${itemName}</strong> is running low — only <strong style="color: #eab308;">${quantity}</strong> left in stock${supplier ? ` (supplier: ${supplier})` : ''}.</p>
        </div>
      </div>
    `,
  });
}

module.exports = {
  sendEmail,
  taskAssignedEmail,
  taskCompletedEmail,
  taskOverdueEmail,
  taskDueSoonEmail,
  taskVerifiedEmail,
  lowInventoryEmail,
};

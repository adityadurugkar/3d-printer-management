import { exportAPI, printerAPI, repairAPI, inventoryAPI, technicianAPI } from '../../api'

function matchAny(text, patterns) {
  return patterns.some(p => text.includes(p))
}

export async function processQuery(input) {
  const q = input.toLowerCase().trim()

  if (matchAny(q, ['hi', 'hello', 'hey', 'help', 'what can you do'])) {
    return {
      type: 'text',
      text: '👋 Hello! I\'m your PrintFlow assistant. I can help you with:\n\n' +
        '• **Printers** — "show printers", "how many printers", "active printers"\n' +
        '• **Repairs** — "repair status", "pending repairs", "repairs this month"\n' +
        '• **Inventory** — "inventory status", "low stock", "spare parts"\n' +
        '• **Technicians** — "technicians", "technician workload"\n' +
        '• **Dashboard** — "dashboard summary", "overview"\n\nTry asking me something!',
    }
  }

  if (matchAny(q, ['dashboard', 'overview', 'summary', 'stats'])) {
    const { data } = await exportAPI.getDashboard()
    return {
      type: 'stats',
      text: `📊 **Dashboard Summary**\n\n` +
        `🖨️ **${data.totalPrinters}** total printers (${data.activePrinters} active)\n` +
        `🔧 **${data.totalRepairs}** total repairs (${data.pendingRepairs} pending)\n` +
        `📦 **${data.totalInventory}** inventory items (${data.lowStockItems} low stock)\n` +
        `👨‍🔧 **${data.totalTechnicians}** technicians\n\n` +
        `_Repairs by status:_ ${data.repairsByStatus.map(s => `${s._id} (${s.count})`).join(', ')}`,
    }
  }

  if (matchAny(q, ['printer', 'printers'])) {
    if (matchAny(q, ['active', 'working'])) {
      const { data } = await printerAPI.getAll()
      const active = data.filter(p => p.status === 'active')
      return {
        type: 'list',
        text: `✅ **Active Printers (${active.length})**\n\n` +
          active.map(p => `• **${p.name}** — ${p.brand} ${p.model} (${p.serialNumber})`).join('\n') +
          (active.length === 0 ? '\nNo active printers.' : ''),
      }
    }
    if (matchAny(q, ['maintenance', 'broken', 'issue', 'problem'])) {
      const { data } = await printerAPI.getAll()
      const maint = data.filter(p => p.status === 'maintenance')
      return {
        type: 'list',
        text: `🔧 **Printers in Maintenance (${maint.length})**\n\n` +
          maint.map(p => `• **${p.name}** — ${p.brand} ${p.model}`).join('\n') +
          (maint.length === 0 ? '\nNo printers in maintenance.' : ''),
      }
    }
    const { data } = await printerAPI.getAll()
    return {
      type: 'stats',
      text: `🖨️ **Printer Overview**\n\n` +
        `**Total:** ${data.length}\n\n` +
        `_By brand:_ ${groupAndMap(data, 'brand')}\n` +
        `_By model:_ ${groupAndMap(data, 'model')}\n` +
        `_By status:_ ${groupAndMap(data, 'status')}`,
    }
  }

  if (matchAny(q, ['repair', 'repairs'])) {
    if (matchAny(q, ['pending', 'open', 'awaiting', 'not done', 'in-progress', 'in progress'])) {
      const { data } = await repairAPI.getAll()
      const pending = data.filter(r => r.status !== 'completed')
      return {
        type: 'list',
        text: `⏳ **Pending/In-Progress Repairs (${pending.length})**\n\n` +
          pending.map(r => `• **${r.printerName}** — ${r.status} (${r.technicianName})`).join('\n') +
          (pending.length === 0 ? '\nNo pending repairs.' : ''),
      }
    }
    if (matchAny(q, ['completed', 'done', 'finished'])) {
      const { data } = await repairAPI.getAll()
      const done = data.filter(r => r.status === 'completed')
      return {
        type: 'list',
        text: `✅ **Completed Repairs (${done.length})**\n\n` +
          done.map(r => `• **${r.printerName}** — ${new Date(r.repairDate).toLocaleDateString()} (${r.technicianName})`).join('\n') +
          (done.length === 0 ? '\nNo completed repairs.' : ''),
      }
    }
    if (matchAny(q, ['month', 'this month', 'recent'])) {
      const { data } = await repairAPI.getAll()
      const now = new Date()
      const thisMonth = data.filter(r => {
        const d = new Date(r.repairDate)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      return {
        type: 'stats',
        text: `📅 **Repairs This Month (${thisMonth.length})**\n\n` +
          `Pending: ${thisMonth.filter(r => r.status === 'pending').length}\n` +
          `In Progress: ${thisMonth.filter(r => r.status === 'in-progress').length}\n` +
          `Completed: ${thisMonth.filter(r => r.status === 'completed').length}\n` +
          `Cancelled: ${thisMonth.filter(r => r.status === 'cancelled').length}`,
      }
    }
    const { data } = await repairAPI.getAll()
    return {
      type: 'stats',
      text: `🔧 **Repair Overview**\n\n` +
        `**Total:** ${data.length}\n\n` +
        `_By status:_ ${groupAndMap(data, 'status')}`,
    }
  }

  if (matchAny(q, ['inventory', 'stock', 'spare part', 'part', 'parts', 'supplies'])) {
    if (matchAny(q, ['low', 'critical', 'running out', 'short'])) {
      const { data } = await inventoryAPI.getAll()
      const low = data.filter(i => i.quantity <= 5)
      return {
        type: 'list',
        text: `⚠️ **Low Stock Items (${low.length})**\n\n` +
          low.map(i => `• **${i.partName}** — ${i.quantity} left (${i.supplier})`).join('\n') +
          (low.length === 0 ? '\nAll items are well-stocked.' : ''),
      }
    }
    const { data } = await inventoryAPI.getAll()
    return {
      type: 'stats',
      text: `📦 **Inventory Summary**\n\n` +
        `**Total Items:** ${data.length}\n` +
        `**Low Stock (≤5):** ${data.filter(i => i.quantity <= 5).length}\n` +
        `**Total Value:** $${data.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}\n\n` +
        `_Top items by quantity:_\n${
          data.sort((a, b) => b.quantity - a.quantity).slice(0, 5)
            .map(i => `• ${i.partName} (${i.quantity})`).join('\n')
        }`,
    }
  }

  if (matchAny(q, ['technician', 'technicians', 'tech', 'workload', 'staff'])) {
    const { data } = await technicianAPI.getAll()
    const { data: repairs } = await repairAPI.getAll()
    return {
      type: 'stats',
      text: `👨‍🔧 **Technician Overview**\n\n` +
        `**Total:** ${data.length}\n` +
        `Available: ${data.filter(t => t.status === 'available').length}\n` +
        `Busy: ${data.filter(t => t.status === 'busy').length}\n` +
        `Offline: ${data.filter(t => t.status === 'offline').length}\n\n` +
        `**Workload:**\n${
          data.map(t => {
            const count = repairs.filter(r => r.technicianName === t.name).length
            return `• ${t.name} — ${count} repair${count !== 1 ? 's' : ''}`
          }).join('\n')
        }`,
    }
  }

  const { data } = await exportAPI.getDashboard()
  return {
    type: 'text',
    text: `🤖 I'm not sure how to answer that. Here's the current **dashboard snapshot**:\n\n` +
      `🖨️ ${data.totalPrinters} printers | 🔧 ${data.totalRepairs} repairs\n` +
      `📦 ${data.totalInventory} items | 👨‍🔧 ${data.totalTechnicians} techs\n\n` +
      `Try asking about: printers, repairs, inventory, or technicians.`,
  }
}

function groupAndMap(items, field) {
  const groups = {}
  items.forEach(item => {
    const val = item[field] || 'Unknown'
    groups[val] = (groups[val] || 0) + 1
  })
  return Object.entries(groups).map(([k, v]) => `${k} (${v})`).join(', ')
}

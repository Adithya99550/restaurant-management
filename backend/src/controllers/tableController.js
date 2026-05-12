const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllTables = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      orderBy: { number: 'asc' },
      include: {
        orders: {
          where: {
            status: { not: 'PAID' }
          },
          include: {
            orderItems: {
              include: { menuItem: true }
            }
          }
        }
      }
    });
    res.json({ success: true, data: tables });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTable = async (req, res) => {
  try {
    const { id } = req.params;
    const table = await prisma.table.findUnique({
      where: { id: parseInt(id) },
      include: {
        orders: {
          where: { status: { not: 'PAID' } },
          include: {
            orderItems: { include: { menuItem: true } },
            waiter: true
          }
        }
      }
    });

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    res.json({ success: true, data: table });
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateTableStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const table = await prisma.table.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        orders: {
          where: { status: { not: 'PAID' } },
          include: { orderItems: true }
        }
      }
    });

    req.io.emit('table_status_update', table);

    res.json({ success: true, data: table });
  } catch (error) {
    console.error('Update table status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllTables, getTable, updateTableStatus };
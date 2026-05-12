const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const generateBill = async (req, res) => {
  try {
    const { orderId } = req.params;
    const parsedOrderId = parseInt(orderId);

    if (isNaN(parsedOrderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID' });
    }

    const existingBill = await prisma.bill.findUnique({
      where: { orderId: parsedOrderId }
    });

    if (existingBill) {
      return res.status(400).json({ success: false, message: 'Bill already exists for this order' });
    }

    const order = await prisma.order.findUnique({
      where: { id: parsedOrderId },
      include: {
        orderItems: { include: { menuItem: true } },
        table: true
      }
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const totalAmount = order.orderItems.reduce((sum, item) => {
      return sum + (item.menuItem.price * item.quantity);
    }, 0);

    const result = await prisma.$transaction(async (tx) => {
      const bill = await tx.bill.create({
        data: {
          orderId: order.id,
          tableId: order.tableId,
          totalAmount,
          status: 'UNPAID'
        }
      });

      await tx.order.update({
        where: { id: order.id },
        data: { status: 'BILLED' }
      });

      await tx.table.update({
        where: { id: order.tableId },
        data: { status: 'BILLING' }
      });

      return bill;
    });

    const billWithOrder = await prisma.bill.findUnique({
      where: { id: result.id },
      include: {
        order: { include: { orderItems: { include: { menuItem: true } } } },
        table: true
      }
    });

    req.io.emit('bill_generated', billWithOrder);
    req.io.to('waiter').emit('bill_generated', billWithOrder);

    res.status(201).json({ success: true, data: billWithOrder });
  } catch (error) {
    console.error('Generate bill error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const payBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { method } = req.body;

    const bill = await prisma.bill.findUnique({
      where: { id: parseInt(id) },
      include: { order: true }
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          billId: bill.id,
          amount: bill.totalAmount,
          method: method || 'CASH'
        }
      });

      await tx.bill.update({
        where: { id: bill.id },
        data: { status: 'PAID' }
      });

      await tx.order.update({
        where: { id: bill.orderId },
        data: { status: 'PAID' }
      });

      await tx.table.update({
        where: { id: bill.tableId },
        data: { status: 'AVAILABLE' }
      });

      return payment;
    });

    const updatedTable = await prisma.table.findUnique({
      where: { id: bill.tableId }
    });

    req.io.emit('payment_done', { table: updatedTable, billId: bill.id });
    req.io.emit('table_status_update', updatedTable);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Pay bill error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getTodayRevenue = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bills = await prisma.bill.findMany({
      where: {
        status: 'PAID',
        createdAt: { gte: today }
      }
    });

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const orderCount = bills.length;

    res.json({
      success: true,
      data: { totalRevenue, orderCount }
    });
  } catch (error) {
    console.error('Get today revenue error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllBills = async (req, res) => {
  try {
    const bills = await prisma.bill.findMany({
      include: {
        order: { include: { orderItems: { include: { menuItem: true } } } },
        table: true,
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: bills });
  } catch (error) {
    console.error('Get all bills error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { generateBill, payBill, getTodayRevenue, getAllBills };
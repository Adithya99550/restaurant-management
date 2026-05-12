const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createOrder = async (req, res) => {
  try {
    const { tableId, items } = req.body;
    const waiterId = req.user.id;

    if (!tableId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Table ID and items required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          tableId: parseInt(tableId),
          waiterId,
          status: 'PENDING',
          orderItems: {
            create: items.map(item => ({
              menuItemId: parseInt(item.menuItemId),
              quantity: parseInt(item.quantity) || 1,
              status: 'PENDING'
            }))
          }
        },
        include: {
          orderItems: { include: { menuItem: true } },
          table: true,
          waiter: true
        }
      });

      await tx.table.update({
        where: { id: parseInt(tableId) },
        data: { status: 'ORDERING' }
      });

      return order;
    });

    req.io.emit('new_order', result);
    req.io.to('kitchen').to('cashier').emit('new_order', result);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getOrdersByTable = async (req, res) => {
  try {
    const { tableId } = req.params;
    const orders = await prisma.order.findMany({
      where: { tableId: parseInt(tableId), status: { not: 'PAID' } },
      include: {
        orderItems: { include: { menuItem: true } },
        waiter: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get orders by table error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getActiveOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'BILLED'] }
      },
      include: {
        orderItems: { include: { menuItem: true } },
        table: true,
        waiter: true
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Get active orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        orderItems: { include: { menuItem: true } },
        table: true,
        waiter: true
      }
    });

    if (status === 'PREPARING') {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'PREPARING' }
      });
    } else if (status === 'READY') {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'READY' }
      });
    } else if (status === 'SERVED') {
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: 'BILLING' }
      });
    }

    req.io.emit('order_status_update', order);
    req.io.to('waiter').to('cashier').emit('order_status_update', order);

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const addOrderItems = async (req, res) => {
  try {
    const { id } = req.params;
    const { items } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Items required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: parseInt(id) },
        data: {
          orderItems: {
            create: items.map(item => ({
              menuItemId: parseInt(item.menuItemId),
              quantity: parseInt(item.quantity) || 1,
              status: 'PENDING'
            }))
          }
        },
        include: {
          orderItems: { include: { menuItem: true } },
          table: true,
          waiter: true
        }
      });

      return order;
    });

    req.io.emit('order_updated', result);
    req.io.to('kitchen').emit('order_updated', result);

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Add order items error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateOrderItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { quantity, status } = req.body;

    const updateData = {};
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (status) updateData.status = status;

    const orderItem = await prisma.orderItem.update({
      where: { id: parseInt(itemId) },
      data: updateData,
      include: { menuItem: true }
    });

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: { include: { menuItem: true } },
        table: true
      }
    });

    req.io.emit('order_updated', order);
    req.io.to('kitchen').to('waiter').emit('order_updated', order);

    res.json({ success: true, data: orderItem });
  } catch (error) {
    console.error('Update order item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteOrderItem = async (req, res) => {
  try {
    const { id, itemId } = req.params;

    await prisma.orderItem.delete({
      where: { id: parseInt(itemId) }
    });

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: { include: { menuItem: true } },
        table: true
      }
    });

    req.io.emit('order_updated', order);

    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    console.error('Delete order item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createOrder,
  getOrdersByTable,
  getActiveOrders,
  updateOrderStatus,
  addOrderItems,
  updateOrderItem,
  deleteOrderItem
};
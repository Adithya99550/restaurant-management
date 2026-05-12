const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getSalesOverview = async (req, res) => {
  try {
    const { period } = req.query;
    let startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
    }

    const payments = await prisma.payment.findMany({
      where: {
        paidAt: { gte: startDate }
      },
      include: {
        bill: {
          include: {
            order: {
              include: {
                orderItems: true
              }
            }
          }
        }
      }
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOrders = payments.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      period
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSalesByPeriod = async (req, res) => {
  try {
    const { period } = req.query;
    let groupBy, startDate;

    switch (period) {
      case 'daily':
        groupBy = 'day';
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'hourly':
        groupBy = 'hour';
        startDate = new Date();
        startDate.setHours(startDate.getHours() - 24);
        break;
      default:
        groupBy = 'day';
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
    }

    const payments = await prisma.payment.findMany({
      where: {
        paidAt: { gte: startDate }
      }
    });

    const groupedData = {};
    payments.forEach(payment => {
      let key;
      const date = new Date(payment.paidAt);

      if (groupBy === 'hour') {
        key = `${date.getHours()}:00`;
      } else {
        key = date.toISOString().split('T')[0];
      }

      if (!groupedData[key]) {
        groupedData[key] = { date: key, revenue: 0, count: 0 };
      }
      groupedData[key].revenue += payment.amount;
      groupedData[key].count += 1;
    });

    const result = Object.values(groupedData).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPopularItems = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: 'BILLED'
      },
      include: {
        orderItems: {
          include: {
            menuItem: true
          }
        }
      }
    });

    const itemCounts = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = {
            id: item.menuItemId,
            name: item.menuItem.name,
            category: item.menuItem.category,
            quantity: 0,
            revenue: 0
          };
        }
        itemCounts[item.menuItemId].quantity += item.quantity;
        itemCounts[item.menuItemId].revenue += item.quantity * item.menuItem.price;
      });
    });

    const sortedItems = Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    res.json(sortedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getWaiterPerformance = async (req, res) => {
  try {
    const waiters = await prisma.user.findMany({
      where: { role: 'WAITER' },
      include: {
        orders: {
          where: { status: 'BILLED' },
          include: {
            orderItems: {
              include: {
                menuItem: true
              }
            }
          }
        }
      }
    });

    const performance = waiters.map(waiter => {
      let totalOrders = 0;
      let totalRevenue = 0;

      waiter.orders.forEach(order => {
        totalOrders++;
        order.orderItems.forEach(item => {
          totalRevenue += item.quantity * item.menuItem.price;
        });
      });

      return {
        id: waiter.id,
        name: waiter.name,
        totalOrders,
        totalRevenue,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      };
    });

    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTableUtilization = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      include: {
        orders: {
          where: {
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 30))
            }
          }
        }
      }
    });

    const utilization = tables.map(table => ({
      id: table.id,
      number: table.number,
      totalOrders: table.orders.length,
      utilizationRate: Math.round((table.orders.length / 30) * 100)
    }));

    res.json(utilization);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategoryBreakdown = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: 'BILLED' },
      include: {
        orderItems: {
          include: { menuItem: true }
        }
      }
    });

    const categoryData = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const cat = item.menuItem.category;
        if (!categoryData[cat]) {
          categoryData[cat] = { category: cat, revenue: 0, count: 0 };
        }
        categoryData[cat].revenue += item.quantity * item.menuItem.price;
        categoryData[cat].count += item.quantity;
      });
    });

    res.json(Object.values(categoryData).sort((a, b) => b.revenue - a.revenue));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
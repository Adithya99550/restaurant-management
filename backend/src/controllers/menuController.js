const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });
    res.json({ success: true, data: menuItems });
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getMenuByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const menuItems = await prisma.menuItem.findMany({
      where: { category, isAvailable: true },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: menuItems });
  } catch (error) {
    console.error('Get menu by category error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const { name, category, price, description } = req.body;

    const menuItem = await prisma.menuItem.create({
      data: { name, category, price, description }
    });

    res.status(201).json({ success: true, data: menuItem });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllMenuItems, getMenuByCategory, createMenuItem };
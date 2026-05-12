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

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, isAvailable } = req.body;

    const menuItem = await prisma.menuItem.update({
      where: { id: parseInt(id) },
      data: { name, category, price, description, isAvailable }
    });

    res.json({ success: true, data: menuItem });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.menuItem.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getAllMenuItems, getMenuByCategory, createMenuItem, updateMenuItem, deleteMenuItem };
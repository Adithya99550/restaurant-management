const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create users
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const hashedPasswordWaiter = await bcrypt.hash('waiter123', 10);
  const hashedPasswordKitchen = await bcrypt.hash('kitchen123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@restaurant.com',
      password: hashedPassword,
      role: 'CASHIER'
    }
  });

  await prisma.user.upsert({
    where: { email: 'waiter1@restaurant.com' },
    update: {},
    create: {
      name: 'Waiter 1',
      email: 'waiter1@restaurant.com',
      password: hashedPasswordWaiter,
      role: 'WAITER'
    }
  });

  await prisma.user.upsert({
    where: { email: 'waiter2@restaurant.com' },
    update: {},
    create: {
      name: 'Waiter 2',
      email: 'waiter2@restaurant.com',
      password: hashedPasswordWaiter,
      role: 'WAITER'
    }
  });

  await prisma.user.upsert({
    where: { email: 'kitchen@restaurant.com' },
    update: {},
    create: {
      name: 'Kitchen',
      email: 'kitchen@restaurant.com',
      password: hashedPasswordKitchen,
      role: 'KITCHEN'
    }
  });

  console.log('Users created');

  // Create tables
  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: { number: i },
      update: {},
      create: {
        number: i,
        status: 'AVAILABLE'
      }
    });
  }

  console.log('Tables created');

  // Create menu items
  const menuItems = [
    // Starters
    { name: 'Veg Spring Roll', category: 'Starters', price: 120, description: 'Crispy vegetable rolls' },
    { name: 'Paneer Tikka', category: 'Starters', price: 180, description: 'Grilled paneer cubes' },
    { name: 'Chicken Wings', category: 'Starters', price: 220, description: 'Spicy chicken wings' },
    // Mains
    { name: 'Dal Makhani', category: 'Mains', price: 160, description: 'Slow cooked black lentils' },
    { name: 'Butter Chicken', category: 'Mains', price: 280, description: 'Creamy tomato curry' },
    { name: 'Paneer Butter Masala', category: 'Mains', price: 220, description: 'Paneer in butter gravy' },
    { name: 'Biryani', category: 'Mains', price: 260, description: 'Aromatic rice with spices' },
    { name: 'Fried Rice', category: 'Mains', price: 180, description: 'Wok fried rice' },
    // Breads
    { name: 'Naan', category: 'Breads', price: 40, description: 'Tandoor baked bread' },
    { name: 'Roti', category: 'Breads', price: 30, description: 'Whole wheat flatbread' },
    { name: 'Garlic Naan', category: 'Breads', price: 60, description: 'Naan with garlic' },
    // Beverages
    { name: 'Lassi', category: 'Beverages', price: 80, description: 'Sweet yogurt drink' },
    { name: 'Cold Coffee', category: 'Beverages', price: 100, description: 'Iced coffee' },
    { name: 'Fresh Lime Soda', category: 'Beverages', price: 70, description: 'Lime with soda' },
    { name: 'Masala Chai', category: 'Beverages', price: 40, description: 'Spiced Indian tea' },
  ];

  for (const item of menuItems) {
    const existing = await prisma.menuItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.menuItem.create({ data: item });
    }
  }

  console.log('Menu items created');
  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingCart } from 'lucide-react';

export default function MenuDisplay({ menuItems, cart, onAddToCart, onRemoveFromCart }) {
  const [category, setCategory] = useState('All');

  const categories = ['All', ...new Set(menuItems.map((item) => item.category))];

  const filteredItems =
    category === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === category);

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="pb-24">
      <div className="sticky top-0 bg-background/95 backdrop-blur z-10 py-4 border-b border-border">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                category === cat
                  ? 'bg-customer text-background'
                  : 'bg-card text-muted-foreground border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        {filteredItems.map((item, index) => {
          const cartItem = cart.find((c) => c.id === item.id);
          const quantity = cartItem?.quantity || 0;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-card border border-border rounded-xl p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-foreground font-semibold">{item.name}</h3>
                <span className="text-cashier font-bold">₹{item.price}</span>
              </div>
              {item.description && (
                <p className="text-muted-foreground text-sm mb-3">
                  {item.description}
                </p>
              )}

              {quantity === 0 ? (
                <button
                  onClick={() => onAddToCart(item)}
                  className="w-full bg-customer/20 text-customer py-2 rounded-lg hover:bg-customer/30 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add to Order
                </button>
              ) : (
                <div className="flex items-center justify-between bg-customer/10 rounded-lg p-2">
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="p-2 text-customer hover:bg-customer/20 rounded"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-foreground font-bold">{quantity}</span>
                  <button
                    onClick={() => onAddToCart(item)}
                    className="p-2 text-customer hover:bg-customer/20 rounded"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
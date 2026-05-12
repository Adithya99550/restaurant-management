'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import api from '../../../lib/api';
import MenuDisplay from '../../../components/customer/MenuDisplay';
import OrderSummary from '../../../components/customer/OrderSummary';

export default function CustomerPage() {
  const params = useParams();
  const tableId = params.tableId;
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, orderRes] = await Promise.all([
          api.get('/menu'),
          api.get(`/orders/table/${tableId}`),
        ]);
        setMenuItems(menuRes.data.data);
        const activeOrder = orderRes.data.data.find(
          (o) => o.status !== 'PAID'
        );
        if (activeOrder) {
          setOrder(activeOrder);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const interval = setInterval(async () => {
      try {
        const orderRes = await api.get(`/orders/table/${tableId}`);
        const activeOrder = orderRes.data.data.find(
          (o) => o.status !== 'PAID'
        );
        if (activeOrder) {
          setOrder(activeOrder);
        }
      } catch (error) {
        console.error('Failed to refresh order:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tableId]);

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (itemId) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((c) =>
          c.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prev.filter((c) => c.id !== itemId);
    });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);

    try {
      const items = cart.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
      }));

      const res = await api.post('/orders', { tableId: parseInt(tableId), items });
      setOrder(res.data.data);
      setCart([]);
      setShowCart(false);
    } catch (error) {
      console.error('Failed to place order:', error);
    } finally {
      setPlacingOrder(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card border-b border-border p-4 sticky top-0 z-20"
      >
        <h1 className="text-2xl font-display font-bold text-customer text-center">
          Table {tableId}
        </h1>
        <p className="text-muted-foreground text-center text-sm">
          Scan to order
        </p>
      </motion.header>

      {order && <OrderSummary order={order} tableNumber={tableId} />}

      <MenuDisplay
        menuItems={menuItems}
        cart={cart}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
      />

      {cart.length > 0 && !order && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4"
        >
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-customer text-background py-3 rounded-xl font-semibold flex items-center justify-between px-4"
          >
            <span>View Order</span>
            <span className="bg-background/20 px-3 py-1 rounded-full">
              {cart.length} items
            </span>
          </button>
        </motion.div>
      )}

      {showCart && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setShowCart(false)}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-display font-bold text-foreground mb-4">
              Your Order
            </h2>

            <div className="space-y-3 max-h-[50vh] overflow-y-auto mb-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <span className="text-foreground">{item.name}</span>
                    <span className="text-muted-foreground ml-2">
                      x{item.quantity}
                    </span>
                  </div>
                  <span className="text-foreground">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold mb-4">
              <span className="text-foreground">Total</span>
              <span className="text-customer">₹{cartTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder}
              className="w-full bg-customer text-background py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {placingOrder ? 'Placing Order...' : 'Place Order'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
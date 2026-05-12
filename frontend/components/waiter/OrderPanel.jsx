'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, Send } from 'lucide-react';
import api from '../../lib/api';
import { OrderStatusBadge } from '../shared/StatusBadge';

export default function OrderPanel({ table, onClose, onUpdate }) {
  const [items, setItems] = useState(
    table.orders?.[0]?.orderItems?.map((item) => ({
      ...item,
      originalQuantity: item.quantity,
    })) || []
  );
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentOrder = table.orders?.[0];
  const orderStatus = currentOrder?.status;

  const handleQuantityChange = (itemId, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveItem = async (itemId) => {
    if (!currentOrder) return;
    setLoading(true);
    try {
      await api.delete(`/orders/${currentOrder.id}/items/${itemId}`);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
      onUpdate();
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendToKitchen = async () => {
    if (!currentOrder || items.length === 0) return;
    setLoading(true);
    try {
      await api.patch(`/orders/${currentOrder.id}/status`, { status: 'CONFIRMED' });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to send to kitchen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkServed = async () => {
    if (!currentOrder) return;
    setLoading(true);
    try {
      await api.patch(`/orders/${currentOrder.id}/status`, { status: 'SERVED' });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to mark served:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l border-border z-50 flex flex-col"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">
              Table {table.number}
            </h2>
            {orderStatus && <OrderStatusBadge status={orderStatus} />}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No items in order
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-background rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-foreground font-medium">
                      {item.menuItem.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      ₹{item.menuItem.price} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="p-1 bg-background rounded hover:bg-border"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="p-1 bg-background rounded hover:bg-border"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-kitchen hover:text-kitchen/80"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-waiter">₹{totalAmount}</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={() => setShowMenu(true)}
            className="w-full bg-background border border-border text-foreground py-3 rounded-lg hover:bg-border transition-colors"
          >
            <Plus className="inline mr-2" size={18} />
            Add Items
          </button>

          {orderStatus === 'PENDING' && items.length > 0 && (
            <button
              onClick={handleSendToKitchen}
              disabled={loading}
              className="w-full bg-waiter text-background py-3 rounded-lg hover:bg-waiter/90 disabled:opacity-50"
            >
              <Send className="inline mr-2" size={18} />
              Send to Kitchen
            </button>
          )}

          {orderStatus === 'READY' && (
            <button
              onClick={handleMarkServed}
              disabled={loading}
              className="w-full bg-cashier text-background py-3 rounded-lg hover:bg-cashier/90 disabled:opacity-50"
            >
              Mark as Served
            </button>
          )}
        </div>
      </motion.div>

      {showMenu && (
        <MenuSelector
          tableId={table.id}
          currentOrder={currentOrder}
          onClose={() => setShowMenu(false)}
          onAdd={(newItems) => {
            setItems((prev) => [...prev, ...newItems]);
            onUpdate();
          }}
        />
      )}
    </>
  );
}

function MenuSelector({ tableId, currentOrder, onClose, onAdd }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState({});
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get('/menu');
        setMenuItems(res.data.data);
      } catch (error) {
        console.error('Failed to fetch menu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const categories = ['All', ...new Set(menuItems.map((item) => item.category))];

  const filteredItems =
    category === 'All'
      ? menuItems
      : menuItems.filter((item) => item.category === category);

  const toggleItem = (item) => {
    setSelectedItems((prev) => {
      const updated = { ...prev };
      if (updated[item.id]) {
        delete updated[item.id];
      } else {
        updated[item.id] = { ...item, quantity: 1 };
      }
      return updated;
    });
  };

  const handleAddItems = async () => {
    const itemsData = Object.values(selectedItems).map((item) => ({
      menuItemId: item.id,
      quantity: item.quantity,
    }));

    try {
      let res;
      if (currentOrder) {
        // Add items to existing order
        res = await api.post(`/orders/${currentOrder.id}/items`, { items: itemsData });
        onAdd(res.data.data.orderItems);
      } else {
        // Create new order
        res = await api.post('/orders', { 
          tableId, 
          items: itemsData 
        });
        onAdd(res.data.data.orderItems);
      }
      onClose();
    } catch (error) {
      console.error('Failed to register items:', error);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-card border-t border-border z-50 rounded-t-2xl overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-display font-bold text-foreground mb-3">
            Add Items
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  category === cat
                    ? 'bg-waiter text-background'
                    : 'bg-background text-muted-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center text-muted-foreground">Loading...</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item)}
                  className={`p-3 rounded-lg text-left ${
                    selectedItems[item.id]
                      ? 'bg-waiter/20 border-2 border-waiter'
                      : 'bg-background border-2 border-transparent'
                  }`}
                >
                  <p className="text-foreground font-medium">{item.name}</p>
                  <p className="text-muted-foreground text-sm">₹{item.price}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleAddItems}
            disabled={Object.keys(selectedItems).length === 0}
            className="w-full bg-waiter text-background py-3 rounded-lg hover:bg-waiter/90 disabled:opacity-50"
          >
            Add {Object.keys(selectedItems).length} Items
          </button>
        </div>
      </motion.div>
    </>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import api from '../../../lib/api';

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', category: '', price: '', description: '' });
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await api.get('/menu');
      setMenuItems(res.data.data);
      const cats = [...new Set(res.data.data.map(item => item.category))];
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, formData);
      } else {
        await api.post('/menu', formData);
      }
      fetchMenu();
      closeModal();
    } catch (error) {
      console.error('Failed to save menu item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await api.delete(`/menu/${id}`);
      fetchMenu();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await api.put(`/menu/${item.id}`, { ...item, isAvailable: !item.isAvailable });
      fetchMenu();
    } catch (error) {
      console.error('Failed to toggle availability:', error);
    }
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, category: item.category, price: item.price.toString(), description: item.description || '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: '', category: '', price: '', description: '' });
  };

  const filteredItems = filterCategory === 'All' ? menuItems : menuItems.filter(item => item.category === filterCategory);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Menu Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilterCategory('All')}
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            filterCategory === 'All' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              filterCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-card border rounded-xl p-4 ${!item.isAvailable ? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <span className="text-lg font-bold text-primary">₹{item.price}</span>
              </div>
              {item.description && <p className="text-sm text-muted-foreground mb-3">{item.description}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`text-xs px-2 py-1 rounded ${item.isAvailable ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}
                >
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="p-1 text-muted-foreground hover:text-primary">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1 text-muted-foreground hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-display font-bold text-foreground">
                    {editingItem ? 'Edit Item' : 'Add Item'}
                  </h2>
                  <button onClick={closeModal} className="text-muted-foreground hover:text-foreground">
                    <X size={24} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      list="categories"
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                      required
                    />
                    <datalist id="categories">
                      {categories.map(cat => <option key={cat} value={cat} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Price</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Description (optional)</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                      rows={2}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90"
                  >
                    {editingItem ? 'Update' : 'Add'} Item
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Package } from 'lucide-react';
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
      const data = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description
      };
      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, data);
      } else {
        await api.post('/menu', data);
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
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-stone-900 mb-2">Menu</h1>
          <p className="text-stone-500">Manage your restaurant menu</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterCategory('All')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            filterCategory === 'All'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-100'
          }`}
        >
          All Items
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filterCategory === cat
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl border border-stone-100 p-5 shadow-sm transition-all hover:shadow-md ${!item.isAvailable ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-stone-400" />
                </div>
                <span className="text-xl font-display font-bold text-stone-900">₹{item.price}</span>
              </div>

              <h3 className="font-medium text-stone-900 mb-1">{item.name}</h3>
              <p className="text-sm text-stone-400 mb-3">{item.category}</p>
              {item.description && (
                <p className="text-xs text-stone-500 line-clamp-2 mb-4">{item.description}</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <button
                  onClick={() => handleToggleAvailability(item)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    item.isAvailable
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </button>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display text-stone-900">
                    {editingItem ? 'Edit Item' : 'Add New Item'}
                  </h2>
                  <button onClick={closeModal} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      list="categories"
                      className="input"
                      required
                    />
                    <datalist id="categories">
                      {categories.map(cat => <option key={cat} value={cat} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Price (₹)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="input"
                      rows={2}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                  >
                    {editingItem ? 'Save Changes' : 'Add Item'}
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
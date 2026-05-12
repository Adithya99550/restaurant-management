'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, UserCheck } from 'lucide-react';
import api from '../../../lib/api';

const roles = ['WAITER', 'KITCHEN', 'CASHIER', 'ADMIN'];

const roleColors = {
  WAITER: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  KITCHEN: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  CASHIER: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
  ADMIN: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-100' },
};

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [filterRole, setFilterRole] = useState('All');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'WAITER' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/users');
      setStaff(res.data.data);
    } catch (error) {
      console.error('Failed to fetch staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        const { password, ...dataWithoutPassword } = formData;
        await api.put(`/users/${editingStaff.id}`, password ? formData : dataWithoutPassword);
      } else {
        await api.post('/users', formData);
      }
      fetchStaff();
      closeModal();
    } catch (error) {
      console.error('Failed to save staff:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this staff member?')) return;
    try {
      await api.delete(`/users/${id}`);
      fetchStaff();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const openEdit = (member) => {
    setEditingStaff(member);
    setFormData({ name: member.name, email: member.email, password: '', role: member.role });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setFormData({ name: '', email: '', password: '', role: 'WAITER' });
  };

  const filteredStaff = filterRole === 'All' ? staff : staff.filter(member => member.role === filterRole);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-stone-900 mb-2">Staff</h1>
          <p className="text-stone-500">Manage your restaurant team</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} />
          Add Staff
        </button>
      </div>

      {/* Role Filter */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setFilterRole('All')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            filterRole === 'All'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-100'
          }`}
        >
          All
        </button>
        {roles.map(role => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filterRole === role
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-100'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStaff.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl border border-stone-100 p-5 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${roleColors[member.role].bg}`}>
                  <UserCheck className={`w-6 h-6 ${roleColors[member.role].text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-stone-900 truncate">{member.name}</h3>
                  <p className="text-sm text-stone-400 truncate">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${roleColors[member.role].bg} ${roleColors[member.role].text}`}>
                  {member.role}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(member)}
                    className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
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
                    {editingStaff ? 'Edit Staff' : 'Add New Staff'}
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
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Password {editingStaff && '(leave blank to keep current)'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="input"
                      required={!editingStaff}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Role</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="input"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                  >
                    {editingStaff ? 'Save Changes' : 'Add Staff'}
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
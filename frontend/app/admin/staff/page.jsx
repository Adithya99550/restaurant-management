'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Users } from 'lucide-react';
import api from '../../../lib/api';

const roles = ['WAITER', 'KITCHEN', 'CASHIER', 'ADMIN'];

const roleColors = {
  WAITER: 'bg-blue-500/20 text-blue-500',
  KITCHEN: 'bg-green-500/20 text-green-500',
  CASHIER: 'bg-yellow-500/20 text-yellow-500',
  ADMIN: 'bg-purple-500/20 text-purple-500',
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Staff Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          <Plus size={18} />
          Add Staff
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilterRole('All')}
          className={`px-4 py-2 rounded-lg text-sm ${
            filterRole === 'All' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'
          }`}
        >
          All
        </button>
        {roles.map(role => (
          <button
            key={role}
            onClick={() => setFilterRole(role)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filterRole === role ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:bg-muted'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-muted-foreground">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map(member => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <Users size={24} className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${roleColors[member.role]}`}>
                  {member.role}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(member)} className="p-1 text-muted-foreground hover:text-primary">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(member.id)} className="p-1 text-muted-foreground hover:text-red-500">
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
                    {editingStaff ? 'Edit Staff' : 'Add Staff'}
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
                    <label className="block text-sm text-muted-foreground mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">
                      Password {editingStaff && '(leave blank to keep current)'}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                      required={!editingStaff}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Role</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/90"
                  >
                    {editingStaff ? 'Update' : 'Add'} Staff
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
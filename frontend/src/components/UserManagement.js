import React, { useState, useEffect } from 'react';
import UsersService from '../services/usersService';
import { USER_ROLES } from '../constants';

const UserManagement = ({ onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'viewer',
        department: '',
        status: 'active'
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await UsersService.getAll();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await UsersService.update(editingUser.id, formData);
            } else {
                await UsersService.create(formData);
            }
            setShowForm(false);
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'viewer',
                department: '',
                status: 'active'
            });
            loadUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Failed to save user: ' + error.message);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            department: user.department,
            status: user.status
        });
        setShowForm(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await UsersService.delete(userId);
                loadUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user');
            }
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">User Management</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>

                    {!showForm ? (
                        <>
                            <div className="mb-4">
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    + Add New User
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">Loading users...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border p-2 text-left">Name</th>
                                                <th className="border p-2 text-left">Email</th>
                                                <th className="border p-2 text-left">Role</th>
                                                <th className="border p-2 text-left">Department</th>
                                                <th className="border p-2 text-left">Status</th>
                                                <th className="border p-2 text-left">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user.id} className="hover:bg-gray-50">
                                                    <td className="border p-2">{user.name}</td>
                                                    <td className="border p-2">{user.email}</td>
                                                    <td className="border p-2">
                                                        {USER_ROLES[user.role]?.label || user.role}
                                                    </td>
                                                    <td className="border p-2">{user.department}</td>
                                                    <td className="border p-2">
                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                            user.status === 'active' 
                                                                ? 'bg-green-100 text-green-800' 
                                                                : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {user.status}
                                                        </span>
                                                    </td>
                                                    <td className="border p-2">
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="text-blue-600 hover:text-blue-800 mr-2"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h3 className="text-xl font-semibold mb-4">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h3>

                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>

                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="w-full p-2 border rounded"
                                        required={!editingUser}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                >
                                    {Object.entries(USER_ROLES).map(([key, role]) => (
                                        <option key={key} value={key}>{role.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Department</label>
                                <input
                                    type="text"
                                    value={formData.department}
                                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    {editingUser ? 'Update User' : 'Add User'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditingUser(null);
                                        setFormData({
                                            name: '',
                                            email: '',
                                            password: '',
                                            role: 'viewer',
                                            department: '',
                                            status: 'active'
                                        });
                                    }}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;

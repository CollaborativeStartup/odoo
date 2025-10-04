import React, { useState } from 'react';
import { Plus, Send, X, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([
    { id: 1, name: 'marc', role: 'Manager', manager: 'sarah', email: 'marc@gmail.com' }
  ]);
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', role: 'Employee', manager: '', email: '' });

  const addUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([...users, { ...newUser, id: users.length + 1 }]);
      setNewUser({ name: '', role: 'Employee', manager: '', email: '' });
      setShowNewUser(false);
    }
  };

  const sendPassword = (user) => {
    alert(`Password sent to ${user.email}`);
  };

  const handleSetRules = (user) => {
    // You can pass user data through state if needed
    navigate('/admin/set-rules', { state: { user } });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white border-2 border-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setShowNewUser(true)}
            className="px-4 py-2 bg-white border-2 border-gray-800 rounded hover:bg-gray-50 flex items-center gap-2"
          >
            <Plus size={16} /> New
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="text-left p-2 font-semibold">User</th>
                <th className="text-left p-2 font-semibold">Role</th>
                <th className="text-left p-2 font-semibold">Manager</th>
                <th className="text-left p-2 font-semibold">Email</th>
                <th className="text-left p-2 font-semibold">Rules</th>
                <th className="text-left p-2 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-300">
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">
                    <select className="border border-gray-300 rounded px-2 py-1" value={user.role}>
                      <option>Manager</option>
                      <option>Employee</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <select className="border border-gray-300 rounded px-2 py-1" value={user.manager}>
                      <option>{user.manager}</option>
                    </select>
                  </td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">
                    <button 
                      onClick={() => handleSetRules(user)}
                      className="hover:bg-gray-100 p-1 rounded cursor-pointer"
                      aria-label="Set rules"
                    >
                      <Pencil size={18} />
                    </button>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => sendPassword(user)}
                      className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
                    >
                      Send password
                    </button>
                  </td>
                </tr>
              ))}
              {showNewUser && (
                <tr className="border-b border-gray-300 bg-gray-50">
                  <td className="p-2">
                    <input
                      type="text"
                      placeholder="Name"
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    />
                  </td>
                  <td className="p-2">
                    <select
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      <option>Manager</option>
                      <option>Employee</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      placeholder="Manager"
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                      value={newUser.manager}
                      onChange={(e) => setNewUser({ ...newUser, manager: e.target.value })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="email"
                      placeholder="Email"
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    />
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={addUser}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowNewUser(false)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
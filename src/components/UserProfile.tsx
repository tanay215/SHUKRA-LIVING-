import { useState } from 'react';
import { X, User, Mail, MapPin, Phone, Camera, Edit, LogOut, Save } from 'lucide-react';
import { User as UserType } from '../types';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdateProfile: (updatedUser: Partial<UserType>) => void;
  onLogout: () => void;
}

const UserProfile = ({ isOpen, onClose, user, onUpdateProfile, onLogout }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state
  });

  if (!isOpen) return null;

  const handleSave = () => {
    onUpdateProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      state: user.state
    });
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-accent p-6 flex justify-between items-center text-white">
          <div>
            <h2 className="text-2xl font-heading">My Profile</h2>
            <p className="text-white/80 text-sm">Manage your account information</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {/* Profile Picture Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center text-accent border-4 border-accent/30">
                {user.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User size={40} />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-accent text-white p-2 rounded-full hover:bg-accent/90 transition">
                <Camera size={16} />
              </button>
            </div>
            <h3 className="text-xl font-heading text-accent mt-3">{user.firstName} {user.lastName}</h3>
            <p className="text-gray-600 text-sm">User ID: {user.userId}</p>
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-heading text-gray-800">Personal Information</h4>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 text-accent hover:bg-accent/10 px-3 py-1 rounded-lg transition"
                >
                  <Edit size={16} />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-accent text-white px-3 py-1 rounded-lg hover:bg-accent/90 transition"
                  >
                    <Save size={16} />
                    Save
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.firstName}
                    onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-accent outline-none"
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg">{user.firstName}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.lastName}
                    onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-accent outline-none"
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg">{user.lastName}</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail size={16} className="inline mr-2" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:border-accent outline-none"
                />
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg">{user.email}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone size={16} className="inline mr-2" />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:border-accent outline-none"
                />
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg">{user.phone}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} className="inline mr-2" />
                Delivery Address
              </label>
              {isEditing ? (
                <textarea
                  value={editData.address}
                  onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:border-accent outline-none h-20"
                />
              ) : (
                <div className="bg-gray-50 p-3 rounded-lg">{user.address}</div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.city}
                    onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-accent outline-none"
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg">{user.city}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.state}
                    onChange={(e) => setEditData(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:border-accent outline-none"
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg">{user.state}</div>
                )}
              </div>
            </div>

            <div className="border-t pt-6 mt-8">
              <button 
                onClick={onLogout}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-bold tracking-wide hover:bg-red-600 transition shadow-lg flex items-center justify-center gap-2"
              >
                <LogOut size={20} />
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
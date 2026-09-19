import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthUtils } from '../utils/auth';

const API_BASE_URL = 'http://localhost:30011/api';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState({
    user: null,
    token: AuthUtils.getToken(),
    isAuthenticated: AuthUtils.isAuthenticated()
  });
  const [editProfileData, setEditProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = AuthUtils.getToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axios.get(`${API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = response.data;
      setAuth(prev => ({ ...prev, user }));
      setEditProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || ''
        }
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      AuthUtils.clearAuth();
      navigate('/login');
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_BASE_URL}/users/profile`, editProfileData, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setAuth(prev => ({ ...prev, user: response.data.user }));
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handleChangeProfilePicture = async () => {
    if (!profileImageUrl) {
      alert('Please enter image URL');
      return;
    }
    try {
      const response = await axios.put(`${API_BASE_URL}/users/profile`, {
        profileImage: profileImageUrl
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      setAuth(prev => ({ ...prev, user: response.data.user }));
      alert('Profile picture updated successfully!');
      setProfileImageUrl('');
      loadUserProfile();
    } catch (error) {
      alert('Failed to update profile picture');
    }
  };

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-accent">My Profile</h1>
          <button onClick={() => navigate('/dashboard')} className="text-accent hover:underline">
            Back to Shop
          </button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 overflow-hidden">
                {auth.user?.profileImage ? (
                  <img src={auth.user.profileImage} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  `${auth.user?.firstName?.[0] || ''}${auth.user?.lastName?.[0] || ''}`
                )}
              </div>
              <h3 className="font-bold text-lg">{auth.user?.firstName} {auth.user?.lastName}</h3>
              <p className="text-sm text-gray-600">{auth.user?.email}</p>
              <p className="text-xs text-gray-500">ID: {auth.user?.userId}</p>
            </div>
            
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'profile' ? 'bg-accent text-white' : 'hover:bg-gray-100'}`}
              >
                Edit Profile
              </button>
              <button 
                onClick={() => setActiveTab('picture')}
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'picture' ? 'bg-accent text-white' : 'hover:bg-gray-100'}`}
              >
                Change Picture
              </button>
              <button 
                onClick={() => setActiveTab('address')}
                className={`w-full text-left px-4 py-2 rounded ${activeTab === 'address' ? 'bg-accent text-white' : 'hover:bg-gray-100'}`}
              >
                Edit Address
              </button>
            </nav>
          </div>
          
          {/* Profile Content */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow p-6">
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Edit Profile Information</h2>
                <form onSubmit={handleEditProfile} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        value={editProfileData.firstName}
                        onChange={(e) => setEditProfileData({...editProfileData, firstName: e.target.value})}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        value={editProfileData.lastName}
                        onChange={(e) => setEditProfileData({...editProfileData, lastName: e.target.value})}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={editProfileData.phone}
                      onChange={(e) => setEditProfileData({...editProfileData, phone: e.target.value})}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={auth.user?.email || ''}
                      className="w-full p-3 border rounded-lg bg-gray-100"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition"
                  >
                    Update Profile
                  </button>
                </form>
              </div>
            )}
            
            {activeTab === 'picture' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Change Profile Picture</h2>
                <div className="text-center mb-6">
                  <div className="w-32 h-32 bg-accent rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 overflow-hidden">
                    {auth.user?.profileImage ? (
                      <img src={auth.user.profileImage} alt="Profile" className="w-32 h-32 rounded-full object-cover" />
                    ) : (
                      `${auth.user?.firstName?.[0] || ''}${auth.user?.lastName?.[0] || ''}`
                    )}
                  </div>
                  <p className="text-sm text-gray-600">Current Profile Picture</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">New Profile Picture URL</label>
                    <input
                      type="url"
                      placeholder="Enter new profile picture URL"
                      value={profileImageUrl}
                      onChange={(e) => setProfileImageUrl(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                    />
                  </div>
                  <button 
                    onClick={handleChangeProfilePicture}
                    className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition"
                  >
                    Update Picture
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'address' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Edit Address</h2>
                <form onSubmit={handleEditProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Street Address</label>
                    <input
                      type="text"
                      value={editProfileData.address.street}
                      onChange={(e) => setEditProfileData({...editProfileData, address: {...editProfileData.address, street: e.target.value}})}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <input
                        type="text"
                        value={editProfileData.address.city}
                        onChange={(e) => setEditProfileData({...editProfileData, address: {...editProfileData.address, city: e.target.value}})}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">State</label>
                      <input
                        type="text"
                        value={editProfileData.address.state}
                        onChange={(e) => setEditProfileData({...editProfileData, address: {...editProfileData.address, state: e.target.value}})}
                        className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={editProfileData.address.zipCode}
                      onChange={(e) => setEditProfileData({...editProfileData, address: {...editProfileData.address, zipCode: e.target.value}})}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition"
                  >
                    Update Address
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
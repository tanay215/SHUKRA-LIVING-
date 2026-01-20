import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AuthUtils } from '../utils/auth';
import OverviewTab from '../components/account/OverviewTab';
import OrdersTab from '../components/account/OrdersTab';
import SettingsTab from '../components/account/SettingsTab';

const API_BASE_URL = 'http://localhost:30011/api';

type TabType = 'overview' | 'orders' | 'settings';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [auth, setAuth] = useState<{
    user: any;
    token: string | null;
    isAuthenticated: boolean;
  }>({
    user: null,
    token: AuthUtils.getToken(),
    isAuthenticated: AuthUtils.isAuthenticated()
  });

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [profileImage, setProfileImage] = useState<string>(''); // For immediate local update if needed

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'orders', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

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
      setAuth(prev => ({ ...prev, user: response.data }));
      setProfileImage(response.data.profileImage || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
      AuthUtils.clearAuth();
      navigate('/login');
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleTabChange = (tab: string) => {
    if (['overview', 'orders', 'settings'].includes(tab)) {
      setActiveTab(tab as TabType);
      setSearchParams({ tab });
    }
  };

  const handleLogout = () => {
    AuthUtils.clearAuth();
    navigate('/login');
  };

  if (!auth.user) {
    return (
      <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A45C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EF] font-sans pb-20">
      {/* Top Navigation Bar / Breadcrumb optional */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-[#EEEAE4]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo or Branded Back Button */}
            <button onClick={() => navigate('/')} className="text-[#2B1E16] font-serif font-bold tracking-widest text-lg">
              SHUKRA
            </button>
          </div>

          <button onClick={handleLogout} className="text-sm text-[#8A8A8A] hover:text-[#2B1E16] transition-colors">
            Sign Out
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-12 max-w-5xl">

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 fade-in">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-lg bg-[#EEEAE4] flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-[#C9A45C] font-serif">{auth.user.firstName?.[0]}</span>
              )}
            </div>
            {/* Edit overlap button could go here */}
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-3xl font-serif text-[#2B1E16] mb-1">Welcome back, {auth.user.firstName}.</h1>
            <p className="text-[#8A8A8A]">Manage your orders and personal preferences.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center md:justify-start gap-2 mb-12 border-b border-[#EEEAE4] pb-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'orders', label: 'Orders' },
            { id: 'settings', label: 'Settings' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={`px-6 py-3 rounded-t-lg transition-all text-sm font-medium ${activeTab === tab.id
                ? 'text-[#2B1E16] border-b-2 border-[#C9A45C] bg-transparent'
                : 'text-[#8A8A8A] hover:text-[#2B1E16]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <OverviewTab user={auth.user} onNavigate={handleTabChange} />
          )}
          {activeTab === 'orders' && (
            <OrdersTab />
          )}
          {activeTab === 'settings' && (
            <SettingsTab
              user={auth.user}
              onUpdateUser={(updatedUser) => {
                setAuth(prev => ({ ...prev, user: updatedUser }));
                // also update local state if needed
              }}
            />
          )}
        </div>

      </main>
    </div>
  );
};

export default ProfilePage;
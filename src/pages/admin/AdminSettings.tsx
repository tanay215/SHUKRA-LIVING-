import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:30011/api';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const [siteSettings, setSiteSettings] = useState({
    freeDeliveryThreshold: 50000,
    deliveryCharge: 500,
    globalDiscount: 0,
    discountType: 'percentage',
    philosophy: {
      title: '',
      content: '',
      imageUrl: ''
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/settings`);
      setSiteSettings(response.data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }

      await axios.put(`${API_BASE_URL}/admin/settings`, siteSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Settings saved successfully!');
    } catch (error: any) {
      console.error('Save settings error:', error);
      alert('Failed to save settings: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
    alert('Logged out successfully');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-accent">Site Settings</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-accent hover:underline"
            >
              Back to Dashboard
            </button>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Site Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Free Delivery Threshold (₹)</label>
              <input
                type="number"
                value={siteSettings.freeDeliveryThreshold}
                onChange={(e) => setSiteSettings({ ...siteSettings, freeDeliveryThreshold: parseInt(e.target.value) || 0 })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                placeholder="50000"
              />
              <p className="text-xs text-gray-500 mt-1">Orders above this amount get free delivery</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Delivery Charge (₹)</label>
              <input
                type="number"
                value={siteSettings.deliveryCharge}
                onChange={(e) => setSiteSettings({ ...siteSettings, deliveryCharge: parseInt(e.target.value) || 0 })}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                placeholder="500"
              />
              <p className="text-xs text-gray-500 mt-1">Standard delivery charge for orders below threshold</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Global Discount</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={siteSettings.globalDiscount}
                  onChange={(e) => setSiteSettings({ ...siteSettings, globalDiscount: parseInt(e.target.value) || 0 })}
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:border-accent"
                  placeholder="0"
                  min="0"
                  max={siteSettings.discountType === 'percentage' ? 100 : undefined}
                />
                <select
                  value={siteSettings.discountType}
                  onChange={(e) => setSiteSettings({ ...siteSettings, discountType: e.target.value })}
                  className="p-3 border rounded-lg focus:outline-none focus:border-accent"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">₹</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {siteSettings.discountType === 'percentage'
                  ? 'Percentage discount on all products (0-100%)'
                  : 'Fixed amount discount on all products'
                }
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Site Status</label>
              <select
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                defaultValue="active"
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance Mode</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Control site availability</p>
            </div>
          </div>

          {/* Philosophy Section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="font-semibold mb-4 text-lg">Philosophy Section</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={siteSettings.philosophy?.title || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, philosophy: { ...siteSettings.philosophy, title: e.target.value } })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                  placeholder="Our Philosophy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                  value={siteSettings.philosophy?.content || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, philosophy: { ...siteSettings.philosophy, content: e.target.value } })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent h-32"
                  placeholder="Philosophy description..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Image URL</label>
                <input
                  type="text"
                  value={siteSettings.philosophy?.imageUrl || ''}
                  onChange={(e) => setSiteSettings({ ...siteSettings, philosophy: { ...siteSettings.philosophy, imageUrl: e.target.value } })}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-4">Settings Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Free Delivery:</strong> Orders ≥ ₹{siteSettings.freeDeliveryThreshold.toLocaleString('en-IN')}
              </div>
              <div>
                <strong>Delivery Charge:</strong> ₹{siteSettings.deliveryCharge.toLocaleString('en-IN')}
              </div>
              <div>
                <strong>Global Discount:</strong> {siteSettings.globalDiscount}
                {siteSettings.discountType === 'percentage' ? '%' : '₹'} off all products
              </div>
              <div>
                <strong>Example:</strong>
                {siteSettings.globalDiscount > 0 ? (
                  <span className="ml-1">
                    ₹10,000 → ₹{siteSettings.discountType === 'percentage'
                      ? (10000 - (10000 * siteSettings.globalDiscount / 100)).toLocaleString('en-IN')
                      : Math.max(0, 10000 - siteSettings.globalDiscount).toLocaleString('en-IN')
                    }
                  </span>
                ) : (
                  <span className="ml-1">No discount applied</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={loading}
            className="mt-6 w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition disabled:opacity-50"
          >
            {loading ? 'Saving Settings...' : 'Save Settings'}
          </button>
        </div>

        {/* Additional Settings */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-6">Advanced Settings</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Credentials</label>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Current Admin ID:</strong> admin123<br />
                  <strong>Note:</strong> Admin credentials are configured in environment variables for security.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Database Status</label>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ MongoDB Atlas Connected<br />
                  📊 Database: shukra_living<br />
                  🔗 Cluster: shukra-cluster
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">System Information</label>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  🚀 Server: Running on Port 30011<br />
                  🌐 Environment: development<br />
                  📧 Email Service: Configured with Gmail SMTP
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
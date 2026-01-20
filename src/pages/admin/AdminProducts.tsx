import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { debugLog, debugError, debugAPI } from '../../utils/debug';
import { AuthUtils } from '../../utils/auth';
import ReturnPolicyModal from '../../components/ReturnPolicyModal';

const API_BASE_URL = 'http://localhost:30011/api';

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '', category: '', price: '', description: '', images: [{ url: '' }], 
    brand: '', material: '', color: '', texture: '', woodType: '', supplier: '', stock: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [returnPolicyModalOpen, setReturnPolicyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = AuthUtils.getToken();
      debugLog('Loading products', { hasToken: !!token });
      
      if (!token) {
        debugError('No token found, redirecting to login');
        navigate('/admin/login');
        return;
      }
      
      debugAPI('GET', `${API_BASE_URL}/admin/products`);
      const response = await axios.get(`${API_BASE_URL}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      debugLog('Products loaded successfully', { count: response.data?.length || 0 });
      setProducts(response.data || []);
    } catch (error) {
      debugError('Failed to load products', error);
      console.error('Failed to load products:', error);
      
      // Only logout on specific auth errors, not network/server errors
      if (error.response?.status === 401 && 
          (error.response?.data?.error === 'Invalid token' || 
           error.response?.data?.error === 'Access denied')) {
        debugError('Unauthorized access, clearing tokens');
        AuthUtils.clearAuth();
        navigate('/admin/login');
      } else {
        alert('Failed to load products. Please check your connection.');
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };
  
  const seedProducts = async () => {
    try {
      const token = AuthUtils.getToken();
      if (!token) {
        navigate('/admin/login');
        return;
      }
      
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/admin/seed-products`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Products seeded:', response.data);
      await loadProducts();
      alert(`Successfully created ${response.data.count} sample products!`);
    } catch (error) {
      console.error('Seed products error:', error);
      alert('Failed to seed products: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }
      
      // Prepare the product data with proper structure
      const productData = {
        title: newProduct.title,
        description: newProduct.description,
        price: newProduct.price,
        category: newProduct.category,
        stock: newProduct.stock,
        images: newProduct.images
      };
      
      // Handle supplier properly
      if (newProduct.supplier) {
        productData.supplier = {
          name: newProduct.supplier,
          brandName: newProduct.brand || newProduct.supplier
        };
      }
      
      // Handle specifications
      if (newProduct.material || newProduct.color || newProduct.woodType) {
        productData.specifications = {
          material: newProduct.material || '',
          color: newProduct.color || '',
          wood: newProduct.woodType || ''
        };
      }
      
      console.log('Sending product data:', productData);
      const response = await axios.post(`${API_BASE_URL}/admin/products`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Product created:', response.data);
      setNewProduct({
        title: '', category: '', price: '', description: '', images: [{ url: '' }], 
        brand: '', material: '', color: '', texture: '', woodType: '', supplier: '', stock: ''
      });
      setShowAddForm(false);
      await loadProducts(); // Wait for products to reload
      alert('Product added successfully!');
    } catch (error) {
      console.error('Add product error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert('Failed to add product: ' + (error.response?.data?.error || error.message || 'Network Error'));
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Session expired. Please login again.');
        navigate('/admin/login');
        return;
      }
      
      // Prepare the update data with proper structure
      const updateData = {
        title: editingProduct.title,
        description: editingProduct.description,
        price: editingProduct.price,
        category: editingProduct.category,
        stock: editingProduct.stock,
        images: editingProduct.images
      };
      
      // Handle supplier properly
      if (editingProduct.supplier) {
        if (typeof editingProduct.supplier === 'string') {
          updateData.supplier = {
            name: editingProduct.supplier,
            brandName: editingProduct.brand || editingProduct.supplier
          };
        } else {
          updateData.supplier = editingProduct.supplier;
        }
      }
      
      // Handle specifications
      if (editingProduct.material || editingProduct.color || editingProduct.woodType) {
        updateData.specifications = {
          material: editingProduct.material || '',
          color: editingProduct.color || '',
          wood: editingProduct.woodType || ''
        };
      }
      
      const response = await axios.put(`${API_BASE_URL}/admin/products/${editingProduct._id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Product updated:', response.data);
      setEditingProduct(null);
      await loadProducts(); // Wait for products to reload
      alert('Product updated successfully!');
    } catch (error) {
      console.error('Update product error:', error);
      alert('Failed to update product: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteProduct = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Session expired. Please login again.');
          navigate('/admin/login');
          return;
        }
        
        await axios.delete(`${API_BASE_URL}/admin/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await loadProducts(); // Wait for products to reload
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Delete product error:', error);
        alert('Failed to delete product: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleLogout = async () => {
    try {
      const token = AuthUtils.getToken();
      if (token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      AuthUtils.clearAuth();
      navigate('/admin/login');
      alert('Logged out successfully');
    }
  };

  const openReturnPolicyModal = (product) => {
    setSelectedProduct(product);
    setReturnPolicyModalOpen(true);
  };

  const handleReturnPolicySuccess = () => {
    loadProducts(); // Reload products to show updated return policy
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-accent">Product Management</h1>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90"
            >
              {showAddForm ? 'Cancel' : 'Add Product'}
            </button>

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
        {/* Add Product Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Add New Product</h2>
            <form onSubmit={addProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Product Title"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({...newProduct, title: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                  required
                />
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Living">Living Room</option>
                  <option value="Dining">Dining Room</option>
                  <option value="Bedroom">Bedroom</option>
                  <option value="Office">Office</option>
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                  required
                />
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={newProduct.stock !== undefined ? newProduct.stock : ''}
                  onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                  min="0"
                  required
                />
                <input
                  type="text"
                  placeholder="Brand (e.g., Royal Heritage)"
                  value={newProduct.brand}
                  onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Material (e.g., Solid Wood, Leather)"
                  value={newProduct.material}
                  onChange={(e) => setNewProduct({...newProduct, material: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Color (e.g., Brown, Natural)"
                  value={newProduct.color}
                  onChange={(e) => setNewProduct({...newProduct, color: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Wood Type (e.g., Teak, Sheesham)"
                  value={newProduct.woodType}
                  onChange={(e) => setNewProduct({...newProduct, woodType: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Supplier Name"
                  value={newProduct.supplier}
                  onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={newProduct.images[0].url}
                  onChange={(e) => setNewProduct({...newProduct, images: [{url: e.target.value}]})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                  required
                />
              </div>
              <textarea
                placeholder="Product Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent h-32"
                required
              />
              <button 
                type="submit"
                className="w-full bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition"
              >
                Add Product
              </button>
            </form>
          </div>
        )}

        {/* Edit Product Form */}
        {editingProduct && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Edit Product</h2>
            <form onSubmit={updateProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Product Title"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                  required
                />
                <select
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Living">Living Room</option>
                  <option value="Dining">Dining Room</option>
                  <option value="Bedroom">Bedroom</option>
                  <option value="Office">Office</option>
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                  required
                />
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={editingProduct.stock !== undefined ? editingProduct.stock : ''}
                  onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                  min="0"
                  required
                />
                <input
                  type="text"
                  placeholder="Brand (e.g., Royal Heritage)"
                  value={editingProduct.brand || editingProduct.supplier?.brandName || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, brand: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Material (e.g., Solid Wood, Leather)"
                  value={editingProduct.material || editingProduct.specifications?.material || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, material: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Color (e.g., Brown, Natural)"
                  value={editingProduct.color || editingProduct.specifications?.color || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, color: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Wood Type (e.g., Teak, Sheesham)"
                  value={editingProduct.woodType || editingProduct.specifications?.wood || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, woodType: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                />
                <input
                  type="text"
                  placeholder="Supplier Name"
                  value={editingProduct.supplier?.name || editingProduct.supplier || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, supplier: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={editingProduct.images?.[0]?.url || ''}
                  onChange={(e) => setEditingProduct({...editingProduct, images: [{url: e.target.value}]})}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent"
                  required
                />
              </div>
              <textarea
                placeholder="Product Description"
                value={editingProduct.description || ''}
                onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                className="w-full p-3 border rounded-lg focus:outline-none focus:border-accent h-32"
                required
              />
              <div className="flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 bg-accent text-white py-3 rounded-lg font-semibold hover:bg-accent/90 transition"
                >
                  Update Product
                </button>
                <button 
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Products List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">All Products ({products.length})</h2>
              <div className="flex gap-2">
                <button 
                  onClick={loadProducts}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                {products.length === 0 && (
                  <button 
                    onClick={seedProducts}
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Sample Products'}
                  </button>
                )}
              </div>
            </div>
            {products.length === 0 && !loading && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-sm">
                  📦 No products found in database. Use "Create Sample Products" or "Add Product" to get started.
                </p>
              </div>
            )}
            {loading && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-gray-600 text-sm flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent"></div>
                  Loading products...
                </p>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Policy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="text-4xl mb-2">📦</div>
                        <p className="text-lg font-medium">No Products Found</p>
                        <p className="text-sm">Use "Add Product" to create your first product</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product._id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img className="w-12 h-12 rounded object-cover" src={product.images?.[0]?.url || 'https://via.placeholder.com/48'} alt={product.title} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.title}</div>
                          <div className="text-xs text-gray-500">{product.supplier?.brandName || product.brand || 'Shukra Living'}</div>
                          {product.specifications?.material && (
                            <div className="text-xs text-gray-400">{product.specifications.material}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{product.category}</div>
                      {product.specifications?.color && (
                        <div className="text-xs text-gray-400">{product.specifications.color}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>₹{product.price?.toLocaleString('en-IN')}</div>
                      {product.rating?.count > 0 && (
                        <div className="text-xs text-yellow-600">★ {product.rating.average.toFixed(1)} ({product.rating.count})</div>
                      )}
                      {product.rating?.count === 0 && (
                        <div className="text-xs text-gray-400">No ratings</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`${product.stock < 5 ? 'text-red-600 font-bold' : product.stock < 10 ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                        {product.stock || 0}
                      </span>
                      {product.stock < 5 && product.stock > 0 && (
                        <div className="text-xs text-red-500">Low Stock</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${product.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                      {product.offer && (
                        <div className="text-xs text-red-600 font-medium mt-1">{product.offer}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => openReturnPolicyModal(product)}
                        className={`px-3 py-1 text-xs rounded-full ${
                          product.returnPolicy?.isReturnable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        } hover:opacity-80 transition`}
                      >
                        {product.returnPolicy?.isReturnable 
                          ? `${product.returnPolicy.returnDays}d Return` 
                          : 'Non-Returnable'
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button 
                        onClick={() => {
                          setEditingProduct(product);
                          setShowAddForm(false);
                        }}
                        className="text-accent hover:text-accent/70"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteProduct(product._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Return Policy Modal */}
      <ReturnPolicyModal
        isOpen={returnPolicyModalOpen}
        onClose={() => setReturnPolicyModalOpen(false)}
        product={selectedProduct}
        onSuccess={handleReturnPolicySuccess}
      />
    </div>
  );
};

export default AdminProducts;
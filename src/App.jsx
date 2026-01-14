import React, { useState, useEffect } from 'react';
import { productService } from './services/api';
import ProductCard from './components/ProductCard';
import ProductForm from './components/ProductForm';
import Modal from './components/Modal';
import './index.css';

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [alert, setAlert] = useState(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAllProducts();
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleCreateProduct = async (productData) => {
    try {
      await productService.createProduct(productData);
      showAlert('Product created successfully!', 'success');
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      showAlert('Failed to create product. Please try again.', 'error');
      console.error('Error creating product:', err);
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      await productService.updateProduct(editingProduct.id, productData);
      showAlert('Product updated successfully!', 'success');
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      showAlert('Failed to update product. Please try again.', 'error');
      console.error('Error updating product:', err);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        await productService.deleteProduct(product.id);
        showAlert('Product deleted successfully!', 'success');
        fetchProducts();
      } catch (err) {
        showAlert('Failed to delete product. Please try again.', 'error');
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const calculateStats = () => {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const categories = new Set(products.map(p => p.category).filter(Boolean)).size;

    return { totalProducts, totalValue, totalStock, categories };
  };

  const stats = calculateStats();

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <img 
              src="/store-logo.png" 
              alt="Store Logo" 
              className="logo-image"
              // For S3: src="https://your-bucket.s3.region.amazonaws.com/store-logo.png"
            />
            <h1>Product Manager</h1>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            ➕ Add Product
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        {/* Alert Messages */}
        {alert && (
          <div className={`alert alert-${alert.type}`}>
            <span>{alert.type === 'success' ? '✅' : '❌'}</span>
            <span>{alert.message}</span>
          </div>
        )}

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalProducts}</div>
            <div className="stat-label">Total Products</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="stat-label">Total Value</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalStock}</div>
            <div className="stat-label">Items in Stock</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.categories}</div>
            <div className="stat-label">Categories</div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search products by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchProducts}>
              🔄 Try Again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>
              {searchQuery ? 'No products found' : 'No products yet'}
            </h3>
            <p>
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Get started by adding your first product'}
            </p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                ➕ Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={handleEdit}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal for Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProduct ? 'Edit Product' : 'Create New Product'}
      >
        <ProductForm
          product={editingProduct}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}

export default App;

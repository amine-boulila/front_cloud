import React from 'react';

const ProductCard = ({ product, onEdit, onDelete }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="card product-card">
      <div className="product-header">
        <div>
          <h3 className="product-title">{product.name}</h3>
          {product.category && (
            <span className="product-category">{product.category}</span>
          )}
        </div>
      </div>

      <p className="product-description">
        {product.description || 'No description available'}
      </p>

      <div className="product-info">
        <div className="info-item">
          <span className="info-label">Price</span>
          <span className="info-value price">{formatPrice(product.price)}</span>
        </div>
        <div className="info-item">
          <span className="info-label">In Stock</span>
          <span className="info-value quantity">{product.quantity}</span>
        </div>
      </div>

      <div className="product-meta">
        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          Added {formatDate(product.created_at)}
        </small>
      </div>

      <div className="product-actions" style={{ marginTop: 'var(--spacing-md)' }}>
        <button
          className="btn btn-primary"
          onClick={() => onEdit(product)}
          aria-label={`Edit ${product.name}`}
        >
          ✏️ Edit
        </button>
        <button
          className="btn btn-danger"
          onClick={() => onDelete(product)}
          aria-label={`Delete ${product.name}`}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

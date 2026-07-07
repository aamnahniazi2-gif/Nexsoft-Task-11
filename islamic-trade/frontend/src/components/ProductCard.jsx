import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { FiShoppingCart, FiHeart, FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const handleAddToCart = (e) => {
    e.preventDefault();
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
    toast.success('Added to cart!');
  };

  return (
    <Link to={`/product/${product._id}`} className="card group">
      <div className="relative">
        <img
          src={product.images[0]?.url || '/images/placeholder.jpg'}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isIslamic && (
            <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
              Islamic
            </span>
          )}
          {product.halalCertified && (
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
              Halal Certified
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              -{product.discountPercent}%
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-emerald-50 shadow-md">
            <FiHeart className="w-4 h-4 text-gray-600" />
          </button>
          <button 
            onClick={handleAddToCart}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-emerald-50 shadow-md"
          >
            <FiShoppingCart className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="text-sm text-gray-500 mb-1">{product.category?.name}</div>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        
        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-2">({product.numReviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-emerald-600">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through ml-2">${product.originalPrice}</span>
            )}
          </div>
          {product.countInStock > 0 ? (
            <span className="text-sm text-green-600">In Stock</span>
          ) : (
            <span className="text-sm text-red-600">Out of Stock</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full mt-3 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors opacity-0 group-hover:opacity-100"
        >
          Add to Cart
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;
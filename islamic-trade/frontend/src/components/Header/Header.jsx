import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiShoppingCart, FiUser, FiHeart, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { logout } from '../../redux/slices/authSlice';
import { searchProducts } from '../../redux/slices/productSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { cart } = useSelector(state => state.cart);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?keyword=${searchTerm}`);
      setSearchTerm('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-emerald-700 text-white py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span className="arabic-text">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيم</span>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:inline">Free shipping on orders over $100</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/products?islamic=true" className="hover:text-emerald-200">Islamic Products</Link>
              <Link to="/products?halalCertified=true" className="hover:text-emerald-200">Halal Certified</Link>
              <a href="tel:+1234567890" className="hover:text-emerald-200">+1 (234) 567-890</a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">IT</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-800">Islamic Trade</h1>
              <p className="text-xs text-gray-600">Shop with Islamic Values</p>
            </div>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600">
                <FiSearch className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center space-x-6">
            {/* User Menu */}
            <div className="relative group">
              <Link to={isAuthenticated ? '/profile' : '/login'} className="flex items-center space-x-1 text-gray-700 hover:text-emerald-600">
                <FiUser className="w-5 h-5" />
                <span className="hidden lg:inline text-sm">
                  {isAuthenticated ? user?.name?.split(' ')[0] : 'Account'}
                </span>
              </Link>
              {isAuthenticated && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="text-gray-700 hover:text-emerald-600">
              <FiHeart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative text-gray-700 hover:text-emerald-600">
              <FiShoppingCart className="w-6 h-6" />
              {cart?.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.totalItems}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-700">
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-emerald-600 text-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex space-x-1">
            <li><Link to="/" className="block px-4 py-3 hover:bg-emerald-700 transition-colors">Home</Link></li>
            <li><Link to="/products" className="block px-4 py-3 hover:bg-emerald-700 transition-colors">All Products</Link></li>
            <li><Link to="/products?category=Islamic+Books" className="block px-4 py-3 hover:bg-emerald-700 transition-colors">Islamic Books</Link></li>
            <li><Link to="/products?category=Prayer+Essentials" className="block px-4 py-3 hover:bg-emerald-700 transition-colors">Prayer Essentials</Link></li>
            <li><Link to="/products?category=Modest+Fashion" className="block px-4 py-3 hover:bg-emerald-700 transition-colors">Modest Fashion</Link></li>
            <li><Link to="/products?category=Halal+Food+%26+Beverages" className="block px-4 py-3 hover:bg-emerald-700 transition-colors">Halal Food</Link></li>
            <li><Link to="/products?islamic=true" className="block px-4 py-3 hover:bg-emerald-700 transition-colors">Islamic Products</Link></li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 border rounded-lg"
              />
            </form>
            <ul className="space-y-2">
              <li><Link to="/" className="block py-2 text-gray-700">Home</Link></li>
              <li><Link to="/products" className="block py-2 text-gray-700">All Products</Link></li>
              <li><Link to="/products?category=Islamic+Books" className="block py-2 text-gray-700">Islamic Books</Link></li>
              <li><Link to="/products?category=Prayer+Essentials" className="block py-2 text-gray-700">Prayer Essentials</Link></li>
              <li><Link to="/products?category=Modest+Fashion" className="block py-2 text-gray-700">Modest Fashion</Link></li>
              <li><Link to="/products?category=Halal+Food" className="block py-2 text-gray-700">Halal Food</Link></li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
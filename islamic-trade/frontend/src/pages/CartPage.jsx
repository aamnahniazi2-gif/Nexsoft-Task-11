import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchCart, updateCartItem, removeFromCart, clearCart, applyCoupon, removeCoupon } from '../redux/slices/cartSlice';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, loading } = useSelector(state => state.cart);
  const [couponCode, setCouponCode] = useState('');

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateCartItem({ productId, quantity: newQuantity }));
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    toast.success('Cart cleared');
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim()) {
      dispatch(applyCoupon(couponCode.trim()));
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
  };

  if (loading) return <Loader />;

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Helmet>
          <title>Cart - Islamic Trade</title>
        </Helmet>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <FiShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some Islamic products to your cart</p>
          <Link to="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Shopping Cart - Islamic Trade</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map(item => (
              <div key={item.product._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product.images?.[0]?.url || '/images/placeholder.jpg'}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <Link to={`/product/${item.product._id}`} className="text-lg font-semibold hover:text-emerald-600">
                      {item.product.name}
                    </Link>
                    <p className="text-emerald-600 font-bold mt-1">${item.price}</p>
                    {item.product.countInStock < item.quantity && (
                      <p className="text-red-600 text-sm mt-1">Only {item.product.countInStock} in stock</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                      className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.countInStock}
                      className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                    >
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                    <button
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="text-red-500 hover:text-red-700 mt-2"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-between">
              <Link to="/products" className="text-emerald-600 hover:text-emerald-700">
                ← Continue Shopping
              </Link>
              <button onClick={handleClearCart} className="text-red-600 hover:text-red-700">
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              {/* Coupon Code */}
              {!cart.coupon?.code ? (
                <form onSubmit={handleApplyCoupon} className="mb-6">
                  <label className="block text-sm font-medium mb-2">Coupon Code</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                      placeholder="Enter code"
                    />
                    <button type="submit" className="btn-primary">
                      Apply
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-6 p-3 bg-emerald-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-emerald-700 font-semibold">{cart.coupon.code}</p>
                      <p className="text-sm text-emerald-600">Coupon applied</p>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-red-500 hover:text-red-700">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Price Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.totalItems} items)</span>
                  <span>${cart.subtotal.toFixed(2)}</span>
                </div>
                {cart.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${cart.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{cart.subtotal > 100 ? 'Free' : '$10.00'}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-emerald-600">${cart.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
              >
                Proceed to Checkout
              </button>

              <div className="mt-4 text-center text-sm text-gray-500">
                <p>Free shipping on orders over $100</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage;
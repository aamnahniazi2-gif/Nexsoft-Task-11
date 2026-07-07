import React from 'react';
import { FiX, FiPackage, FiMapPin, FiCreditCard, FiUser } from 'react-icons/fi';

const OrderDetailModal = ({ order, onClose, onStatusUpdate }) => {
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold">Order #{order.orderNumber}</h2>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <FiUser className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-medium">{order.user?.name}</p>
                <p className="text-sm text-gray-500">{order.user?.email}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FiMapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Shipping Address</p>
                <p className="font-medium">{order.shippingAddress?.fullName}</p>
                <p className="text-sm text-gray-500">
                  {order.shippingAddress?.address}, {order.shippingAddress?.city}
                </p>
                <p className="text-sm text-gray-500">
                  {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <FiCreditCard className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Payment</p>
                <p className="font-medium capitalize">{order.payment?.method}</p>
                <p className={`text-sm ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.isPaid ? 'Paid' : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.orderItems?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.image || '/images/placeholder.jpg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      ${item.price} x {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-6">
            <div className="max-w-sm ml-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>${order.itemsPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice?.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span>${order.taxPrice?.toFixed(2)}</span>
              </div>
              {order.discountPrice > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-${order.discountPrice?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>${order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Order Timeline</h3>
              <div className="space-y-4">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-emerald-600" />
                    <div>
                      <p className="font-medium capitalize">{history.status}</p>
                      <p className="text-sm text-gray-500">{history.comment}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(history.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tracking Information */}
          {order.trackingNumber && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Tracking Information</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><span className="text-gray-500">Tracking Number:</span> {order.trackingNumber}</p>
                <p><span className="text-gray-500">Carrier:</span> {order.trackingCompany}</p>
                {order.estimatedDelivery && (
                  <p>
                    <span className="text-gray-500">Estimated Delivery:</span>{' '}
                    {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
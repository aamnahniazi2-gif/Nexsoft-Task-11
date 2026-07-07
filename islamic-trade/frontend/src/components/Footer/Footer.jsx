import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">IT</span>
              </div>
              <h3 className="text-xl font-bold">Islamic Trade</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted marketplace for authentic Islamic products. Shop with confidence and Islamic values.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-emerald-400"><FiFacebook className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-emerald-400"><FiTwitter className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-emerald-400"><FiInstagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-emerald-400"><FiYoutube className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-gray-400 hover:text-emerald-400">All Products</Link></li>
              <li><Link to="/products?featured=true" className="text-gray-400 hover:text-emerald-400">Featured Products</Link></li>
              <li><Link to="/products?islamic=true" className="text-gray-400 hover:text-emerald-400">Islamic Products</Link></li>
              <li><Link to="/products?halalCertified=true" className="text-gray-400 hover:text-emerald-400">Halal Certified</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-gray-400 hover:text-emerald-400">Contact Us</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-emerald-400">FAQ</Link></li>
              <li><Link to="/shipping" className="text-gray-400 hover:text-emerald-400">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-emerald-400">Returns Policy</Link></li>
              <li><Link to="/privacy" className="text-gray-400 hover:text-emerald-400">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <FiMapPin className="w-5 h-5 text-emerald-400 mt-1" />
                <span className="text-gray-400">123 Islamic Way, Dubai, UAE</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400">+1 (234) 567-890</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="w-5 h-5 text-emerald-400" />
                <span className="text-gray-400">info@islamictrade.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Islamic Trade. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <img src="/images/payments/visa.svg" alt="Visa" className="h-8" />
              <img src="/images/payments/mastercard.svg" alt="Mastercard" className="h-8" />
              <img src="/images/payments/amex.svg" alt="American Express" className="h-8" />
              <img src="/images/payments/paypal.svg" alt="PayPal" className="h-8" />
              <img src="/images/payments/stripe.svg" alt="Stripe" className="h-8" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
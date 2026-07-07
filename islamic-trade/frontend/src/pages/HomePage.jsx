import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchFeaturedProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import HeroSlider from '../components/HeroSlider';
import CategorySection from '../components/CategorySection';

const HomePage = () => {
  const dispatch = useDispatch();
  const { featuredProducts, loading, error } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  const islamicFeatures = [
    {
      icon: '🕌',
      title: 'Authentic Products',
      description: 'All Islamic products are verified for authenticity'
    },
    {
      icon: '✅',
      title: 'Halal Certified',
      description: 'Food and consumables are halal certified'
    },
    {
      icon: '🚚',
      title: 'Free Shipping',
      description: 'Free shipping on orders over $100'
    },
    {
      icon: '🔒',
      title: 'Secure Payment',
      description: '100% secure payment processing'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Islamic Trade - Shop with Islamic Values</title>
        <meta name="description" content="Your trusted marketplace for authentic Islamic products" />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Section */}
        <HeroSlider />

        {/* Islamic Features */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-emerald-800 mb-4">
              Why Shop With Islamic Trade?
            </h2>
            <p className="text-gray-600 text-lg">
              We provide authentic Islamic products with guaranteed quality
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {islamicFeatures.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Section */}
        <CategorySection />

        {/* Featured Products */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
                <p className="text-gray-600 mt-2">Handpicked Islamic products for you</p>
              </div>
              <Link to="/products?featured=true" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                View All →
              </Link>
            </div>

            {loading ? (
              <Loader />
            ) : error ? (
              <div className="text-center text-red-600 py-8">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Islamic Quote */}
        <div className="bg-emerald-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="arabic-text text-3xl mb-6">
              وَمَنْ يَتَّقِ اللَّهَ يَجْعَلْ لَهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ
            </p>
            <p className="text-lg italic">
              "And whoever fears Allah - He will make for him a way out and will provide for him from where he does not expect."
            </p>
            <p className="mt-4">- Surah At-Talaq (65:2-3)</p>
          </div>
        </div>

        {/* Newsletter */}
        <div className="py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-gray-600 mb-8">
              Get updates on new products, Islamic content, and exclusive offers
            </p>
            <form className="flex gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
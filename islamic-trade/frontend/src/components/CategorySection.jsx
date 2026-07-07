import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeaturedCategories } from '../redux/slices/categorySlice';
import { 
  FiBook, 
  FiHeart, 
  FiShoppingBag, 
  FiCoffee, 
  FiGift, 
  FiSmartphone 
} from 'react-icons/fi';

const categoryIcons = {
  'book': FiBook,
  'pray': FiHeart,
  'tshirt': FiShoppingBag,
  'utensils': FiCoffee,
  'gift': FiGift,
  'gamepad': FiSmartphone,
};

const CategorySection = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector(state => state.categories);

  useEffect(() => {
    dispatch(fetchFeaturedCategories());
  }, [dispatch]);

  const getIcon = (iconName) => {
    const IconComponent = categoryIcons[iconName] || FiGift;
    return <IconComponent className="w-8 h-8" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
        <p className="text-gray-600">Browse our wide range of Islamic products</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map(category => (
          <Link
            key={category._id}
            to={`/products?category=${category.name}`}
            className="group"
          >
            <div className="bg-white rounded-xl p-6 text-center hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-emerald-200">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-100 transition-colors">
                <span className="text-emerald-600">{getIcon(category.icon)}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
              <p className="text-sm text-gray-500">{category.productCount} Products</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
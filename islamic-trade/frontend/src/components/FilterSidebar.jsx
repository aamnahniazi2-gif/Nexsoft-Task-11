import React from 'react';
import { useSelector } from 'react-redux';
import { FiX } from 'react-icons/fi';

const FilterSidebar = ({ filters, onFilterChange }) => {
  const { categories } = useSelector(state => state.categories);

  const handleChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      keyword: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      isIslamic: '',
      halalCertified: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-sm text-emerald-600 hover:text-emerald-700"
        >
          Clear All
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Category</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="category"
              value=""
              checked={!filters.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="text-emerald-600"
            />
            <span>All Categories</span>
          </label>
          {categories.map(category => (
            <label key={category._id} className="flex items-center space-x-2">
              <input
                type="radio"
                name="category"
                value={category.name}
                checked={filters.category === category.name}
                onChange={(e) => handleChange('category', e.target.value)}
                className="text-emerald-600"
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Price Range</h4>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Minimum Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <label key={rating} className="flex items-center space-x-2">
              <input
                type="radio"
                name="rating"
                value={rating}
                checked={filters.rating === String(rating)}
                onChange={(e) => handleChange('rating', e.target.value)}
                className="text-emerald-600"
              />
              <span>{rating}+ Stars</span>
            </label>
          ))}
        </div>
      </div>

      {/* Islamic Products */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Product Type</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.isIslamic === 'true'}
              onChange={(e) => handleChange('isIslamic', e.target.checked ? 'true' : '')}
              className="rounded text-emerald-600"
            />
            <span>Islamic Products Only</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.halalCertified === 'true'}
              onChange={(e) => handleChange('halalCertified', e.target.checked ? 'true' : '')}
              className="rounded text-emerald-600"
            />
            <span>Halal Certified</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
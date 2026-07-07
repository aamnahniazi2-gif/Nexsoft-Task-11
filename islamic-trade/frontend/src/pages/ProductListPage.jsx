import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchProducts } from '../redux/slices/productSlice';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import { FiGrid, FiList, FiSliders } from 'react-icons/fi';

const ProductListPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error, page, pages, total } = useSelector(state => state.products);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const [filters, setFilters] = useState({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    sort: searchParams.get('sort') || '',
    isIslamic: searchParams.get('isIslamic') || '',
    halalCertified: searchParams.get('halalCertified') || '',
    featured: searchParams.get('featured') || '',
    page: Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo(0, 0);
  };

  const handleSort = (sortValue) => {
    handleFilterChange({ sort: sortValue });
  };

  return (
    <>
      <Helmet>
        <title>
          {filters.keyword 
            ? `Search: ${filters.keyword} - Islamic Trade`
            : filters.category 
              ? `${filters.category} - Islamic Trade`
              : 'All Products - Islamic Trade'
          }
        </title>
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        {/* Page Header */}
        <div className="bg-emerald-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-2">
              {filters.keyword 
                ? `Search Results: "${filters.keyword}"`
                : filters.category || 'All Islamic Products'
              }
            </h1>
            <p className="text-emerald-100">{total} products found</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center text-gray-600 hover:text-emerald-600"
                    >
                      <FiSliders className="w-5 h-5 mr-2" />
                      Filters
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'}`}
                      >
                        <FiGrid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-emerald-100 text-emerald-600' : 'text-gray-400'}`}
                      >
                        <FiList className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <select
                      value={filters.sort}
                      onChange={(e) => handleSort(e.target.value)}
                      className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Sort by: Featured</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest First</option>
                      <option value="bestsellers">Best Sellers</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Mobile Filters */}
              {showFilters && (
                <div className="lg:hidden mb-6">
                  <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
                </div>
              )}

              {/* Products Grid */}
              {loading ? (
                <Loader />
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 text-lg">{error}</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No products found</p>
                  <button
                    onClick={() => handleFilterChange({
                      keyword: '',
                      category: '',
                      minPrice: '',
                      maxPrice: '',
                      rating: '',
                      sort: '',
                      isIslamic: '',
                      halalCertified: '',
                      featured: ''
                    })}
                    className="mt-4 text-emerald-600 hover:text-emerald-700"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <>
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {products.map(product => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pages > 1 && (
                    <div className="mt-8">
                      <Pagination
                        currentPage={page}
                        totalPages={pages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductListPage;
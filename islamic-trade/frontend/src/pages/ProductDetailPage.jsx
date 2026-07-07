import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { fetchProduct, fetchRelatedProducts, createReview } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { FiShoppingCart, FiHeart, FiShare2, FiStar, FiMinus, FiPlus, FiCheck, FiTruck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, relatedProducts, loading, error } = useSelector(state => state.products);
  const { isAuthenticated } = useSelector(state => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    dispatch(fetchProduct(id));
    dispatch(fetchRelatedProducts(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (product.countInStock === 0) {
      toast.error('Product is out of stock');
      return;
    }
    dispatch(addToCart({ productId: product._id, quantity }));
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      navigate('/login');
      return;
    }
    dispatch(createReview({
      productId: product._id,
      review: { rating, title, comment }
    }));
    setRating(0);
    setComment('');
    setTitle('');
    toast.success('Review submitted!');
  };

  if (loading) return <Loader />;
  if (error) return <div className="text-center py-12 text-red-600">{error}</div>;
  if (!product) return <div className="text-center py-12">Product not found</div>;

  return (
    <>
      <Helmet>
        <title>{product.name} - Islamic Trade</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-emerald-600">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-emerald-600">Products</button>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Product Images */}
          <div>
            <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]?.url || '/images/placeholder.jpg'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex space-x-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-emerald-600' : 'border-transparent'
                    }`}
                  >
                    <img src={image.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {product.isIslamic && (
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm">Islamic Product</span>
              )}
              {product.halalCertified && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Halal Certified</span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600">({product.numReviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-emerald-600">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through ml-3">${product.originalPrice}</span>
              )}
              {product.discountPercent > 0 && (
                <span className="ml-3 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm">
                  Save {product.discountPercent}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Stock Status */}
            <div className="mb-6">
              {product.countInStock > 0 ? (
                <div className="flex items-center text-green-600">
                  <FiCheck className="mr-2" />
                  <span>In Stock ({product.countInStock} available)</span>
                </div>
              ) : (
                <div className="text-red-600">Out of Stock</div>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  <FiMinus />
                </button>
                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                  className="w-10 h-10 border rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 disabled:bg-gray-400"
              >
                <FiShoppingCart />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.countInStock === 0}
                className="flex-1 bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                Buy Now
              </button>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center text-gray-600">
                <FiTruck className="mr-2" />
                <span>Free shipping on orders over $100</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiHeart className="mr-2" />
                <span>Add to wishlist</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiShare2 className="mr-2" />
                <span>Share this product</span>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                <div className="space-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex">
                      <span className="text-gray-500 w-1/3">{key}</span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
          
          {/* Review Form */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <FiStar
                        className={`w-6 h-6 ${
                          star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Review title"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Share your experience with this product"
                />
              </div>
              <button type="submit" className="btn-primary">
                Submit Review
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {product.reviews?.map(review => (
              <div key={review._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 font-semibold">{review.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{review.name}</p>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-semibold mb-2">{review.title}</h4>
                <p className="text-gray-600">{review.comment}</p>
                {review.verified && (
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <FiCheck className="mr-1" /> Verified Purchase
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductDetailPage;
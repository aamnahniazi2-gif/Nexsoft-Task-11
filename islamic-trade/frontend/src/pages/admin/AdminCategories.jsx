import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../redux/slices/adminSlice';
import { FiPlus, FiEdit2, FiTrash2, FiFolder } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import CategoryForm from '../../components/admin/CategoryForm';

const AdminCategories = () => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector(state => state.admin);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  const handleCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      dispatch(deleteCategory(id));
      toast.success('Category deleted');
    }
  };

  const handleSubmit = (categoryData) => {
    if (editingCategory) {
      dispatch(updateCategory({ id: editingCategory._id, categoryData }));
      toast.success('Category updated');
    } else {
      dispatch(createCategory(categoryData));
      toast.success('Category created');
    }
    setShowForm(false);
    setEditingCategory(null);
  };

  if (loading) return <Loader />;

  return (
    <>
      <Helmet>
        <title>Category Management - Islamic Trade Admin</title>
      </Helmet>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1">Manage product categories</p>
          </div>
          <button onClick={handleCreate} className="btn-primary flex items-center">
            <FiPlus className="mr-2" /> Add Category
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <FiFolder className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.slug}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{category.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                {category.isIslamic && (
                  <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                    Islamic
                  </span>
                )}
                <span className="text-gray-500">
                  Order: {category.displayOrder}
                </span>
              </div>
              
              {category.children?.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">Subcategories:</p>
                  <div className="space-y-1">
                    {category.children.map(child => (
                      <p key={child._id} className="text-sm text-gray-600 pl-4">
                        - {child.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Category Form Modal */}
        {showForm && (
          <CategoryForm
            category={editingCategory}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
          />
        )}
      </div>
    </>
  );
};

export default AdminCategories;
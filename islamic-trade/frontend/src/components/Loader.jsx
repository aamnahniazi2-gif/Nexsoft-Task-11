import React from 'react';

const Loader = ({ fullScreen = false }) => {
  const spinner = (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50">
        <div className="text-center">
          {spinner}
          <p className="mt-4 text-gray-600 font-semibold">Loading Islamic Trade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      {spinner}
    </div>
  );
};

export default Loader;
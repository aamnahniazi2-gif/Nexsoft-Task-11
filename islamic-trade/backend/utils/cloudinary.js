const cloudinary = require('cloudinary').v2;

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to cloudinary
const uploadImage = async (file, folder = 'islamic-trade') => {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: folder,
            resource_type: 'auto',
            transformation: [
                { quality: 'auto', fetch_format: 'auto' }
            ]
        });
        
        return {
            public_id: result.public_id,
            url: result.secure_url
        };
    } catch (error) {
        throw new Error('Error uploading image');
    }
};

// Delete image from cloudinary
const deleteImage = async (public_id) => {
    try {
        const result = await cloudinary.uploader.destroy(public_id);
        return result;
    } catch (error) {
        throw new Error('Error deleting image');
    }
};

module.exports = { cloudinary, uploadImage, deleteImage };
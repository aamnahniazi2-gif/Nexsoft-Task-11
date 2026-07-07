const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

// Sample categories
const categories = [
    {
        name: 'Islamic Books',
        description: 'Quran, Hadith, and Islamic literature',
        isIslamic: true,
        icon: 'book',
        displayOrder: 1,
        metaTitle: 'Islamic Books - Quran, Hadith & Islamic Literature',
        metaDescription: 'Shop our collection of Islamic books including Quran, Hadith, and educational materials'
    },
    {
        name: 'Prayer Essentials',
        description: 'Prayer mats, tasbih, and prayer clothing',
        isIslamic: true,
        icon: 'pray',
        displayOrder: 2
    },
    {
        name: 'Modest Fashion',
        description: 'Hijabs, abayas, and modest clothing',
        isIslamic: true,
        icon: 'tshirt',
        displayOrder: 3
    },
    {
        name: 'Halal Food & Beverages',
        description: 'Halal certified food products and beverages',
        isIslamic: true,
        icon: 'utensils',
        displayOrder: 4
    },
    {
        name: 'Islamic Gifts & Decor',
        description: 'Islamic gifts, decorations, and accessories',
        isIslamic: true,
        icon: 'gift',
        displayOrder: 5
    },
    {
        name: 'Islamic Toys & Games',
        description: 'Educational Islamic toys and games for children',
        isIslamic: true,
        icon: 'gamepad',
        displayOrder: 6
    },
    {
        name: 'Perfumes & Attar',
        description: 'Alcohol-free perfumes and traditional attar',
        isIslamic: true,
        icon: 'flask',
        displayOrder: 7
    },
    {
        name: 'Islamic Jewelry',
        description: 'Islamic jewelry and accessories',
        isIslamic: true,
        icon: 'gem',
        displayOrder: 8
    }
];

// Sample products
const products = [
    {
        name: 'Holy Quran with English Translation',
        description: 'Beautiful hardcover Quran with authentic English translation and detailed commentary. Features gold embossed cover and high-quality paper.',
        price: 29.99,
        originalPrice: 39.99,
        countInStock: 100,
        isIslamic: true,
        isFeatured: true,
        rating: 4.8,
        numReviews: 125,
        specifications: {
            'Language': 'Arabic with English',
            'Translator': 'Abdullah Yusuf Ali',
            'Pages': '1200',
            'Binding': 'Hardcover',
            'Size': '7 x 10 inches',
            'Weight': '1.5 kg'
        },
        tags: ['quran', 'translation', 'book', 'english']
    },
    {
        name: 'Premium Prayer Mat with Memory Foam',
        description: 'Luxurious prayer mat with memory foam padding for ultimate comfort during prayers. Features non-slip backing and beautiful Islamic geometric patterns.',
        price: 49.99,
        originalPrice: 69.99,
        countInStock: 75,
        isIslamic: true,
        isFeatured: true,
        rating: 4.9,
        numReviews: 89,
        specifications: {
            'Material': 'Memory Foam with Velvet Top',
            'Size': '110 x 70 cm',
            'Thickness': '1.5 cm',
            'Features': 'Non-slip, Washable, Portable',
            'Colors Available': 'Green, Blue, Red, Black'
        },
        tags: ['prayer', 'mat', 'comfortable', 'memory foam']
    },
    {
        name: 'Digital Quran Pen Reader',
        description: 'Innovative digital Quran pen that recites any verse when touched to the page. Perfect for learning correct pronunciation and memorization.',
        price: 89.99,
        countInStock: 30,
        isIslamic: true,
        isFeatured: true,
        rating: 4.7,
        numReviews: 45,
        specifications: {
            'Supported Languages': 'Arabic, English, Urdu, French',
            'Battery Life': '8 hours',
            'Storage': '8GB',
            'Includes': 'USB Cable, Headphones, Charger',
            'Warranty': '1 Year'
        },
        tags: ['quran', 'digital', 'learning', 'electronic']
    },
    {
        name: 'Elegant Hijab Collection - Set of 3',
        description: 'Premium quality hijab set made from soft, breathable fabric. Includes three versatile colors suitable for daily wear and special occasions.',
        price: 34.99,
        originalPrice: 44.99,
        countInStock: 200,
        isIslamic: true,
        rating: 4.6,
        numReviews: 67,
        specifications: {
            'Material': 'Premium Chiffon',
            'Size': '180 x 70 cm',
            'Colors': 'Black, Nude, Grey',
            'Care': 'Hand wash recommended',
            'Includes': '3 Hijabs + Free Under Cap'
        },
        tags: ['hijab', 'modest', 'fashion', 'women']
    },
    {
        name: 'Organic Ajwa Dates - Premium Quality',
        description: 'Authentic Madinah Ajwa dates, known for their health benefits and mentioned in Hadith. Organically grown and carefully packaged.',
        price: 19.99,
        originalPrice: 24.99,
        countInStock: 150,
        isIslamic: true,
        halalCertified: true,
        rating: 4.9,
        numReviews: 156,
        specifications: {
            'Origin': 'Madinah, Saudi Arabia',
            'Weight': '1 kg',
            'Type': 'Ajwa',
            'Packaging': 'Vacuum Sealed',
            'Shelf Life': '12 months'
        },
        tags: ['dates', 'ajwa', 'organic', 'food', 'health']
    },
    {
        name: 'Islamic Wall Art - Ayatul Kursi',
        description: 'Beautiful canvas wall art featuring Ayatul Kursi in elegant Arabic calligraphy. Perfect for home or office decoration.',
        price: 45.99,
        originalPrice: 59.99,
        countInStock: 50,
        isIslamic: true,
        isFeatured: true,
        rating: 4.8,
        numReviews: 34,
        specifications: {
            'Material': 'Canvas',
            'Size': '24 x 36 inches',
            'Frame': 'Gallery Wrapped',
            'Style': 'Modern Arabic Calligraphy',
            'Ready to Hang': 'Yes'
        },
        tags: ['wall art', 'calligraphy', 'ayatul kursi', 'decoration']
    },
    {
        name: 'Miswak Stick - Natural Toothbrush (Pack of 6)',
        description: 'Traditional natural toothbrush from the Salvadora persica tree. Sunna of the Prophet (PBUH) and scientifically proven for oral health.',
        price: 12.99,
        countInStock: 300,
        isIslamic: true,
        rating: 4.7,
        numReviews: 89,
        specifications: {
            'Quantity': '6 pieces',
            'Length': '15 cm',
            'Origin': 'Pakistan',
            'Packaging': 'Individual sealed',
            'Usage': '3-4 weeks per stick'
        },
        tags: ['miswak', 'natural', 'toothbrush', 'health']
    },
    {
        name: 'Alcohol-Free Oud Perfume Oil',
        description: 'Luxurious long-lasting perfume oil made from pure oud and natural ingredients. Alcohol-free, perfect for Muslims.',
        price: 39.99,
        originalPrice: 54.99,
        countInStock: 60,
        isIslamic: true,
        rating: 4.5,
        numReviews: 23,
        specifications: {
            'Size': '12 ml',
            'Type': 'Concentrated Oil',
            'Longevity': '8-12 hours',
            'Notes': 'Oud, Amber, Musk',
            'Alcohol-Free': 'Yes'
        },
        tags: ['perfume', 'oud', 'attar', 'alcohol-free']
    },
    {
        name: 'Kids Islamic Educational Tablet',
        description: 'Interactive learning tablet with Quran recitation, Islamic stories, Arabic alphabets, and duas. Educational and entertaining for children.',
        price: 34.99,
        countInStock: 45,
        isIslamic: true,
        rating: 4.6,
        numReviews: 28,
        specifications: {
            'Age Range': '3-10 years',
            'Battery': 'Rechargeable',
            'Content': 'Quran, Duas, Stories, Games',
            'Languages': 'Arabic, English',
            'Screen': 'LCD Touch'
        },
        tags: ['kids', 'educational', 'learning', 'toy']
    },
    {
        name: 'Zamzam Water - Authentic 5 Liters',
        description: 'Authentic Zamzam water imported directly from Makkah. Pure and blessed water with certificate of authenticity.',
        price: 24.99,
        countInStock: 40,
        isIslamic: true,
        halalCertified: true,
        rating: 5.0,
        numReviews: 42,
        specifications: {
            'Volume': '5 Liters',
            'Origin': 'Makkah, Saudi Arabia',
            'Packaging': 'Sealed Container',
            'Certificate': 'Included',
            'Shelf Life': '2 years'
        },
        tags: ['zamzam', 'water', 'makkah', 'blessed']
    },
    {
        name: 'Men Thobe - Saudi Style',
        description: 'Premium quality men thobe made from soft, breathable fabric. Perfect for daily wear, prayers, and special occasions.',
        price: 44.99,
        originalPrice: 59.99,
        countInStock: 80,
        isIslamic: true,
        rating: 4.4,
        numReviews: 56,
        specifications: {
            'Material': 'Premium Cotton Blend',
            'Sizes': 'S, M, L, XL, XXL',
            'Colors': 'White, Beige, Grey, Navy',
            'Style': 'Saudi / Gulf',
            'Care': 'Machine washable'
        },
        tags: ['thobe', 'men', 'clothing', 'modest']
    },
    {
        name: 'Smart Tasbih Counter Ring',
        description: 'Modern tasbih counter in a ring form. Bluetooth connected to track your dhikr and set daily goals through the mobile app.',
        price: 29.99,
        countInStock: 55,
        isIslamic: true,
        isFeatured: true,
        rating: 4.3,
        numReviews: 31,
        specifications: {
            'Material': 'Stainless Steel',
            'Battery': 'CR2032 (Included)',
            'Connectivity': 'Bluetooth 4.0',
            'App': 'iOS & Android',
            'Water Resistant': 'Yes'
        },
        tags: ['tasbih', 'smart', 'digital', 'technology']
    }
];

// Seed function
const seedDB = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});
        
        console.log('Database cleared');
        
        // Create admin user
        const adminUser = await User.create({
            name: 'Islamic Trade Admin',
            email: 'admin@islamictrade.com',
            password: 'Admin@123',
            role: 'admin',
            emailVerified: true,
            phone: '+1234567890',
            address: {
                street: '123 Islamic Way',
                city: 'Dubai',
                state: 'Dubai',
                zipCode: '00000',
                country: 'UAE'
            }
        });
        
        console.log('Admin user created');
        
        // Create test user
        const testUser = await User.create({
            name: 'Test User',
            email: 'user@islamictrade.com',
            password: 'User@123',
            role: 'user',
            emailVerified: true
        });
        
        console.log('Test user created');
        
        // Create categories
        const createdCategories = await Category.insertMany(
            categories.map(cat => ({
                ...cat,
                createdBy: adminUser._id
            }))
        );
        
        console.log(`${createdCategories.length} categories created`);
        
        // Create category map
        const categoryMap = {};
        createdCategories.forEach(cat => {
            categoryMap[cat.name] = cat._id;
        });
        
        // Assign categories to products
        const productsWithCategories = products.map(product => {
            let categoryId;
            
            if (product.name.toLowerCase().includes('quran') || product.name.toLowerCase().includes('book')) {
                categoryId = categoryMap['Islamic Books'];
            } else if (product.name.toLowerCase().includes('prayer') || product.name.toLowerCase().includes('mat')) {
                categoryId = categoryMap['Prayer Essentials'];
            } else if (product.name.toLowerCase().includes('hijab') || product.name.toLowerCase().includes('thobe')) {
                categoryId = categoryMap['Modest Fashion'];
            } else if (product.name.toLowerCase().includes('food') || product.name.toLowerCase().includes('date') || 
                       product.name.toLowerCase().includes('zamzam') || product.name.toLowerCase().includes('water')) {
                categoryId = categoryMap['Halal Food & Beverages'];
            } else if (product.name.toLowerCase().includes('gift') || product.name.toLowerCase().includes('wall') || 
                       product.name.toLowerCase().includes('decor')) {
                categoryId = categoryMap['Islamic Gifts & Decor'];
            } else if (product.name.toLowerCase().includes('toy') || product.name.toLowerCase().includes('kids') || 
                       product.name.toLowerCase().includes('game')) {
                categoryId = categoryMap['Islamic Toys & Games'];
            } else if (product.name.toLowerCase().includes('perfume') || product.name.toLowerCase().includes('oud') || 
                       product.name.toLowerCase().includes('attar')) {
                categoryId = categoryMap['Perfumes & Attar'];
            } else if (product.name.toLowerCase().includes('jewelry') || product.name.toLowerCase().includes('ring')) {
                categoryId = categoryMap['Islamic Jewelry'];
            } else {
                categoryId = categoryMap['Islamic Gifts & Decor'];
            }
            
            return {
                ...product,
                category: categoryId,
                createdBy: adminUser._id,
                images: [{
                    public_id: `sample_${Date.now()}`,
                    url: `/images/products/${product.name.toLowerCase().replace(/ /g, '-')}.jpg`
                }],
                reviews: []
            };
        });
        
        // Create products
        await Product.insertMany(productsWithCategories);
        
        console.log(`${productsWithCategories.length} products created`);
        console.log('Database seeded successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeder
seedDB();
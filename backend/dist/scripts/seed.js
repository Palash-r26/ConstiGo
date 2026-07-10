import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const seedDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error('MONGODB_URI is not defined in .env');
        }
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('Connected!');
        let supplier = await User.findOne({ role: 'SUPPLIER' });
        if (!supplier) {
            console.log('No supplier found. Creating dummy supplier...');
            supplier = await User.create({
                firstName: 'Dummy',
                lastName: 'Supplier',
                email: 'dummy@supplier.com',
                phone: '+910000000000',
                role: 'SUPPLIER',
                password: 'password123',
                businessInfo: { companyName: 'ConstiGo Supplies' }
            });
        }
        console.log('Clearing old categories and products...');
        await Category.deleteMany({});
        await Product.deleteMany({ supplier: supplier._id });
        console.log('Seeding Categories...');
        const categoriesToInsert = [
            { name: 'Cement', description: 'All types of cement' },
            { name: 'Steel', description: 'TMT bars, structural steel' },
            { name: 'Bricks', description: 'Red bricks, fly ash blocks' },
            { name: 'Sand', description: 'River sand, M-sand' },
        ];
        const insertedCategories = await Category.insertMany(categoriesToInsert);
        const getCategoryId = (name) => insertedCategories.find(c => c.name === name)?._id;
        console.log('Seeding Products...');
        const productsToInsert = [
            {
                supplier: supplier._id,
                category: getCategoryId('Cement'),
                name: 'UltraTech Cement',
                description: 'Premium quality Portland cement for construction.',
                price: 350.00,
                unit: 'bag',
                stockQty: 500,
                isAvailable: true,
            },
            {
                supplier: supplier._id,
                category: getCategoryId('Steel'),
                name: 'Tata TMT Steel',
                description: 'High strength TMT bars.',
                price: 5500.00,
                unit: 'ton',
                stockQty: 50,
                isAvailable: true,
            },
            {
                supplier: supplier._id,
                category: getCategoryId('Bricks'),
                name: 'Red Bricks',
                description: 'Standard clay red bricks.',
                price: 8.50,
                unit: 'piece',
                stockQty: 10000,
                isAvailable: true,
            },
            {
                supplier: supplier._id,
                category: getCategoryId('Sand'),
                name: 'River Sand',
                description: 'Washed river sand for plastering.',
                price: 1200.00,
                unit: 'truck',
                stockQty: 100,
                isAvailable: true,
            }
        ];
        await Product.insertMany(productsToInsert);
        console.log('Seeding completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};
seedDatabase();

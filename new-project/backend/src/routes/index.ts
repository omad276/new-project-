import { Router, Request, Response } from 'express';
import authRoutes from './authRoutes.js';
import projectRoutes from './projectRoutes.js';
import propertyRoutes from './propertyRoutes.js';
import favoriteRoutes from './favoriteRoutes.js';
import userRoutes from './userRoutes.js';
import mapRoutes from './mapRoutes.js';
import measurementRoutes from './measurementRoutes.js';
import industrialRoutes from './industrialRoutes.js';
import messageRoutes from './messageRoutes.js';

const router = Router();

// ============================================
// Health Check
// ============================================

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Upgreat API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ============================================
// Seed Endpoint (temporary - remove after use)
// ============================================

import User from '../models/User.js';
import Property from '../models/Property.js';

router.post('/seed', async (_req: Request, res: Response) => {
  try {
    // Sample properties data
    const sampleProperties = [
      {
        title: 'Luxury Villa in Riyadh',
        titleAr: 'فيلا فاخرة في الرياض',
        description: 'Beautiful 5-bedroom villa with private pool, garden, and modern amenities.',
        descriptionAr: 'فيلا جميلة من 5 غرف نوم مع مسبح خاص وحديقة ومرافق حديثة.',
        type: 'villa',
        category: 'residential',
        status: 'for_sale',
        price: 2500000,
        currency: 'SAR',
        area: 450,
        bedrooms: 5,
        bathrooms: 4,
        location: {
          address: 'Al Olaya District',
          addressAr: 'حي العليا',
          city: 'Riyadh',
          cityAr: 'الرياض',
          country: 'Saudi Arabia',
          countryAr: 'السعودية',
          coordinates: { type: 'Point', coordinates: [46.6753, 24.7136] },
        },
        images: ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
        features: ['Pool', 'Garden', 'Garage', 'Smart Home'],
        featuresAr: ['مسبح', 'حديقة', 'كراج', 'منزل ذكي'],
        isFeatured: true,
      },
      {
        title: 'Modern Apartment in Jeddah',
        titleAr: 'شقة حديثة في جدة',
        description: 'Stunning sea view apartment with 3 bedrooms.',
        descriptionAr: 'شقة مطلة على البحر مع 3 غرف نوم.',
        type: 'apartment',
        category: 'residential',
        status: 'for_rent',
        price: 8000,
        currency: 'SAR',
        area: 180,
        bedrooms: 3,
        bathrooms: 2,
        location: {
          address: 'Corniche Road',
          addressAr: 'طريق الكورنيش',
          city: 'Jeddah',
          cityAr: 'جدة',
          country: 'Saudi Arabia',
          countryAr: 'السعودية',
          coordinates: { type: 'Point', coordinates: [39.1728, 21.5433] },
        },
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
        features: ['Sea View', 'Gym', 'Parking', 'Balcony'],
        featuresAr: ['إطلالة بحرية', 'صالة رياضية', 'موقف سيارات', 'شرفة'],
        isFeatured: true,
      },
      {
        title: 'Office Space in KAFD',
        titleAr: 'مكتب في كافد',
        description: 'Premium office space in the King Abdullah Financial District.',
        descriptionAr: 'مساحة مكتبية متميزة في مركز الملك عبدالله المالي.',
        type: 'office',
        category: 'commercial',
        status: 'for_rent',
        price: 15000,
        currency: 'SAR',
        area: 250,
        location: {
          address: 'King Abdullah Financial District',
          addressAr: 'مركز الملك عبدالله المالي',
          city: 'Riyadh',
          cityAr: 'الرياض',
          country: 'Saudi Arabia',
          countryAr: 'السعودية',
          coordinates: { type: 'Point', coordinates: [46.6396, 24.7648] },
        },
        images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800'],
        features: ['Meeting Rooms', '24/7 Access', 'Parking'],
        featuresAr: ['قاعات اجتماعات', 'دخول على مدار الساعة', 'موقف سيارات'],
        isFeatured: true,
      },
      {
        title: 'Land Plot in Al Khobar',
        titleAr: 'أرض في الخبر',
        description: 'Prime residential land plot in Al Khobar.',
        descriptionAr: 'قطعة أرض سكنية متميزة في الخبر.',
        type: 'land',
        category: 'residential',
        status: 'for_sale',
        price: 800000,
        currency: 'SAR',
        area: 600,
        location: {
          address: 'Al Rawabi District',
          addressAr: 'حي الروابي',
          city: 'Al Khobar',
          cityAr: 'الخبر',
          country: 'Saudi Arabia',
          countryAr: 'السعودية',
          coordinates: { type: 'Point', coordinates: [50.2083, 26.2794] },
        },
        images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'],
        features: ['Corner Plot', 'Near Schools'],
        featuresAr: ['قطعة زاوية', 'قرب المدارس'],
        isFeatured: false,
      },
      {
        title: 'Penthouse in KAEC',
        titleAr: 'بنتهاوس في مدينة الملك عبدالله',
        description: 'Exclusive penthouse with panoramic views.',
        descriptionAr: 'بنتهاوس حصري مع إطلالات بانورامية.',
        type: 'apartment',
        category: 'residential',
        status: 'for_sale',
        price: 3500000,
        currency: 'SAR',
        area: 350,
        bedrooms: 4,
        bathrooms: 5,
        location: {
          address: 'Bay La Sun',
          addressAr: 'باي لاسن',
          city: 'KAEC',
          cityAr: 'كايك',
          country: 'Saudi Arabia',
          countryAr: 'السعودية',
          coordinates: { type: 'Point', coordinates: [39.1282, 22.4532] },
        },
        images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
        features: ['Private Terrace', 'Jacuzzi', 'Sea View'],
        featuresAr: ['تراس خاص', 'جاكوزي', 'إطلالة بحرية'],
        isFeatured: true,
      },
      {
        title: 'Family Villa in Al Nakheel',
        titleAr: 'فيلا عائلية في النخيل',
        description: 'Spacious family villa with 6 bedrooms and pool.',
        descriptionAr: 'فيلا عائلية واسعة مع 6 غرف نوم ومسبح.',
        type: 'villa',
        category: 'residential',
        status: 'for_sale',
        price: 4200000,
        currency: 'SAR',
        area: 650,
        bedrooms: 6,
        bathrooms: 5,
        location: {
          address: 'Al Nakheel District',
          addressAr: 'حي النخيل',
          city: 'Riyadh',
          cityAr: 'الرياض',
          country: 'Saudi Arabia',
          countryAr: 'السعودية',
          coordinates: { type: 'Point', coordinates: [46.6289, 24.7743] },
        },
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
        features: ['Pool', 'Garden', 'Maid Room'],
        featuresAr: ['مسبح', 'حديقة', 'غرفة خادمة'],
        isFeatured: true,
      },
      {
        title: 'Cozy Studio in Al Malaz',
        titleAr: 'استوديو في الملز',
        description: 'Perfect starter apartment near metro.',
        descriptionAr: 'شقة مثالية للمبتدئين قرب المترو.',
        type: 'apartment',
        category: 'residential',
        status: 'for_rent',
        price: 2500,
        currency: 'SAR',
        area: 45,
        bedrooms: 1,
        bathrooms: 1,
        location: {
          address: 'Al Malaz District',
          addressAr: 'حي الملز',
          city: 'Riyadh',
          cityAr: 'الرياض',
          country: 'Saudi Arabia',
          countryAr: 'السعودية',
          coordinates: { type: 'Point', coordinates: [46.7219, 24.6748] },
        },
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
        features: ['Furnished', 'AC', 'Near Metro'],
        featuresAr: ['مفروش', 'مكيف', 'قرب المترو'],
        isFeatured: false,
      },
      {
        title: 'Commercial Building in Olaya',
        titleAr: 'مبنى تجاري في العليا',
        description: 'Prime commercial building with multiple floors.',
        descriptionAr: 'مبنى تجاري متميز متعدد الطوابق.',
        type: 'building',
        category: 'commercial',
        status: 'for_sale',
        price: 15000000,
        currency: 'SAR',
        area: 3500,
        location: {
          address: 'Olaya Street',
          addressAr: 'شارع العليا',
          city: 'Riyadh',
          cityAr: 'الرياض',
          country: 'Saudi Arabia',
          countryAr: 'السعودية',
          coordinates: { type: 'Point', coordinates: [46.685, 24.6916] },
        },
        images: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
        features: ['Elevator', 'Parking', 'Central AC'],
        featuresAr: ['مصعد', 'موقف سيارات', 'تكييف مركزي'],
        isFeatured: true,
      },
    ];

    // Demo users
    const demoUsers = [
      {
        email: 'buyer@upgreat.com',
        password: 'Demo123!',
        fullName: 'Ahmed Buyer',
        role: 'buyer' as const,
        isActive: true,
        isVerified: true,
      },
      {
        email: 'owner@upgreat.com',
        password: 'Demo123!',
        fullName: 'Mohammed Owner',
        role: 'owner' as const,
        isActive: true,
        isVerified: true,
      },
      {
        email: 'agent@upgreat.com',
        password: 'Demo123!',
        fullName: 'Sara Agent',
        role: 'agent' as const,
        isActive: true,
        isVerified: true,
      },
      {
        email: 'admin@upgreat.com',
        password: 'Admin123!',
        fullName: 'Admin User',
        role: 'admin' as const,
        isActive: true,
        isVerified: true,
      },
    ];

    // Create users
    const createdUsers: { owner?: string; agent?: string } = {};
    for (const userData of demoUsers) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
      }
      if (userData.role === 'owner') createdUsers.owner = user._id.toString();
      if (userData.role === 'agent') createdUsers.agent = user._id.toString();
    }

    // Clear and insert properties
    await Property.deleteMany({});
    const ownerIds = [createdUsers.owner, createdUsers.agent].filter(Boolean);
    const propertiesWithOwner = sampleProperties.map((p, i) => ({
      ...p,
      owner: ownerIds[i % ownerIds.length],
      viewCount: Math.floor(Math.random() * 200) + 50,
    }));
    await Property.insertMany(propertiesWithOwner);

    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        users: demoUsers.length,
        properties: sampleProperties.length,
        accounts: [
          { email: 'buyer@upgreat.com', password: 'Demo123!', role: 'buyer' },
          { email: 'owner@upgreat.com', password: 'Demo123!', role: 'owner' },
          { email: 'agent@upgreat.com', password: 'Demo123!', role: 'agent' },
          { email: 'admin@upgreat.com', password: 'Admin123!', role: 'admin' },
        ],
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, message: 'Seed failed', error: String(error) });
  }
});

// ============================================
// Mount Routes
// ============================================

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/properties', propertyRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/users', userRoutes);
router.use('/messages', messageRoutes); // Messaging routes
router.use(mapRoutes); // Map routes (handles /projects/:id/maps and /maps/:id)
router.use(measurementRoutes); // Measurement & cost routes
router.use(industrialRoutes); // Industrial property routes

export default router;

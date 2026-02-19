import mongoose from 'mongoose';
import { config } from './config/index.js';
import User from './models/User.js';
import Property from './models/Property.js';

// Sample properties data
const sampleProperties = [
  {
    title: 'Luxury Villa in Riyadh',
    titleAr: 'فيلا فاخرة في الرياض',
    description:
      'Beautiful 5-bedroom villa with private pool, garden, and modern amenities. Located in the prestigious Al Olaya district.',
    descriptionAr:
      'فيلا جميلة من 5 غرف نوم مع مسبح خاص وحديقة ومرافق حديثة. تقع في حي العليا المرموق.',
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
    features: ['Pool', 'Garden', 'Garage', 'Smart Home', 'Security System'],
    featuresAr: ['مسبح', 'حديقة', 'كراج', 'منزل ذكي', 'نظام أمان'],
    isFeatured: true,
  },
  {
    title: 'Modern Apartment in Jeddah',
    titleAr: 'شقة حديثة في جدة',
    description:
      'Stunning sea view apartment with 3 bedrooms. Features modern finishes and access to building amenities.',
    descriptionAr: 'شقة مطلة على البحر مع 3 غرف نوم. تتميز بتشطيبات حديثة ووصول إلى مرافق المبنى.',
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
    features: ['Sea View', 'Gym', 'Parking', 'Concierge', 'Balcony'],
    featuresAr: ['إطلالة بحرية', 'صالة رياضية', 'موقف سيارات', 'خدمة استقبال', 'شرفة'],
    isFeatured: true,
  },
  {
    title: 'Office Space in KAFD',
    titleAr: 'مكتب في كافد',
    description:
      'Premium office space in the King Abdullah Financial District. Perfect for businesses looking for a prestigious address.',
    descriptionAr:
      'مساحة مكتبية متميزة في مركز الملك عبدالله المالي. مثالية للشركات التي تبحث عن عنوان مرموق.',
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
    features: ['Meeting Rooms', '24/7 Access', 'Parking', 'High-Speed Internet', 'Reception'],
    featuresAr: [
      'قاعات اجتماعات',
      'دخول على مدار الساعة',
      'موقف سيارات',
      'إنترنت عالي السرعة',
      'استقبال',
    ],
    isFeatured: true,
  },
  {
    title: 'Land Plot in Al Khobar',
    titleAr: 'أرض في الخبر',
    description:
      'Prime residential land plot in Al Khobar. Ideal for building your dream home or investment.',
    descriptionAr: 'قطعة أرض سكنية متميزة في الخبر. مثالية لبناء منزل أحلامك أو الاستثمار.',
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
    features: ['Corner Plot', 'Near Schools', 'Near Mosque', 'Paved Roads'],
    featuresAr: ['قطعة زاوية', 'قرب المدارس', 'قرب المسجد', 'شوارع مسفلتة'],
    isFeatured: false,
  },
  {
    title: 'Warehouse in Dammam Industrial',
    titleAr: 'مستودع في دمام الصناعية',
    description:
      'Large warehouse facility with loading docks and office space. Perfect for logistics operations.',
    descriptionAr: 'مستودع كبير مع أرصفة تحميل ومساحة مكتبية. مثالي لعمليات الخدمات اللوجستية.',
    type: 'warehouse',
    category: 'industrial',
    status: 'for_rent',
    price: 25000,
    currency: 'SAR',
    area: 2000,
    location: {
      address: 'Second Industrial City',
      addressAr: 'المدينة الصناعية الثانية',
      city: 'Dammam',
      cityAr: 'الدمام',
      country: 'Saudi Arabia',
      countryAr: 'السعودية',
      coordinates: { type: 'Point', coordinates: [50.0028, 26.3927] },
    },
    images: ['https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800'],
    features: ['Loading Docks', 'Office Space', 'High Ceiling', '24/7 Security', 'Fire System'],
    featuresAr: ['أرصفة تحميل', 'مساحة مكتبية', 'سقف عالي', 'أمان على مدار الساعة', 'نظام إطفاء'],
    isFeatured: false,
  },
  {
    title: 'Penthouse in King Abdullah Economic City',
    titleAr: 'بنتهاوس في مدينة الملك عبدالله الاقتصادية',
    description:
      'Exclusive penthouse with panoramic views. Features private terrace, jacuzzi, and premium finishes.',
    descriptionAr: 'بنتهاوس حصري مع إطلالات بانورامية. يتميز بتراس خاص وجاكوزي وتشطيبات فاخرة.',
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
      city: 'King Abdullah Economic City',
      cityAr: 'مدينة الملك عبدالله الاقتصادية',
      country: 'Saudi Arabia',
      countryAr: 'السعودية',
      coordinates: { type: 'Point', coordinates: [39.1282, 22.4532] },
    },
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
    features: ['Private Terrace', 'Jacuzzi', 'Smart Home', 'Private Elevator', 'Sea View'],
    featuresAr: ['تراس خاص', 'جاكوزي', 'منزل ذكي', 'مصعد خاص', 'إطلالة بحرية'],
    isFeatured: true,
  },
];

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('📦 Connected to MongoDB');

    // Create demo user if not exists
    let demoUser = await User.findOne({ email: 'demo@upgreat.com' });

    if (!demoUser) {
      // Don't hash password manually - the User model's pre-save hook does it
      demoUser = await User.create({
        email: 'demo@upgreat.com',
        password: 'Demo123!',
        fullName: 'Demo User',
        fullNameAr: 'مستخدم تجريبي',
        role: 'owner',
        isActive: true,
        isVerified: true,
      });
      console.log('👤 Created demo user: demo@upgreat.com / Demo123!');
    } else {
      // Update password in case it was double-hashed
      demoUser.password = 'Demo123!';
      await demoUser.save();
      console.log('👤 Demo user password reset');
    }

    // Clear existing properties
    await Property.deleteMany({});
    console.log('🗑️  Cleared existing properties');

    // Insert sample properties
    const propertiesWithOwner = sampleProperties.map((p) => ({
      ...p,
      owner: demoUser!._id,
      viewCount: Math.floor(Math.random() * 200) + 50,
    }));

    await Property.insertMany(propertiesWithOwner);
    console.log(`✅ Inserted ${sampleProperties.length} sample properties`);

    console.log('');
    console.log('🎉 Seed completed successfully!');
    console.log('');
    console.log('Demo Account:');
    console.log('  Email: demo@upgreat.com');
    console.log('  Password: Demo123!');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

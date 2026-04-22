import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../api/client';

const { width } = Dimensions.get('window');

const SPACE_TYPES = [
  { type: 'land', icon: '🌾', name: 'Land', nameAr: 'أرض', color: '#4CAF50' },
  { type: 'warehouse', icon: '🏭', name: 'Warehouse', nameAr: 'مستودع', color: '#FF9800' },
  { type: 'storage', icon: '📦', name: 'Storage', nameAr: 'تخزين', color: '#9C27B0' },
  { type: 'shipping_container', icon: '🚢', name: 'Container', nameAr: 'حاوية', color: '#2196F3' },
  { type: 'aviation_hangar', icon: '✈️', name: 'Aviation', nameAr: 'طيران', color: '#E91E63' },
  { type: 'train_cargo', icon: '🚂', name: 'Train', nameAr: 'قطار', color: '#795548' },
  { type: 'office', icon: '🏢', name: 'Office', nameAr: 'مكتب', color: '#607D8B' },
  { type: 'retail', icon: '🏪', name: 'Retail', nameAr: 'متجر', color: '#00BCD4' },
];

interface Space {
  _id: string;
  title: string;
  price: number;
  currency: string;
  images: string[];
  location: {
    city: string;
    country: string;
  };
  spaceType: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [featuredSpaces, setFeaturedSpaces] = useState<Space[]>([]);
  const [stats, setStats] = useState({ totalSpaces: 0, totalUsers: 0, totalCities: 0 });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [spacesRes, statsRes] = await Promise.all([
        api.get('/properties?limit=6&featured=true'),
        api.get('/properties/stats'),
      ]);

      if (spacesRes.data.success) {
        setFeaturedSpaces(spacesRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const renderSpaceCard = ({ item }: { item: Space }) => (
    <TouchableOpacity
      style={styles.spaceCard}
      onPress={() => navigation.navigate('SpaceDetail', { id: item._id })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/200x120' }}
        style={styles.spaceImage}
      />
      <View style={styles.spaceInfo}>
        <Text style={styles.spaceTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.spaceLocation} numberOfLines={1}>
          📍 {item.location?.city}, {item.location?.country}
        </Text>
        <Text style={styles.spacePrice}>
          {item.currency} {item.price?.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {user ? `Hello, ${user.fullName?.split(' ')[0]}` : 'Welcome'}
          </Text>
          <Text style={styles.tagline}>Find your perfect space</Text>
        </View>
        {user && (
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.bellIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Any Space. Anywhere.</Text>
        <Text style={styles.heroSubtitle}>
          Discover spaces for every need - from warehouses to hangars
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate('Spaces')}
        >
          <Text style={styles.exploreButtonText}>Explore Spaces</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalSpaces || 0}+</Text>
          <Text style={styles.statLabel}>Spaces</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalUsers || 0}+</Text>
          <Text style={styles.statLabel}>Users</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalCities || 0}+</Text>
          <Text style={styles.statLabel}>Cities</Text>
        </View>
      </View>

      {/* Space Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Type</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {SPACE_TYPES.map((type) => (
            <TouchableOpacity
              key={type.type}
              style={[styles.categoryCard, { backgroundColor: type.color }]}
              onPress={() => navigation.navigate('Spaces', { type: type.type })}
            >
              <Text style={styles.categoryIcon}>{type.icon}</Text>
              <Text style={styles.categoryName}>{type.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Spaces */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Spaces</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Spaces')}>
            <Text style={styles.seeAllText}>See All →</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={featuredSpaces}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderSpaceCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.spacesScroll}
        />
      </View>

      {/* CTA Section */}
      {!user && (
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to list your space?</Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands of space owners earning with their properties
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.ctaButtonText}>Get Started Free</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  bellIcon: {
    fontSize: 28,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#f44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hero: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: 100,
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  categoryIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  categoryName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  spacesScroll: {
    paddingHorizontal: 16,
  },
  spaceCard: {
    width: 220,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  spaceImage: {
    width: 220,
    height: 140,
  },
  spaceInfo: {
    padding: 12,
  },
  spaceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  spaceLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  spacePrice: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 8,
  },
  ctaSection: {
    backgroundColor: '#333',
    padding: 32,
    margin: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 24,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 40,
  },
});

export default HomeScreen;

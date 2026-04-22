import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../api/client';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

interface Space {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  priceType: string;
  images: string[];
  location: {
    address: string;
    city: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  spaceType: string;
  dimensions?: {
    length: number;
    width: number;
    height?: number;
    area: number;
  };
  amenities?: string[];
  features?: Record<string, unknown>;
  owner: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  status: string;
  createdAt: string;
}

const SPACE_TYPE_ICONS: Record<string, string> = {
  land: '🌾',
  warehouse: '🏭',
  storage: '📦',
  shipping_container: '🚢',
  aviation_hangar: '✈️',
  train_cargo: '🚂',
  office: '🏢',
  retail: '🏪',
};

const SpaceDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchSpace();
  }, []);

  const fetchSpace = async () => {
    try {
      const response = await api.get(`/properties/${route.params.id}`);
      if (response.data.success) {
        setSpace(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching space:', error);
      Alert.alert('Error', 'Failed to load space details');
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to contact the owner', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login' as never) },
      ]);
      return;
    }

    if (space?.owner.phone) {
      Linking.openURL(`tel:${space.owner.phone}`);
    } else if (space?.owner.email) {
      Linking.openURL(`mailto:${space.owner.email}`);
    }
  };

  const handleMessage = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to send a message', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login' as never) },
      ]);
      return;
    }

    // Navigate to messages or open email
    if (space?.owner.email) {
      Linking.openURL(
        `mailto:${space.owner.email}?subject=Inquiry about ${space.title}`
      );
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to save favorites', [
        { text: 'Cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login' as never) },
      ]);
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${space?._id}`);
      } else {
        await api.post('/favorites', { propertyId: space?._id });
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!space) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>😕</Text>
        <Text style={styles.errorText}>Space not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
          >
            {space.images?.length > 0 ? (
              space.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.image}
                />
              ))
            ) : (
              <Image
                source={{ uri: 'https://via.placeholder.com/400x300' }}
                style={styles.image}
              />
            )}
          </ScrollView>
          <View style={styles.imageDots}>
            {space.images?.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentImageIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
          >
            <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title & Type */}
          <View style={styles.titleRow}>
            <View style={styles.typeTag}>
              <Text style={styles.typeIcon}>
                {SPACE_TYPE_ICONS[space.spaceType] || '🏠'}
              </Text>
              <Text style={styles.typeText}>
                {space.spaceType?.replace('_', ' ')}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>{space.title}</Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {space.currency} {space.price?.toLocaleString()}
            </Text>
            <Text style={styles.priceType}>/ {space.priceType || 'month'}</Text>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>
              {space.location?.address}, {space.location?.city},{' '}
              {space.location?.country}
            </Text>
          </View>

          {/* Dimensions */}
          {space.dimensions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Dimensions</Text>
              <View style={styles.dimensionsGrid}>
                {space.dimensions.length && (
                  <View style={styles.dimensionItem}>
                    <Text style={styles.dimensionValue}>
                      {space.dimensions.length}m
                    </Text>
                    <Text style={styles.dimensionLabel}>Length</Text>
                  </View>
                )}
                {space.dimensions.width && (
                  <View style={styles.dimensionItem}>
                    <Text style={styles.dimensionValue}>
                      {space.dimensions.width}m
                    </Text>
                    <Text style={styles.dimensionLabel}>Width</Text>
                  </View>
                )}
                {space.dimensions.height && (
                  <View style={styles.dimensionItem}>
                    <Text style={styles.dimensionValue}>
                      {space.dimensions.height}m
                    </Text>
                    <Text style={styles.dimensionLabel}>Height</Text>
                  </View>
                )}
                {space.dimensions.area && (
                  <View style={styles.dimensionItem}>
                    <Text style={styles.dimensionValue}>
                      {space.dimensions.area}m²
                    </Text>
                    <Text style={styles.dimensionLabel}>Area</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{space.description}</Text>
          </View>

          {/* Amenities */}
          {space.amenities && space.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {space.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Text style={styles.amenityIcon}>✓</Text>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Owner Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listed By</Text>
            <View style={styles.ownerCard}>
              <View style={styles.ownerAvatar}>
                <Text style={styles.ownerInitial}>
                  {space.owner?.fullName?.charAt(0) || 'O'}
                </Text>
              </View>
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerName}>{space.owner?.fullName}</Text>
                <Text style={styles.ownerLabel}>Property Owner</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
          <Text style={styles.messageButtonText}>✉️ Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
          <Text style={styles.contactButtonText}>📞 Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: width,
    height: 300,
  },
  imageDots: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#fff',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  content: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  typeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  priceType: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  locationText: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dimensionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dimensionItem: {
    width: '25%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dimensionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  dimensionLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  amenityIcon: {
    fontSize: 14,
    color: '#4CAF50',
    marginRight: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#555',
  },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitial: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  ownerInfo: {
    marginLeft: 16,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  ownerLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  bottomPadding: {
    height: 100,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default SpaceDetailScreen;

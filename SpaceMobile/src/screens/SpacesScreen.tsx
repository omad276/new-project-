import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import api from '../api/client';

const SPACE_TYPES = [
  { value: '', label: 'All' },
  { value: 'land', label: '🌾 Land' },
  { value: 'warehouse', label: '🏭 Warehouse' },
  { value: 'storage', label: '📦 Storage' },
  { value: 'shipping_container', label: '🚢 Container' },
  { value: 'aviation_hangar', label: '✈️ Aviation' },
  { value: 'train_cargo', label: '🚂 Train' },
  { value: 'office', label: '🏢 Office' },
  { value: 'retail', label: '🏪 Retail' },
];

interface Space {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  location: {
    city: string;
    country: string;
  };
  spaceType: string;
  dimensions?: {
    length: number;
    width: number;
    area: number;
  };
}

const SpacesScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(route.params?.type || '');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchSpaces(1, true);
  }, [selectedType]);

  const fetchSpaces = async (pageNum: number, reset: boolean = false) => {
    try {
      const params = new URLSearchParams();
      params.set('page', pageNum.toString());
      params.set('limit', '10');
      if (selectedType) params.set('spaceType', selectedType);
      if (searchQuery) params.set('q', searchQuery);

      const response = await api.get(`/properties?${params.toString()}`);

      if (response.data.success) {
        const newSpaces = response.data.data;
        setSpaces(reset ? newSpaces : [...spaces, ...newSpaces]);
        setHasMore(newSpaces.length === 10);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching spaces:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSpaces(1, true);
  }, [selectedType, searchQuery]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchSpaces(page + 1);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchSpaces(1, true);
  };

  const renderSpaceCard = ({ item }: { item: Space }) => (
    <TouchableOpacity
      style={styles.spaceCard}
      onPress={() => navigation.navigate('SpaceDetail', { id: item._id })}
    >
      <Image
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/300x200' }}
        style={styles.spaceImage}
      />
      <View style={styles.spaceInfo}>
        <Text style={styles.spaceTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.spaceDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.spaceDetails}>
          <Text style={styles.spaceLocation}>
            📍 {item.location?.city}, {item.location?.country}
          </Text>
          {item.dimensions?.area && (
            <Text style={styles.spaceArea}>📐 {item.dimensions.area} m²</Text>
          )}
        </View>
        <Text style={styles.spacePrice}>
          {item.currency} {item.price?.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search spaces..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Type Filters */}
      <FlatList
        data={SPACE_TYPES}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedType === item.value && styles.filterChipActive,
            ]}
            onPress={() => setSelectedType(item.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedType === item.value && styles.filterChipTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filtersContainer}
      />
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#4CAF50" />
      </View>
    );
  };

  if (loading && spaces.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading spaces...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={spaces}
        renderItem={renderSpaceCard}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏠</Text>
            <Text style={styles.emptyText}>No spaces found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingBottom: 12,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    paddingHorizontal: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
  },
  filterChipActive: {
    backgroundColor: '#4CAF50',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  spaceCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  spaceImage: {
    width: '100%',
    height: 180,
  },
  spaceInfo: {
    padding: 16,
  },
  spaceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  spaceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  spaceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  spaceLocation: {
    fontSize: 13,
    color: '#888',
  },
  spaceArea: {
    fontSize: 13,
    color: '#888',
  },
  spacePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  loadingFooter: {
    paddingVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default SpacesScreen;

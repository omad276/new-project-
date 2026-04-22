import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import api from '../api/client';

interface Stats {
  totalUsers: number;
  totalSpaces: number;
  pendingApprovals: number;
  totalRevenue: number;
}

interface PendingSpace {
  _id: string;
  title: string;
  spaceType: string;
  owner: {
    fullName: string;
  };
  createdAt: string;
}

const AdminDashboardScreen = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalSpaces: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
  });
  const [pendingSpaces, setPendingSpaces] = useState<PendingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, spacesRes, pendingRes] = await Promise.all([
        api.get('/users/stats'),
        api.get('/properties/stats'),
        api.get('/admin/spaces?approved=false&limit=5'),
      ]);

      if (usersRes.data.success && spacesRes.data.success) {
        setStats({
          totalUsers: usersRes.data.data.total || 0,
          totalSpaces: spacesRes.data.data.totalProperties || 0,
          pendingApprovals: pendingRes.data.pagination?.total || 0,
          totalRevenue: 0,
        });
      }

      if (pendingRes.data.success) {
        setPendingSpaces(pendingRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleApprove = async (spaceId: string, approved: boolean) => {
    try {
      await api.patch(`/admin/spaces/${spaceId}/approve`, { approved });
      Alert.alert('Success', approved ? 'Space approved' : 'Space rejected');
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update space');
    }
  };

  const StatCard = ({
    icon,
    label,
    value,
    color,
  }: {
    icon: string;
    label: string;
    value: number;
    color: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const renderPendingSpace = ({ item }: { item: PendingSpace }) => (
    <View style={styles.pendingCard}>
      <View style={styles.pendingInfo}>
        <Text style={styles.pendingTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.pendingType}>{item.spaceType?.replace('_', ' ')}</Text>
        <Text style={styles.pendingOwner}>by {item.owner?.fullName}</Text>
      </View>
      <View style={styles.pendingActions}>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={() => handleApprove(item._id, true)}
        >
          <Text style={styles.approveText}>✓</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleApprove(item._id, false)}
        >
          <Text style={styles.rejectText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
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
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage your platform</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="👥"
          label="Total Users"
          value={stats.totalUsers}
          color="#4CAF50"
        />
        <StatCard
          icon="🏠"
          label="Total Spaces"
          value={stats.totalSpaces}
          color="#2196F3"
        />
        <StatCard
          icon="⏳"
          label="Pending"
          value={stats.pendingApprovals}
          color="#FF9800"
        />
        <StatCard
          icon="💰"
          label="Revenue"
          value={stats.totalRevenue}
          color="#9C27B0"
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionLabel}>Manage Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>🏠</Text>
            <Text style={styles.actionLabel}>All Spaces</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionLabel}>Analytics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pending Approvals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Approvals</Text>
          {stats.pendingApprovals > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stats.pendingApprovals}</Text>
            </View>
          )}
        </View>

        {pendingSpaces.length > 0 ? (
          <FlatList
            data={pendingSpaces}
            renderItem={renderPendingSpace}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyPending}>
            <Text style={styles.emptyPendingIcon}>✅</Text>
            <Text style={styles.emptyPendingText}>All caught up!</Text>
            <Text style={styles.emptyPendingSubtext}>
              No pending approvals
            </Text>
          </View>
        )}
      </View>

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
    backgroundColor: '#333',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    marginTop: -20,
  },
  statCard: {
    width: '46%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: '2%',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  actionCard: {
    width: '46%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: '2%',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  pendingCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  pendingInfo: {
    flex: 1,
  },
  pendingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pendingType: {
    fontSize: 12,
    color: '#4CAF50',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  pendingOwner: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  pendingActions: {
    flexDirection: 'row',
  },
  approveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  approveText: {
    fontSize: 18,
    color: '#4CAF50',
  },
  rejectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectText: {
    fontSize: 18,
    color: '#f44336',
  },
  emptyPending: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyPendingIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyPendingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyPendingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
});

export default AdminDashboardScreen;

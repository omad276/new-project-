import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Filter,
  MoreVertical,
  Edit,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  getUsers,
  getUserStats,
  updateUser,
  deactivateUser,
} from '@/services/adminService';
import type { User, UserStats, UsersQueryParams } from '@/services/adminService';

function UsersPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: UsersQueryParams = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (searchQuery) params.q = searchQuery;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter === 'active') params.isActive = true;
      if (statusFilter === 'inactive') params.isActive = false;

      const response = await getUsers(params);
      setUsers(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(isArabic ? 'فشل في تحميل المستخدمين' : 'Failed to load users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, roleFilter, statusFilter, isArabic]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await getUserStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleRoleChange = async () => {
    if (!editingUser || !editRole) return;

    try {
      setSaving(true);
      await updateUser(editingUser.id, { role: editRole as User['role'] });
      setEditingUser(null);
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error('Error updating user:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.isActive) {
        await deactivateUser(user.id);
      } else {
        await updateUser(user.id, { isActive: true });
      }
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
    setOpenDropdown(null);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'agent':
        return 'primary';
      case 'owner':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const roles = [
    { value: '', label: isArabic ? 'جميع الأدوار' : 'All Roles' },
    { value: 'buyer', label: isArabic ? 'مشتري' : 'Buyer' },
    { value: 'owner', label: isArabic ? 'مالك' : 'Owner' },
    { value: 'agent', label: isArabic ? 'وكيل' : 'Agent' },
    { value: 'admin', label: isArabic ? 'مدير' : 'Admin' },
  ];

  const statuses = [
    { value: '', label: isArabic ? 'جميع الحالات' : 'All Statuses' },
    { value: 'active', label: isArabic ? 'نشط' : 'Active' },
    { value: 'inactive', label: isArabic ? 'غير نشط' : 'Inactive' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">
          {isArabic ? 'إدارة المستخدمين' : 'User Management'}
        </h1>
        <p className="text-text-secondary mt-2">
          {isArabic
            ? 'عرض وإدارة حسابات المستخدمين'
            : 'View and manage user accounts'}
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-text-secondary text-sm">
                {isArabic ? 'إجمالي المستخدمين' : 'Total Users'}
              </p>
              <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-text-secondary text-sm">
                {isArabic ? 'نشطين' : 'Active'}
              </p>
              <p className="text-2xl font-bold text-green-500">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-text-secondary text-sm">
                {isArabic ? 'موثقين' : 'Verified'}
              </p>
              <p className="text-2xl font-bold text-blue-500">{stats.verified}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-text-secondary text-sm">
                {isArabic ? 'جديد هذا الشهر' : 'New This Month'}
              </p>
              <p className="text-2xl font-bold text-primary">{stats.newThisMonth}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <Input
                type="text"
                placeholder={isArabic ? 'البحث عن مستخدم...' : 'Search users...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 rounded-lg bg-background-tertiary border border-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 rounded-lg bg-background-tertiary border border-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="primary">
                <Filter className="w-4 h-4 me-2" />
                {isArabic ? 'تصفية' : 'Filter'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic ? 'المستخدمين' : 'Users'} ({pagination.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-error mb-4">{error}</p>
              <Button onClick={fetchUsers}>
                {isArabic ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">
                {isArabic ? 'لا يوجد مستخدمين' : 'No users found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-background-tertiary">
                    <th className="text-start p-4 text-text-secondary font-medium">
                      {isArabic ? 'المستخدم' : 'User'}
                    </th>
                    <th className="text-start p-4 text-text-secondary font-medium">
                      {isArabic ? 'الدور' : 'Role'}
                    </th>
                    <th className="text-start p-4 text-text-secondary font-medium">
                      {isArabic ? 'الحالة' : 'Status'}
                    </th>
                    <th className="text-start p-4 text-text-secondary font-medium">
                      {isArabic ? 'تاريخ الإنشاء' : 'Created'}
                    </th>
                    <th className="text-end p-4 text-text-secondary font-medium">
                      {isArabic ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-background-tertiary hover:bg-background-tertiary/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={user.avatar} name={user.fullName} size="sm" />
                          <div>
                            <p className="font-medium text-text-primary">
                              {user.fullName}
                            </p>
                            <p className="text-sm text-text-secondary">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={getRoleBadgeVariant(user.role)} size="sm">
                          {user.role}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              user.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          />
                          <span className="text-text-secondary">
                            {user.isActive
                              ? isArabic
                                ? 'نشط'
                                : 'Active'
                              : isArabic
                              ? 'غير نشط'
                              : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-text-secondary">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2 relative">
                          <button
                            onClick={() =>
                              setOpenDropdown(openDropdown === user.id ? null : user.id)
                            }
                            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                          >
                            <MoreVertical className="w-5 h-5 text-text-secondary" />
                          </button>
                          {openDropdown === user.id && (
                            <div className="absolute end-0 top-full mt-1 w-48 bg-background-secondary border border-background-tertiary rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setEditRole(user.role);
                                  setOpenDropdown(null);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-start text-text-primary hover:bg-background-tertiary"
                              >
                                <Edit className="w-4 h-4" />
                                {isArabic ? 'تعديل الدور' : 'Edit Role'}
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-start hover:bg-background-tertiary"
                              >
                                {user.isActive ? (
                                  <>
                                    <UserX className="w-4 h-4 text-error" />
                                    <span className="text-error">
                                      {isArabic ? 'تعطيل' : 'Deactivate'}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 text-green-500" />
                                    <span className="text-green-500">
                                      {isArabic ? 'تفعيل' : 'Activate'}
                                    </span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-background-tertiary">
              <p className="text-text-secondary">
                {isArabic
                  ? `عرض ${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )} من ${pagination.total}`
                  : `Showing ${(pagination.page - 1) * pagination.limit + 1} - ${Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )} of ${pagination.total}`}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                </Button>
                <span className="text-text-primary">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setEditingUser(null)}
          />
          <div className="relative bg-background-secondary rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-text-primary mb-4">
              {isArabic ? 'تعديل دور المستخدم' : 'Edit User Role'}
            </h2>
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-4">
                <Avatar src={editingUser.avatar} name={editingUser.fullName} size="md" />
                <div>
                  <p className="font-medium text-text-primary">{editingUser.fullName}</p>
                  <p className="text-sm text-text-secondary">{editingUser.email}</p>
                </div>
              </div>
              <label className="block text-text-secondary mb-2">
                {isArabic ? 'الدور' : 'Role'}
              </label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-background-tertiary border border-background-tertiary text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {roles.slice(1).map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setEditingUser(null)}>
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                onClick={handleRoleChange}
                disabled={saving || editRole === editingUser.role}
              >
                {saving
                  ? isArabic
                    ? 'جاري الحفظ...'
                    : 'Saving...'
                  : isArabic
                  ? 'حفظ'
                  : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { UsersPage };

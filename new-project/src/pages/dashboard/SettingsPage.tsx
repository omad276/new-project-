import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  User,
  Lock,
  Bell,
  Globe,
  Shield,
  Camera,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';

// Mock user data
const mockUser = {
  name: 'Mohammed Ahmed',
  nameAr: 'محمد أحمد',
  email: 'mohammed@example.com',
  phone: '+966 50 123 4567',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
};

function SettingsPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: mockUser.name,
    email: mockUser.email,
    phone: mockUser.phone,
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailInquiries: true,
    emailViews: false,
    emailFavorites: true,
    emailNewsletter: true,
    pushInquiries: true,
    pushViews: true,
    pushFavorites: false,
  });

  const handleSave = async (section: string) => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSavedMessage(section);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">{t('dashboard.settings')}</h1>
        <p className="text-text-secondary mt-1">
          {isArabic ? 'إدارة حسابك وتفضيلاتك' : 'Manage your account and preferences'}
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 me-2" />
            {t('dashboard.profile')}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 me-2" />
            {isArabic ? 'الأمان' : 'Security'}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 me-2" />
            {t('dashboard.notifications')}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Globe className="w-4 h-4 me-2" />
            {isArabic ? 'التفضيلات' : 'Preferences'}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.profile')}</CardTitle>
              <CardDescription>
                {isArabic
                  ? 'تحديث معلوماتك الشخصية'
                  : 'Update your personal information'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar src={mockUser.avatar} name={mockUser.name} size="xl" />
                  <button className="absolute bottom-0 end-0 p-2 rounded-full bg-primary text-background hover:bg-primary-hover transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h3 className="font-medium">{isArabic ? mockUser.nameAr : mockUser.name}</h3>
                  <p className="text-sm text-text-muted">{mockUser.email}</p>
                  <Button variant="ghost" size="sm" className="mt-2">
                    {isArabic ? 'تغيير الصورة' : 'Change photo'}
                  </Button>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t('auth.fullName')}
                  value={profileForm.fullName}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, fullName: e.target.value })
                  }
                  leftIcon={<User className="w-5 h-5" />}
                />
                <Input
                  label={t('auth.email')}
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  leftIcon={<Mail className="w-5 h-5" />}
                />
                <Input
                  label={t('auth.phone')}
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, phone: e.target.value })
                  }
                  leftIcon={<Phone className="w-5 h-5" />}
                />
              </div>

              <div className="flex items-center justify-end gap-4">
                {savedMessage === 'profile' && (
                  <span className="flex items-center gap-2 text-success text-sm">
                    <Check className="w-4 h-4" />
                    {isArabic ? 'تم الحفظ' : 'Saved'}
                  </span>
                )}
                <Button onClick={() => handleSave('profile')} isLoading={isSaving}>
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'تغيير كلمة المرور' : 'Change Password'}</CardTitle>
              <CardDescription>
                {isArabic
                  ? 'تأكد من استخدام كلمة مرور قوية'
                  : 'Make sure to use a strong password'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="max-w-md space-y-4">
                <Input
                  label={isArabic ? 'كلمة المرور الحالية' : 'Current Password'}
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                  }
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="cursor-pointer hover:text-text-primary"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  }
                />
                <Input
                  label={isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                  leftIcon={<Lock className="w-5 h-5" />}
                />
                <Input
                  label={t('auth.confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                  leftIcon={<Lock className="w-5 h-5" />}
                />
              </div>

              <div className="flex items-center justify-end gap-4">
                {savedMessage === 'security' && (
                  <span className="flex items-center gap-2 text-success text-sm">
                    <Check className="w-4 h-4" />
                    {isArabic ? 'تم التحديث' : 'Updated'}
                  </span>
                )}
                <Button onClick={() => handleSave('security')} isLoading={isSaving}>
                  {isArabic ? 'تحديث كلمة المرور' : 'Update Password'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                {isArabic ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? 'أضف طبقة حماية إضافية لحسابك'
                  : 'Add an extra layer of security to your account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">
                {isArabic ? 'تفعيل المصادقة الثنائية' : 'Enable 2FA'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</CardTitle>
              <CardDescription>
                {isArabic
                  ? 'اختر الإشعارات التي تريد استلامها عبر البريد'
                  : 'Choose which notifications you want to receive via email'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'emailInquiries', label: isArabic ? 'استفسارات جديدة' : 'New inquiries' },
                { key: 'emailViews', label: isArabic ? 'مشاهدات العقارات' : 'Property views' },
                { key: 'emailFavorites', label: isArabic ? 'إضافة للمفضلة' : 'Added to favorites' },
                { key: 'emailNewsletter', label: isArabic ? 'النشرة الإخبارية' : 'Newsletter' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-4 rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors cursor-pointer"
                >
                  <span>{item.label}</span>
                  <div
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-colors',
                      notifications[item.key as keyof typeof notifications]
                        ? 'bg-primary'
                        : 'bg-background-tertiary'
                    )}
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        [item.key]: !notifications[item.key as keyof typeof notifications],
                      })
                    }
                  >
                    <div
                      className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                        notifications[item.key as keyof typeof notifications]
                          ? 'translate-x-6 rtl:-translate-x-6'
                          : 'translate-x-1 rtl:-translate-x-1'
                      )}
                    />
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{isArabic ? 'إشعارات التطبيق' : 'Push Notifications'}</CardTitle>
              <CardDescription>
                {isArabic
                  ? 'إشعارات فورية على جهازك'
                  : 'Instant notifications on your device'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'pushInquiries', label: isArabic ? 'استفسارات جديدة' : 'New inquiries' },
                { key: 'pushViews', label: isArabic ? 'مشاهدات العقارات' : 'Property views' },
                { key: 'pushFavorites', label: isArabic ? 'إضافة للمفضلة' : 'Added to favorites' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-4 rounded-lg bg-background-secondary hover:bg-background-tertiary transition-colors cursor-pointer"
                >
                  <span>{item.label}</span>
                  <div
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-colors',
                      notifications[item.key as keyof typeof notifications]
                        ? 'bg-primary'
                        : 'bg-background-tertiary'
                    )}
                    onClick={() =>
                      setNotifications({
                        ...notifications,
                        [item.key]: !notifications[item.key as keyof typeof notifications],
                      })
                    }
                  >
                    <div
                      className={cn(
                        'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                        notifications[item.key as keyof typeof notifications]
                          ? 'translate-x-6 rtl:-translate-x-6'
                          : 'translate-x-1 rtl:-translate-x-1'
                      )}
                    />
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? 'اللغة' : 'Language'}</CardTitle>
              <CardDescription>
                {isArabic ? 'اختر لغة واجهة التطبيق' : 'Choose your preferred language'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <button
                  onClick={() => i18n.changeLanguage('ar')}
                  className={cn(
                    'flex-1 p-4 rounded-xl border-2 transition-colors',
                    i18n.language === 'ar'
                      ? 'border-primary bg-primary/5'
                      : 'border-background-tertiary hover:border-primary/50'
                  )}
                >
                  <span className="text-2xl mb-2 block">🇸🇦</span>
                  <span className="font-medium">العربية</span>
                </button>
                <button
                  onClick={() => i18n.changeLanguage('en')}
                  className={cn(
                    'flex-1 p-4 rounded-xl border-2 transition-colors',
                    i18n.language === 'en'
                      ? 'border-primary bg-primary/5'
                      : 'border-background-tertiary hover:border-primary/50'
                  )}
                >
                  <span className="text-2xl mb-2 block">🇺🇸</span>
                  <span className="font-medium">English</span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-error">{isArabic ? 'حذف الحساب' : 'Delete Account'}</CardTitle>
              <CardDescription>
                {isArabic
                  ? 'حذف حسابك نهائياً وجميع البيانات المرتبطة به'
                  : 'Permanently delete your account and all associated data'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="danger">
                {isArabic ? 'حذف الحساب' : 'Delete Account'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { SettingsPage };

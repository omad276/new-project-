import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, User, Phone, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

function RegisterPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const isArabic = i18n.language === 'ar';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '' as UserRole | '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roleOptions = [
    {
      value: 'buyer',
      label: isArabic ? 'مشتري / مستأجر' : 'Buyer / Renter',
      description: isArabic ? 'أبحث عن عقار' : 'Looking for a property',
    },
    {
      value: 'owner',
      label: isArabic ? 'مالك عقار' : 'Property Owner',
      description: isArabic ? 'لدي عقار للبيع أو الإيجار' : 'I have a property to sell or rent',
    },
    {
      value: 'agent',
      label: isArabic ? 'وكيل عقاري' : 'Real Estate Agent',
      description: isArabic ? 'أمثل عملاء ومالكي عقارات' : 'I represent clients and property owners',
    },
  ];

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.role) {
      newErrors.role = isArabic ? 'اختر نوع الحساب' : 'Select account type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = isArabic ? 'الاسم مطلوب' : 'Name is required';
    }

    if (!formData.email) {
      newErrors.email = isArabic ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = isArabic ? 'البريد الإلكتروني غير صالح' : 'Invalid email address';
    }

    if (!formData.phone) {
      newErrors.phone = isArabic ? 'رقم الهاتف مطلوب' : 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = isArabic ? 'كلمة المرور مطلوبة' : 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = isArabic
        ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
        : 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = isArabic
        ? 'كلمات المرور غير متطابقة'
        : 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = isArabic
        ? 'يجب الموافقة على الشروط'
        : 'You must agree to the terms';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setIsLoading(true);
    try {
      const result = await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role as UserRole,
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({
          email: isArabic
            ? 'البريد الإلكتروني مسجل مسبقاً'
            : result.error || 'Registration failed',
        });
      }
    } catch (error) {
      console.error('Register error:', error);
      setErrors({
        email: isArabic ? 'حدث خطأ، حاول مرة أخرى' : 'An error occurred, please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const password = formData.password;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const strengthLabels = [
    { label: isArabic ? 'ضعيفة' : 'Weak', color: 'bg-error' },
    { label: isArabic ? 'متوسطة' : 'Fair', color: 'bg-warning' },
    { label: isArabic ? 'جيدة' : 'Good', color: 'bg-primary' },
    { label: isArabic ? 'قوية' : 'Strong', color: 'bg-success' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Building2 className="w-10 h-10 text-primary" />
            <span className="text-2xl font-bold text-primary">{t('common.appName')}</span>
          </Link>
          <h1 className="text-2xl font-bold">{t('auth.registerTitle')}</h1>
          <p className="text-text-secondary mt-2">
            {isArabic
              ? 'أنشئ حسابك وابدأ رحلتك العقارية'
              : 'Create your account and start your property journey'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                step >= 1 ? 'bg-primary text-background' : 'bg-background-tertiary text-text-muted'
              )}
            >
              {step > 1 ? <Check className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-sm text-text-secondary hidden sm:inline">
              {isArabic ? 'نوع الحساب' : 'Account Type'}
            </span>
          </div>
          <div className="w-12 h-0.5 bg-background-tertiary">
            <div
              className={cn('h-full bg-primary transition-all', step >= 2 ? 'w-full' : 'w-0')}
            />
          </div>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                step >= 2 ? 'bg-primary text-background' : 'bg-background-tertiary text-text-muted'
              )}
            >
              2
            </div>
            <span className="text-sm text-text-secondary hidden sm:inline">
              {isArabic ? 'المعلومات' : 'Information'}
            </span>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            {step === 1 ? (
              /* Step 1: Choose Role */
              <div className="space-y-4">
                <p className="text-center text-text-secondary mb-6">
                  {isArabic ? 'كيف تريد استخدام أبجريت؟' : 'How would you like to use Upgreat?'}
                </p>

                <div className="space-y-3">
                  {roleOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: option.value as UserRole })}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 text-start transition-all',
                        formData.role === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-background-tertiary hover:border-primary/50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-text-secondary">{option.description}</div>
                        </div>
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                            formData.role === option.value
                              ? 'border-primary bg-primary'
                              : 'border-background-tertiary'
                          )}
                        >
                          {formData.role === option.value && (
                            <Check className="w-3 h-3 text-background" />
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {errors.role && (
                  <p className="text-sm text-error text-center">{errors.role}</p>
                )}

                <Button fullWidth onClick={handleNext} className="mt-6">
                  {isArabic ? 'التالي' : 'Continue'}
                </Button>
              </div>
            ) : (
              /* Step 2: Registration Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label={t('auth.fullName')}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  error={errors.fullName}
                  leftIcon={<User className="w-5 h-5" />}
                  placeholder={isArabic ? 'محمد أحمد' : 'John Doe'}
                />

                <Input
                  label={t('auth.email')}
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                  leftIcon={<Mail className="w-5 h-5" />}
                  placeholder="name@example.com"
                />

                <Input
                  label={t('auth.phone')}
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={errors.phone}
                  leftIcon={<Phone className="w-5 h-5" />}
                  placeholder="+966 5X XXX XXXX"
                />

                <div>
                  <Input
                    label={t('auth.password')}
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
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
                    placeholder="••••••••"
                  />
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              'h-1 flex-1 rounded-full',
                              i < passwordStrength()
                                ? strengthLabels[passwordStrength() - 1]?.color
                                : 'bg-background-tertiary'
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-text-muted">
                        {strengthLabels[passwordStrength() - 1]?.label || (isArabic ? 'أدخل كلمة مرور' : 'Enter a password')}
                      </p>
                    </div>
                  )}
                </div>

                <Input
                  label={t('auth.confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  error={errors.confirmPassword}
                  leftIcon={<Lock className="w-5 h-5" />}
                  placeholder="••••••••"
                />

                {/* Terms Agreement */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                    className="mt-1 w-4 h-4 rounded border-background-tertiary bg-background-secondary text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-text-secondary">
                    {isArabic ? (
                      <>
                        أوافق على{' '}
                        <Link to="/terms" className="text-primary hover:underline">
                          الشروط والأحكام
                        </Link>{' '}
                        و{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                          سياسة الخصوصية
                        </Link>
                      </>
                    ) : (
                      <>
                        I agree to the{' '}
                        <Link to="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                      </>
                    )}
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-sm text-error">{errors.agreeToTerms}</p>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" type="button" onClick={() => setStep(1)}>
                    {isArabic ? 'رجوع' : 'Back'}
                  </Button>
                  <Button type="submit" fullWidth isLoading={isLoading}>
                    {t('auth.registerButton')}
                  </Button>
                </div>
              </form>
            )}

            {/* Login Link */}
            <p className="mt-6 text-center text-text-secondary">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                {t('auth.loginButton')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { RegisterPage };

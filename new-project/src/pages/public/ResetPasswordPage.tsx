import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { api } from '@/lib/api';

function ResetPasswordPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [error, setError] = useState('');

  const validatePassword = () => {
    if (password.length < 8) {
      return isArabic ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters';
    }
    if (!/[a-z]/.test(password)) {
      return isArabic ? 'كلمة المرور يجب أن تحتوي على حرف صغير' : 'Password must contain a lowercase letter';
    }
    if (!/[A-Z]/.test(password)) {
      return isArabic ? 'كلمة المرور يجب أن تحتوي على حرف كبير' : 'Password must contain an uppercase letter';
    }
    if (!/\d/.test(password)) {
      return isArabic ? 'كلمة المرور يجب أن تحتوي على رقم' : 'Password must contain a number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError(isArabic ? 'رمز إعادة التعيين مفقود' : 'Reset token is missing');
      return;
    }

    const passwordError = validatePassword();
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError(isArabic ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword: password,
      });

      if (response.success) {
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setStatus('error');
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      setStatus('error');
      setError(isArabic ? 'فشل في إعادة تعيين كلمة المرور' : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="w-16 h-16 text-error mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {isArabic ? 'رابط غير صالح' : 'Invalid Link'}
            </h1>
            <p className="text-text-secondary mb-6">
              {isArabic
                ? 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.'
                : 'This password reset link is invalid or has expired.'}
            </p>
            <Link to="/forgot-password">
              <Button fullWidth>
                {isArabic ? 'طلب رابط جديد' : 'Request New Link'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {isArabic ? 'تم إعادة تعيين كلمة المرور!' : 'Password Reset!'}
            </h1>
            <p className="text-text-secondary mb-6">
              {isArabic
                ? 'تم تغيير كلمة المرور بنجاح. جاري توجيهك لتسجيل الدخول...'
                : 'Your password has been changed. Redirecting to login...'}
            </p>
            <Link to="/login">
              <Button fullWidth>
                {isArabic ? 'تسجيل الدخول' : 'Go to Login'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
            </h1>
            <p className="text-text-secondary">
              {isArabic ? 'أدخل كلمة المرور الجديدة' : 'Enter your new password'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              required
            />

            <Input
              label={isArabic ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-5 h-5" />}
              error={error}
              required
            />

            <Button type="submit" fullWidth isLoading={isLoading}>
              {isArabic ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export { ResetPasswordPage };

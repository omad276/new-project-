import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { api } from '@/lib/api';

function ForgotPasswordPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      if (response.success) {
        setSubmitted(true);
      } else {
        setError(response.message || 'Failed to send reset email');
      }
    } catch (err) {
      setError(isArabic ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {isArabic ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
            </h1>
            <p className="text-text-secondary mb-6">
              {isArabic
                ? 'إذا كان هناك حساب مرتبط بهذا البريد، ستتلقى رابط إعادة تعيين كلمة المرور.'
                : 'If an account exists with this email, you will receive a password reset link.'}
            </p>
            <Link to="/login">
              <Button variant="outline" fullWidth>
                <ArrowLeft className="w-4 h-4 me-2 rtl:rotate-180" />
                {isArabic ? 'العودة لتسجيل الدخول' : 'Back to Login'}
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
              {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
            </h1>
            <p className="text-text-secondary">
              {isArabic
                ? 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين'
                : 'Enter your email and we will send you a reset link'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={isArabic ? 'البريد الإلكتروني' : 'Email'}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              leftIcon={<Mail className="w-5 h-5" />}
              error={error}
              required
            />

            <Button type="submit" fullWidth isLoading={isLoading}>
              {isArabic ? 'إرسال رابط إعادة التعيين' : 'Send Reset Link'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-primary hover:underline inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {isArabic ? 'العودة لتسجيل الدخول' : 'Back to Login'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { ForgotPasswordPage };

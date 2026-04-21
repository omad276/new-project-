import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { api } from '@/lib/api';

function VerifyEmailPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus('error');
        setError(isArabic ? 'رمز التحقق مفقود' : 'Verification token is missing');
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        if (response.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setError(response.message || 'Verification failed');
        }
      } catch (err) {
        setStatus('error');
        setError(isArabic ? 'فشل التحقق من البريد الإلكتروني' : 'Email verification failed');
      }
    }

    verifyEmail();
  }, [token, isArabic]);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                {isArabic ? 'جاري التحقق...' : 'Verifying...'}
              </h1>
              <p className="text-text-secondary">
                {isArabic ? 'يرجى الانتظار' : 'Please wait'}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                {isArabic ? 'تم التحقق بنجاح!' : 'Email Verified!'}
              </h1>
              <p className="text-text-secondary mb-6">
                {isArabic
                  ? 'تم التحقق من بريدك الإلكتروني. يمكنك الآن تسجيل الدخول.'
                  : 'Your email has been verified. You can now log in.'}
              </p>
              <Link to="/login">
                <Button fullWidth>
                  {isArabic ? 'تسجيل الدخول' : 'Go to Login'}
                </Button>
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-error mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                {isArabic ? 'فشل التحقق' : 'Verification Failed'}
              </h1>
              <p className="text-text-secondary mb-6">{error}</p>
              <div className="space-y-3">
                <Link to="/login">
                  <Button variant="outline" fullWidth>
                    {isArabic ? 'تسجيل الدخول' : 'Go to Login'}
                  </Button>
                </Link>
                <Link to="/resend-verification">
                  <Button variant="ghost" fullWidth>
                    <Mail className="w-4 h-4 me-2" />
                    {isArabic ? 'إعادة إرسال رابط التحقق' : 'Resend Verification Email'}
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export { VerifyEmailPage };

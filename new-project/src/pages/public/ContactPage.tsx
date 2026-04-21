import { useTranslation } from 'react-i18next';
import { Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

function ContactPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            {isArabic ? 'تواصل معنا' : 'Contact Us'}
          </h1>
          <p className="text-text-secondary">
            {isArabic ? 'نحن هنا للإجابة على استفساراتك' : 'We are here to answer your inquiries'}
          </p>
        </section>

        {/* Contact Cards */}
        <div className="space-y-6">
          {/* Email Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-1">
                    {isArabic ? 'البريد الإلكتروني للاستفسارات' : 'Inquiry Email'}
                  </h2>
                  <a
                    href="mailto:esmailabdelrazig@gmail.com"
                    className="text-primary hover:underline text-lg"
                  >
                    esmailabdelrazig@gmail.com
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Note */}
        <p className="text-center text-text-secondary mt-8">
          {isArabic
            ? 'نرحب بأسئلتكم واقتراحاتكم. سنرد في أقرب وقت ممكن.'
            : 'We welcome your questions and suggestions. We will reply as soon as possible.'}
        </p>
      </div>
    </div>
  );
}

export { ContactPage };

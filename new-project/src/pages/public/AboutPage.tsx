import { useTranslation } from 'react-i18next';

function AboutPage() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Space Platform
          </h1>
          <p className="text-xl text-text-secondary">
            {isArabic ? 'أي مساحة. في أي مكان. لأي غرض.' : 'Any space. Anywhere. Any purpose.'}
          </p>
        </section>

        {/* Vision Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            {isArabic ? 'فكرتنا' : 'Our Idea'}
          </h2>
          <p className="text-text-secondary mb-4">
            {isArabic
              ? 'نؤمن بأن كل مساحة تحمل إمكانات. سواء كانت أرضًا شاسعة، أو مستودعًا جاهزًا، أو حاوية شحن، أو حظيرة طيران، أو حتى عربة قطار - كل مساحة تستحق أن تُرى وتُستخدم.'
              : 'We believe every space holds potential. Whether it\'s vast land, a ready warehouse, a shipping container, an aviation hangar, or even a train car – every space deserves to be seen and used.'}
          </p>
          <p className="text-text-secondary">
            {isArabic
              ? 'أطلقنا Space لنكون الجسر بين من يملك مساحة ومن يحتاجها. منصة عالمية، بلا حدود، تربط الناس حول العالم.'
              : 'We launched Space to be the bridge between those who own a space and those who need it. A global platform, without borders, connecting people around the world.'}
          </p>
        </section>

        {/* Mission Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            {isArabic ? 'ماذا نفعل' : 'What We Do'}
          </h2>
          <p className="text-text-secondary">
            {isArabic
              ? 'نوفر مكانًا واحدًا لعرض وتأجير وبيع أي نوع من المساحات. واجهة بسيطة، أدوات قوية، ورؤية واضحة: تحويل كل مساحة إلى فرصة.'
              : 'We provide one place to list, rent, and sell any type of space. Simple interface, powerful tools, and a clear vision: turning every space into an opportunity.'}
          </p>
        </section>

        {/* Values Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            {isArabic ? 'نهجنا' : 'Our Approach'}
          </h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-text-secondary">
              <span className="text-primary">✓</span>
              <span>
                <strong>{isArabic ? 'الشفافية' : 'Transparency'}:</strong>{' '}
                {isArabic ? 'لا مفاجآت، فقط معلومات واضحة.' : 'No surprises, only clear information.'}
              </span>
            </li>
            <li className="flex items-start gap-3 text-text-secondary">
              <span className="text-primary">✓</span>
              <span>
                <strong>{isArabic ? 'البساطة' : 'Simplicity'}:</strong>{' '}
                {isArabic ? 'واجهة سهلة للجميع.' : 'Easy interface for everyone.'}
              </span>
            </li>
            <li className="flex items-start gap-3 text-text-secondary">
              <span className="text-primary">✓</span>
              <span>
                <strong>{isArabic ? 'الشمولية' : 'Inclusivity'}:</strong>{' '}
                {isArabic ? 'جميع المساحات مرحب بها.' : 'All spaces are welcome.'}
              </span>
            </li>
            <li className="flex items-start gap-3 text-text-secondary">
              <span className="text-primary">✓</span>
              <span>
                <strong>{isArabic ? 'التكنولوجيا' : 'Technology'}:</strong>{' '}
                {isArabic ? 'أدوات حديثة لقياس وتحليل المساحات.' : 'Modern tools for measuring and analyzing spaces.'}
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export { AboutPage };

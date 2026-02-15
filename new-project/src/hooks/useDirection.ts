import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type Direction = 'rtl' | 'ltr';

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export function useDirection(): Direction {
  const { i18n } = useTranslation();
  const direction: Direction = RTL_LANGUAGES.includes(i18n.language) ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
  }, [direction, i18n.language]);

  return direction;
}

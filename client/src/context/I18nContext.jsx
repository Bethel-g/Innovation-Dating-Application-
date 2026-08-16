import { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    nav: { dashboard: 'Dashboard', discover: 'Discover', jobs: 'Jobs', events: 'Events', ideas: 'Ideas', projects: 'Projects', mentors: 'Mentors', messages: 'Messages', notifications: 'Notifications', settings: 'Settings', profile: 'Profile' },
    feed: { forYou: 'For You', following: 'Following', trending: 'Trending', industry: 'Your Industry', recommended: 'Recommended', compose: 'Share an update...', publish: 'Publish' },
    common: { search: 'Search...', loading: 'Loading...', error: 'Something went wrong', retry: 'Try Again', save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', viewAll: 'View all', seeMore: 'See more' },
    jobs: { title: 'Job Marketplace', browse: 'Browse Jobs', saved: 'Saved', applications: 'My Applications', postJob: 'Post a Job', apply: 'Apply Now', remote: 'Remote Only' },
    events: { title: 'Innovation Events', browse: 'Browse', myEvents: 'My Events', host: 'Host Event', join: 'Join Event', registered: 'Registered' },
    profile: { edit: 'Edit Profile', aiAnalysis: 'AI Analysis', skills: 'Skills', endorsements: 'Endorsements', experience: 'Experience', projects: 'Projects' },
    ai: { greeting: 'Hi! I\'m your Innovation Assistant', placeholder: 'Ask me anything...', cofounder: 'Find a co-founder', mentor: 'Find a mentor', collaborators: 'Find collaborators' },
  },
  am: {
    nav: { dashboard: 'ዳሽቦርድ', discover: 'ፈልግ', jobs: 'ስራ', events: 'ክስተቶች', ideas: 'ሐሳቦች', projects: '프로젝트', mentors: 'መምህራን', messages: 'መልዕክቶች', notifications: 'ማስታወቂያዎች', settings: 'ማስተካከያዎች', profile: 'መገለጫ' },
    common: { search: 'ፈልግ...', loading: 'በመጫን ላይ...', error: 'ችግር ተፈጥሯል', retry: 'እንደገና ሞክር', save: 'አስቀምጥ', cancel: 'ሰርዝ', delete: 'አጥፋ', edit: 'አርም', viewAll: 'ሁሉንም ተመልከት', seeMore: 'ተጨማሪ ተመልከት' },
  },
  fr: {
    nav: { dashboard: 'Tableau de bord', discover: 'Découvrir', jobs: 'Emplois', events: 'Événements', ideas: 'Idées', projects: 'Projets', mentors: 'Mentors', messages: 'Messages', notifications: 'Notifications', settings: 'Paramètres', profile: 'Profil' },
    common: { search: 'Rechercher...', loading: 'Chargement...', error: 'Une erreur s\'est produite', retry: 'Réessayer', save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', viewAll: 'Voir tout', seeMore: 'Voir plus' },
  },
  sw: {
    nav: { dashboard: 'Dashibodi', discover: 'Gundua', jobs: 'Kazi', events: 'Matukio', ideas: 'Mawazo', projects: 'Miradi', mentors: 'Walezi', messages: 'Ujumbe', notifications: 'Arifa', settings: 'Mipangilio', profile: 'Wasifu' },
    common: { search: 'Tafuta...', loading: 'Inapakia...', error: 'Kuna kosa', retry: 'Jaribu tena', save: 'Hifadhi', cancel: 'Ghairi', delete: 'Futa', edit: 'Hariri', viewAll: 'Angalia zote', seeMore: 'Zaidi' },
  },
};

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [timezone, setTimezone] = useState(() => localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('timezone', timezone);
  }, [timezone]);

  const t = (path) => {
    const keys = path.split('.');
    let value = translations[language];
    for (const key of keys) {
      value = value?.[key];
    }
    return value || path;
  };

  const formatDate = (date, options = {}) => {
    return new Intl.DateTimeFormat(language, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: timezone,
      ...options,
    }).format(new Date(date));
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat(language).format(num);
  };

  const currencies = { en: 'USD', am: 'ETB', fr: 'EUR', sw: 'KES' };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language, {
      style: 'currency',
      currency: currencies[language] || 'USD',
    }).format(amount);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, timezone, setTimezone, t, formatDate, formatNumber, formatCurrency, languages: Object.keys(translations) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within I18nProvider');
  return context;
}

export const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'sw', label: 'Kiswahili', flag: '🇰🇪' },
];

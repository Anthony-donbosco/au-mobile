// Generado automáticamente por script de migración
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import es from './locales/es.json';

const LANGUAGE_STORAGE_KEY = '@aureum_language_preference';
const SUPPORTED_LANGUAGES = ['en', 'es'];

const getDeviceLanguage = (): string => {
  try {
    const locales = RNLocalize.getLocales();
    if (locales.length > 0) {
      const deviceLanguage = locales[0].languageCode;
      if (SUPPORTED_LANGUAGES.includes(deviceLanguage)) {
        return deviceLanguage;
      }
    }
  } catch (error) {
    console.warn('Error detecting device language:', error);
  }
  return 'en';
};

const i18nConfig = {
  compatibilityJSON: 'v3',
  lng: undefined,
  fallbackLng: 'en',
  debug: __DEV__,
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
};

const initializeI18n = async (): Promise<void> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    let initialLanguage: string;
    
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      initialLanguage = savedLanguage;
    } else {
      initialLanguage = getDeviceLanguage();
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, initialLanguage);
    }
    
    i18nConfig.lng = initialLanguage;
    await i18n.use(initReactI18next).init(i18nConfig);
    console.log('🌐 i18n initialized with language:', initialLanguage);
  } catch (error) {
    console.error('Error initializing i18n:', error);
    i18nConfig.lng = 'en';
    await i18n.use(initReactI18next).init(i18nConfig);
  }
};

export const changeLanguage = async (language: string): Promise<void> => {
  try {
    if (SUPPORTED_LANGUAGES.includes(language)) {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      console.log('🌐 Language changed to:', language);
    }
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

export const getCurrentLanguage = (): string => i18n.language || 'en';

export const getSupportedLanguages = () => {
  return SUPPORTED_LANGUAGES.map(code => ({
    code,
    name: code === 'en' ? 'English' : 'Spanish',
    nativeName: code === 'en' ? 'English' : 'Español',
  }));
};

initializeI18n();
export default i18n;

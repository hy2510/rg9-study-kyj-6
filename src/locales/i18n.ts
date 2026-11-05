import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import translationEN from '@src/locales/en/translation.json'
import translationKO from '@src/locales/ko/translation.json'
import translationVI from '@src/locales/vi/translation.json'

const resources = {
  ko: {
    translation: translationKO,
  },
  en: {
    translation: translationEN,
  },
  vi: {
    translation: translationVI,
  },
}

const REF = (window as any).REF
const lang = REF?.language || 'ko'

i18n.use(initReactI18next).init({
  fallbackLng: 'ko',
  lng: lang,
  resources,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n

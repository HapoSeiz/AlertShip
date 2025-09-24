import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// List of all 22 Indian constitutional languages
export const locales = [
  'en', // English (default)
  'hi', // Hindi
  'bn', // Bengali
  'te', // Telugu
  'mr', // Marathi
  'ta', // Tamil
  'ur', // Urdu
  'gu', // Gujarati
  'kn', // Kannada
  'ml', // Malayalam
  'or', // Odia
  'pa', // Punjabi
  'as', // Assamese
  'mai', // Maithili
  'sa', // Sanskrit
  'sat', // Santali
  'ks', // Kashmiri
  'ne', // Nepali
  'sd', // Sindhi
  'gom', // Konkani
  'mni', // Manipuri
  'doi', // Dogri
  'brx', // Bodo
];

export const defaultLocale = 'en';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
// Simple demo page to show language functionality without Firebase
"use client"

import { useTranslations, useLocale } from 'next-intl';
import LanguageSelector from '@/components/language-selector';

export default function DemoPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              AlertShip - Indian Languages Demo
            </h1>
            <LanguageSelector />
          </div>
          <p className="text-gray-600 mt-2">
            Current Language: <span className="font-semibold">{locale}</span>
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Navigation Translations
            </h2>
            <div className="space-y-2">
              <p><strong>Home:</strong> {t('navigation.home')}</p>
              <p><strong>About:</strong> {t('navigation.about')}</p>
              <p><strong>Contact:</strong> {t('navigation.contact')}</p>
              <p><strong>FAQs:</strong> {t('navigation.faqs')}</p>
              <p><strong>Report Outage:</strong> {t('navigation.reportOutage')}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Homepage Translations
            </h2>
            <div className="space-y-2">
              <p><strong>Hero Title:</strong> {t('homepage.heroTitle')}</p>
              <p><strong>Hero Subtitle:</strong> {t('homepage.heroSubtitle')}</p>
              <p><strong>Location Placeholder:</strong> {t('homepage.locationPlaceholder')}</p>
              <p><strong>Check Button:</strong> {t('homepage.checkButton')}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Common Translations
            </h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {t('common.loading')}</p>
              <p><strong>Error:</strong> {t('common.error')}</p>
              <p><strong>Save:</strong> {t('common.save')}</p>
              <p><strong>Cancel:</strong> {t('common.cancel')}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Language Features
            </h2>
            <div className="space-y-2 text-sm">
              <p><strong>✅ 22 Indian Constitutional Languages</strong></p>
              <p><strong>✅ Native Script Support</strong></p>
              <p><strong>✅ RTL Support (Urdu, Kashmiri)</strong></p>
              <p><strong>✅ Google Fonts Integration</strong></p>
              <p><strong>✅ Dynamic URL Routing</strong></p>
              <p className="mt-4 text-gray-600">
                Switch languages using the dropdown above to see translations in action!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Hero Description (Translated)
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            {t('homepage.heroDescription')}
          </p>
        </div>
      </div>
    </div>
  );
}
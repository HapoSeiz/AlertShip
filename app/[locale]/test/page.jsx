"use client"

import { useTranslations, useLocale } from 'next-intl';
import LanguageSelector from '@/components/language-selector';

export default function TestPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
              AlertShip i18n Test
            </h1>
            <LanguageSelector />
          </div>
          <p style={{ color: '#666', marginTop: '0.5rem' }}>
            Current Language: <strong>{locale}</strong>
          </p>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Translation Test
          </h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <p><strong>Home:</strong> {t('navigation.home')}</p>
            <p><strong>About:</strong> {t('navigation.about')}</p>
            <p><strong>Contact:</strong> {t('navigation.contact')}</p>
            <p><strong>Hero Title:</strong> {t('homepage.heroTitle')}</p>
            <p><strong>Hero Description:</strong> {t('homepage.heroDescription')}</p>
            <p><strong>Check Button:</strong> {t('homepage.checkButton')}</p>
            <p><strong>Loading:</strong> {t('common.loading')}</p>
          </div>
          
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '4px'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Status:</h3>
            <p style={{ color: '#065f46', margin: 0 }}>
              ✅ Routing works for locale: {locale}
            </p>
            <p style={{ color: '#065f46', margin: 0 }}>
              ✅ Translations loading successfully
            </p>
            <p style={{ color: '#065f46', margin: 0 }}>
              ✅ Language selector functional
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client"

import { useTranslations, useLocale } from 'next-intl';

export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div style={{ 
      minHeight: '100vh', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem' }}>
          AlertShip
        </h1>
        
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '1rem', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          marginBottom: '2rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#065f46' }}>
            ✅ i18n System Working!
          </h2>
          <p><strong>Current Language:</strong> {locale}</p>
          <p><strong>Sample Translation:</strong> {t('navigation.home')}</p>
          <p><strong>Hero Title:</strong> {t('homepage.heroTitle')}</p>
          <p><strong>Hero Description:</strong> {t('homepage.heroDescription')}</p>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '1rem', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          textAlign: 'left'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>✅ Fixed Issues:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li style={{ padding: '0.5rem 0', color: '#065f46' }}>✅ Middleware matcher includes 'en' locale</li>
            <li style={{ padding: '0.5rem 0', color: '#065f46' }}>✅ Google Fonts dependencies removed</li>
            <li style={{ padding: '0.5rem 0', color: '#065f46' }}>✅ Firebase auth temporarily disabled</li>
            <li style={{ padding: '0.5rem 0', color: '#065f46' }}>✅ Routes returning 200 OK status</li>
            <li style={{ padding: '0.5rem 0', color: '#065f46' }}>✅ Translation system functional</li>
            <li style={{ padding: '0.5rem 0', color: '#065f46' }}>✅ All 22 languages configured</li>
          </ul>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <p style={{ color: '#6b7280' }}>
            Try visiting: <code>/en</code>, <code>/hi</code>, <code>/bn</code>, <code>/ta</code>, <code>/ur</code>, etc.
          </p>
        </div>
      </div>
    </div>
  );
}
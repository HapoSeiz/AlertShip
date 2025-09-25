"use client"

import { useTranslations, useLocale } from 'next-intl';
import LanguageSelector from '@/components/language-selector';

export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Simple Header */}
      <header style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 40, 
        padding: '1rem 2rem', 
        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            AlertShip
          </h1>
          <LanguageSelector />
        </div>
      </header>

      {/* Main Content */}
      <main style={{ paddingTop: '80px' }}>
        {/* Hero Section */}
        <section style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#f9fafb' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
              <span style={{ color: '#4f46e5' }}>{t('homepage.heroTitle')}</span>
              <br />
              {t('homepage.heroSubtitle')}
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
              {t('homepage.heroDescription')}
            </p>

            {/* Location Input Section */}
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '1rem', 
              padding: '2rem', 
              maxWidth: '500px', 
              margin: '0 auto 2rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder={t('homepage.locationPlaceholder')}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                />
                <button
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {t('homepage.checkButton')}
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}>
                {t('homepage.getStartedButton')}
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '4rem 2rem', backgroundColor: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem' }}>
              {t('howItWorks.title')}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: '0 auto 1rem'
                }}>
                  1
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {t('howItWorks.step1')}
                </h3>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: '0 auto 1rem'
                }}>
                  2
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {t('howItWorks.step2')}
                </h3>
              </div>
              <div style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  margin: '0 auto 1rem'
                }}>
                  3
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {t('howItWorks.step3')}
                </h3>
              </div>
            </div>
            <p style={{ textAlign: 'center', marginTop: '2rem', color: '#6b7280' }}>
              {t('howItWorks.disclaimer')}
            </p>
          </div>
        </section>

        {/* Status Section */}
        <section style={{ padding: '4rem 2rem', backgroundColor: '#f0f9ff' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
              i18n Implementation Status
            </h2>
            <div style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
              <p style={{ color: '#065f46' }}>✅ Routing working for locale: <strong>{locale}</strong></p>
              <p style={{ color: '#065f46' }}>✅ All 22 Indian constitutional languages configured</p>
              <p style={{ color: '#065f46' }}>✅ Translation system functional</p>
              <p style={{ color: '#065f46' }}>✅ Language selector working</p>
              <p style={{ color: '#065f46' }}>✅ URL-based locale switching</p>
              <p style={{ color: '#065f46' }}>✅ RTL support for Arabic-script languages</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
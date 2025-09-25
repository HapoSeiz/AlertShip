"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales } from "@/i18n/request";
import { Button } from "@/components/ui/button";
import { ChevronDown, Globe } from "lucide-react";

const languageNames = {
  en: "English",
  hi: "हिंदी",
  bn: "বাংলা",
  te: "తెలుగు",
  mr: "मराठी",
  ta: "தமிழ்",
  ur: "اردو",
  gu: "ગુજરાતી",
  kn: "ಕನ್ನಡ",
  ml: "മലയാളം",
  or: "ଓଡିଆ",
  pa: "ਪੰਜਾਬੀ",
  as: "অসমীয়া",
  mai: "मैथिली",
  sa: "संस्कृतम्",
  sat: "Santali",
  ks: "کٲشُر",
  ne: "नेपाली",
  sd: "سنڌي",
  gom: "कोंकणी",
  mni: "Manipuri",
  doi: "डोगरी",
  brx: "बर'",
};

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('language');

  const handleLanguageChange = (newLocale: string) => {
    setIsOpen(false);
    
    // Get the current pathname without the locale
    const pathnameWithoutLocale = pathname.startsWith(`/${locale}`) 
      ? pathname.slice(locale.length + 1) 
      : pathname;

    // Navigate to the same page with the new locale
    const newPath = `/${newLocale}${pathnameWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[#1F2937] hover:bg-gray-100"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{languageNames[locale as keyof typeof languageNames]}</span>
        <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 px-2 py-1 mb-1">
                {t('selector')}
              </div>
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLanguageChange(loc)}
                  className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                    locale === loc ? 'bg-[#4F46E5] text-white hover:bg-[#4F46E5]/90' : 'text-[#1F2937]'
                  }`}
                >
                  <div className="font-medium">
                    {languageNames[loc as keyof typeof languageNames]}
                  </div>
                  {locale === loc && (
                    <div className="text-xs text-white/80 mt-1">
                      {t('current')}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
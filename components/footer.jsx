"use client"

import { useRouter } from "next/navigation"

export default function Footer({ showQuestionsSection = false, onNavigate }) {
  const router = useRouter()

  const footerLinks = {
    company: [
      {
        name: "About",
        href: "#",
        onClick: () => {
          router.push("/about")
        },
      },
      {
        name: "Founders",
        href: "#team",
        onClick: () => {
          router.push("/about")
        },
      },
    ],
    support: [
      {
        name: "FAQs",
        href: "#",
        onClick: () => {
          router.push("/faqs")
        },
      },
      {
        name: "Contact",
        href: "#",
        onClick: () => {
          router.push("/contact")
        },
      },
    ],
    products: [
      { name: "Outage Tracking", href: "#" },
      { name: "AI Outage Trend", href: "#" },
      { name: "Outage Alerts", href: "#" },
    ],
  }

  const handleLinkClick = (e, link) => {
    e.preventDefault()
    if (link.onClick) {
      link.onClick()
    }
  }

  return (
    <section className="bg-[#F59E0B]">
      {/* Questions Section - Only show if requested */}
      {showQuestionsSection && (
        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-6 sm:mb-8">
              Got Questions?
              <br />
              We've got you
              <br />
              covered!
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-[#1F2937] max-w-2xl mb-8">
              If your question isn't answered here, shoot us an email at{" "}
              <span className="font-semibold">support@alertship.com</span>
            </p>

            {/* FAQ Items */}
            <div className="space-y-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-xl font-bold text-[#1F2937] mb-3">How do I report an outage?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Simply click "Report Outage" in the navigation menu. You'll need to log in first, then fill out the
                  form with details about the outage type, location, and severity.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-xl font-bold text-[#1F2937] mb-3">Is AlertShip free to use?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Yes! AlertShip is completely free for all users. You can report outages, receive notifications, and
                  access all features without any cost.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-xl font-bold text-[#1F2937] mb-3">How do I get notified about outages?</h3>
                <p className="text-gray-600 leading-relaxed">
                  After creating an account, you can subscribe to alerts for your location. We'll send notifications via
                  browser, email, or WhatsApp about outages and scheduled maintenance.
                </p>
              </div>
            </div>

            {/* View More Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  router.push("/faqs")
                }}
                className="bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors"
              >
                View More FAQs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className={`bg-[#374151] ${showQuestionsSection ? "rounded-t-[2rem] sm:rounded-t-[3rem]" : ""} px-4 sm:px-6 lg:px-8 py-8 sm:py-12`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Logo and Description */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <img src="/images/alertship-logo.png" alt="AlertShip" className="h-12 sm:h-16 brightness-0 invert" />
              </div>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xs">
                Keeping communities informed about utility outages in real-time.
              </p>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link)}
                      className="text-gray-300 hover:text-white transition-colors text-sm cursor-pointer"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => handleLinkClick(e, link)}
                      className="text-gray-300 hover:text-white transition-colors text-sm cursor-pointer"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products Links */}
            <div>
              <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Products</h3>
              <ul className="space-y-2 sm:space-y-3">
                {footerLinks.products.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

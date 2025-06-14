"use client"

import { MapPin } from "lucide-react"

const footerLinks = {
  company: [
    { name: "About", href: "#" },
    { name: "Founders", href: "#" },
    { name: "Privacy", href: "#" },
  ],
  support: [
    { name: "FAQs", href: "#" },
    { name: "Help Center", href: "#" },
    { name: "Contact", href: "#" },
  ],
  products: [
    { name: "Outage Tracking", href: "#" },
    { name: "AI Outage Trend", href: "#" },
    { name: "Outage Alerts", href: "#" },
  ],
}

export default function Footer() {
  return (
    <section className="bg-[#F59E0B]">
      {/* Questions Section */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-6 sm:mb-8">
            Got Questions?
            <br />
            We've got you
            <br />
            covered!
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-[#1F2937] max-w-2xl">
            If your question isn't answered here, shoot us an email at{" "}
            <span className="font-semibold">info@alertship.com</span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#374151] rounded-t-[2rem] sm:rounded-t-[3rem] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Logo and Description */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#4F46E5] rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-white">AlertShip</span>
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
                    <a href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
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
                    <a href={link.href} className="text-gray-300 hover:text-white transition-colors text-sm">
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

"use client"

import { Button } from "@/components/ui/button"
import Footer from "@/components/footer"
import Header from "@/components/header"
import { AuthModals } from "@/components/auth-modals"
import { Nunito } from "next/font/google"
import { useRouter } from "next/navigation"
import { useAuthModals } from "@/hooks/useAuthModals"

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

export default function FaqPage() {
  const router = useRouter()

  const {
    isSignUpOpen, isLogInOpen, isLoggedIn,
    openSignUp, openLogIn, closeSignUp, closeLogIn,
    switchToLogIn, switchToSignUp, handleLogin, handleLogout
  } = useAuthModals()

  // Navigation handler for hyperlinks
  const handleNavigate = (page) => {
    if (page === "home") router.push("/")
    else if (page === "about") router.push("/about")
    else if (page === "contact") router.push("/contact")
    else if (page === "faqs") router.push("/faqs")
    else if (page === "dashboard") router.push("/dashboard")
    else if (page === "report") router.push("/report")
    else router.push("/")
  }

  return (
    <div className={`min-h-screen bg-[#F9FAFB] ${nunito.className}`}>
      {/* Header */}
      <Header
        currentPage="faqs"
        isLoggedIn={isLoggedIn}
        onLoginOpen={openLogIn}
        onSignUpOpen={openSignUp}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      <main className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-6 ${nunito.className}`}>Frequently Asked <span className="text-[#4F46E5]">Questions</span></h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about AlertShip and how to stay informed about utility outages.
            </p>
          </div>
          {/* FAQ Items */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-[#1F2937] mb-4">How do I report an outage?</h3>
              <p className="text-gray-600 leading-relaxed">
                To report an outage, simply click the &quot;Report Outage&quot; button in the navigation menu or on the homepage. You&apos;ll need to create an account or log in first. Then fill out the form with details about the outage including the type (electricity or water), location, and description.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-[#1F2937] mb-4">How do I get notified about outages in my area?</h3>
              <p className="text-gray-600 leading-relaxed">
                After creating an account, you can subscribe to alerts for your specific location. We&apos;ll send you notifications via browser notifications, email, or WhatsApp about both current outages and scheduled maintenance in your area.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-[#1F2937] mb-4">Is AlertShip free to use?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! AlertShip is completely free for all users. You can report outages, receive notifications, and access all features without any cost. We believe that access to utility information should be available to everyone in the community.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-[#1F2937] mb-4">How accurate is the outage information?</h3>
              <p className="text-gray-600 leading-relaxed">
                We combine official reports from utility companies with community-sourced information. Official reports are marked with a green &quot;Official&quot; badge, while community reports are marked as &quot;Crowdsourced&quot;. Our system cross-references multiple reports to ensure accuracy.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-[#1F2937] mb-4">Can I see scheduled maintenance and planned outages?</h3>
              <p className="text-gray-600 leading-relaxed">
                Yes! Click on &quot;Upcoming Outages&quot; to view a calendar of scheduled maintenance and planned outages. This helps you prepare in advance for any disruptions to your electricity or water service.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-[#1F2937] mb-4">What areas does AlertShip cover?</h3>
              <p className="text-gray-600 leading-relaxed">
                AlertShip currently covers over 200 cities and is expanding rapidly. Simply enter your location on the homepage to check if your area is covered. If not, you can still report outages to help us expand our coverage to your community.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-[#1F2937] mb-4">How do I update my notification preferences?</h3>
              <p className="text-gray-600 leading-relaxed">
                After logging in, go to your Dashboard and click on &quot;Settings&quot;. There you can choose how you want to receive notifications (browser, email, WhatsApp), set your preferred locations, and customize the types of alerts you want to receive.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <h3 className="text-xl font-bold text-[#1F2937] mb-4">What should I do during an extended outage?</h3>
              <p className="text-gray-600 leading-relaxed">
                During extended outages, stay updated through AlertShip for restoration estimates. Keep flashlights and batteries handy, avoid opening refrigerators unnecessarily, and check on elderly neighbors. For water outages, store clean water and avoid using electrical appliances when power returns until you&apos;re sure the supply is stable.
              </p>
            </div>
          </div>
          {/* Contact CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-[#4F46E5] to-[#F59E0B] rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-white/90 mb-6">Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.</p>
            <Button onClick={() => window.location.href = '/contact'} className="bg-white text-[#4F46E5] hover:bg-gray-100 px-8 py-3 text-lg font-semibold">Contact Support</Button>
          </div>
        </div>
      </main>
      <Footer onNavigate={() => {}} />
      <AuthModals
        isSignUpOpen={isSignUpOpen}
        isLogInOpen={isLogInOpen}
        onCloseSignUp={closeSignUp}
        onCloseLogIn={closeLogIn}
        onSwitchToLogIn={switchToLogIn}
        onSwitchToSignUp={switchToSignUp}
        onLogin={handleLogin}
      />
    </div>
  )
} 
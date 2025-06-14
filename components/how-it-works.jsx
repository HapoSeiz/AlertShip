"use client"

import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "1",
    title: "Enter your location.",
  },
  {
    number: "2",
    title: "View Outage Map",
  },
  {
    number: "3",
    title: "Submit Report*",
  },
]

export default function HowItWorks() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#1F2937] mb-3 sm:mb-4">
          How It Works
        </h2>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl lg:text-2xl text-[#1F2937] mb-12 sm:mb-16">No Sign Up Required. 100% Free.</p>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-12 mb-12 sm:mb-16">
          {steps.map((step, index) => (
            <div key={step.number} className="flex flex-col items-center">
              {/* Gradient Circle */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-b from-[#A78BFA] to-[#4F46E5] flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">{step.number}</span>
              </div>

              {/* Step Title */}
              <h3 className="text-base sm:text-lg lg:text-xl font-medium text-[#1F2937] px-2">{step.title}</h3>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex flex-col items-center">
          <Button className="bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 h-auto rounded-xl sm:rounded-2xl font-semibold mb-3 sm:mb-4">
            Check Now!
          </Button>

          {/* Disclaimer */}
          <p className="text-xs sm:text-sm text-[#1F2937]/70 px-4">*Sign-in required for report submission.</p>
        </div>
      </div>
    </section>
  )
}

import { useState } from "react";
import {
  FiSearch,
  FiCalendar,
  FiBell,
  FiChevronDown,
  FiCoffee,
  FiCheckCircle,
  FiPhone,
  FiMail
} from "react-icons/fi";

// FAQ data
const faqs = [
  {
    id: 1,
    question: "How do I make a reservation on DineNow?",
    answer:
      "Search for a restaurant by name, cuisine, or location. Select your preferred date, time, and party size, then confirm your booking. You'll receive instant confirmation.",
    category: "Booking"
  },
  {
    id: 4,
    question: "Can I pre-order food with my reservation?",
    answer:
      "Yes. While booking, you can browse the restaurant's menu by category and add the dishes you want — they'll be ready for your table when you arrive.",
    category: "Booking"
  },
  {
    id: 5,
    question: "Why is my reservation showing as \"Pending\"?",
    answer:
      "New bookings are reviewed by the restaurant before they're confirmed. You'll get a notification and your reservation will move to \"Confirmed\" as soon as they approve it.",
    category: "Booking"
  },
  {
    id: 6,
    question: "How do I check in when I arrive at the restaurant?",
    answer:
      "Your confirmation includes a QR code. Show it to the host at the restaurant and they'll scan it to check you in — no need to give your name or search for your booking.",
    category: "Booking"
  },
  {
    id: 7,
    question: "Will I be notified if my reservation status changes?",
    answer:
      "Yes. You'll get an instant notification the moment a restaurant approves, rejects, or updates your reservation, so you're never left wondering.",
    category: "Account"
  },
  {
    id: 8,
    question: "How can I leave a review after my reservation?",
    answer:
      "Once your reservation is marked complete, you can rate it and leave a comment from My Reservations. Your review appears publicly on the restaurant's page.",
    category: "Reviews"
  }
];

// Features
const features = [
  {
    id: 1,
    icon: <FiSearch className="w-5 h-5" />,
    title: "Find a table",
    description: "Search by cuisine, neighborhood, or restaurant name"
  },
  {
    id: 2,
    icon: <FiCalendar className="w-5 h-5" />,
    title: "Book instantly",
    description: "See real-time availability and book in seconds"
  },
  {
    id: 3,
    icon: <FiCoffee className="w-5 h-5" />,
    title: "Reserve food",
    description: "Pre-order and reserve your favorite dishes"
  },
  {
    id: 4,
    icon: <FiBell className="w-5 h-5" />,
    title: "Get reminders",
    description: "Timely alerts so you never miss a reservation"
  }
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...new Set(faqs.map((faq) => faq.category))];

  const filteredFaqs = faqs.filter((faq) => {
    return selectedCategory === "All" || faq.category === selectedCategory;
  });

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* FAQ Section */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-[#6B8A62] text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:border-gray-300 transition-colors"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                    <FiChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        openId === faq.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openId === faq.id && (
                    <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact Support */}
            <div className="mt-10 bg-gradient-to-r from-[#6B8A62]/10 to-[#6B8A62]/20 rounded-xl p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">
                Still have questions?
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                We're here to help you 24/7
              </p>
              <div className="flex gap-3 justify-center">
                <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:shadow-md transition">
                  <FiPhone className="w-4 h-4" />
                  Call Support
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#6B8A62] text-white rounded-lg hover:bg-[#5A7352] transition">
                  <FiMail className="w-4 h-4" />
                  Email Us
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-80">
            {/* Features Section */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                DineNow Features
              </h3>
              <div className="space-y-4">
                {features.map((feature) => (
                  <div key={feature.id} className="flex items-start gap-3">
                    <div className="text-[#6B8A62] mt-0.5">{feature.icon}</div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {feature.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-[#6B8A62] rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <FiCheckCircle className="w-5 h-5" />
                <h3 className="font-semibold">Pro Tips</h3>
              </div>
              <div className="space-y-3 text-sm">
                <p>• Book popular restaurants 2-3 weeks in advance</p>
                <p>• Enable notifications to know the moment you're confirmed</p>
                <p>• Leave a review to help other diners decide</p>
                <p>• Download our app for faster booking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
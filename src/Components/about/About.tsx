import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';
import {
  HiStar, HiLightBulb,
  HiOutlineRocketLaunch, HiShieldExclamation, HiBellAlert,
  HiClock, HiHeart, HiGlobeAmericas , HiCheckBadge
} from 'react-icons/hi2';
import { FaQuoteLeft, FaAward } from 'react-icons/fa';

export default function About() {
  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#6B8A62] to-[#5A7352] text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/75 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-sm font-medium">Est. 2026</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Our Story
          </h1>
          <p className="text-xl text-white max-w-3xl mx-auto">
            Making reservations effortless, one table at a time.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Mission & Vision - Side by Side with better design */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {/* Mission Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6B8A62] to-[#5A7352] opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#6B8A62] rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-8 text-center">
              <div className="w-20 h-20 bg-[#6B8A62]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <HiOutlineRocketLaunch className="w-10 h-10 text-[#6B8A62]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To connect diners with unforgettable dining experiences while empowering 
                restaurants with smart tools to thrive in the digital age.
              </p>
            </div>
          </div>

          {/* Vision Card */}
          <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6B8A62] to-[#5A7352] opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#6B8A62] rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative p-8 text-center">
              <div className="w-20 h-20 bg-[#6B8A62]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <HiGlobeAmericas className="w-10 h-10 text-[#6B8A62]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To become Egypt's most trusted dining platform, helping millions discover 
                and book the perfect table every time.
              </p>
            </div>
          </div>
        </div>

        {/* Story Section - Better layout */}
        <div className="mb-20">
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-10">
              <div className="bg-[#6B8A62]/10 rounded-full p-3">
                <FaQuoteLeft className="w-8 h-8 text-[#6B8A62]" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-[#6B8A62]/20 text-center">
              <div className='max-w-4xl mx-auto'>
                <p className="text-gray-700 text-lg leading-relaxed mb-6 ">
                <span className="text-[#6B8A62] font-bold text-2xl mr-2">“</span>
                DineNow was born in 2026 with a simple idea: Booking a restaurant table 
                should be as easy as ordering a ride. We saw frustrated diners making 
                endless phone calls and restaurants dealing with empty tables due to 
                inefficient booking systems.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                So we built a platform that connects hungry diners with amazing 
                restaurants — instantly, reliably, and completely free for diners.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Today, DineNow is helping thousands of food lovers discover their next 
                favorite table while helping restaurants fill seats and reduce no-shows.
                <span className="text-[#6B8A62] font-bold text-2xl ml-2">”</span>
              </p>
              </div>
            </div>
          </div>
        </div>

        {/* What Makes Us Different - Better cards */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Makes <span className="text-[#6B8A62]">Us Different</span>
            </h2>
            <div className="w-24 h-1 bg-[#6B8A62] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: HiClock, title: "Real-Time Booking", desc: "See live availability and book instantly — no waiting for confirmation" },
              { icon: HiBellAlert, title: "Live Status Updates", desc: "Get notified instantly the moment your reservation is approved, updated, or ready" },
              { icon: HiShieldExclamation, title: "No-Show Protection", desc: "Automated reminders help restaurants reduce last-minute cancellations" }
            ].map((item, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6B8A62] to-[#5A7352] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                <div className="p-8 text-center">
                  <div className={`w-16 h-16 bg-[#6B8A62]/10 rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 group-hover:bg-[#6B8A62]/20`}>
                    <item.icon className="w-8 h-8 text-[#6B8A62] group-hover:text-[#5A7352] transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Values - Better grid */}
        <div className="mb-20">
  <div className="text-center mb-12">
    <h2 className="text-4xl font-bold text-gray-900 mb-4">
      Our <span className="text-[#6B8A62]">Core Values</span>
    </h2>
    <div className="w-24 h-1 bg-[#6B8A62] mx-auto rounded-full"></div>
  </div>
  
  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
    {[
      { icon: HiCheckBadge, title: "Trust & Transparency" },
      { icon: HiStar, title: "Customer First" },
      { icon: HiLightBulb, title: "Innovation" },
      { icon: HiHeart, title: "Support Local" }
    ].map((value, index) => (
      <div key={index} className="text-center p-6 bg-white border border-gray-200 rounded-2xl transition-all duration-300 group hover:shadow-lg hover:-translate-y-1 cursor-pointer">
        <div className="w-14 h-14 bg-[#6B8A62]/10 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:bg-[#6B8A62] group-hover:scale-110">
          <value.icon className="w-7 h-7 text-[#6B8A62] transition-all duration-300 group-hover:text-white" />
        </div>
        <h3 className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-[#6B8A62]">{value.title}</h3>
      </div>
    ))}
  </div>
</div>

        {/* Restaurant Owner CTA - Better design */}
        <div className="mb-20">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#6B8A62] rounded-full blur-3xl"></div>
            </div>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6B8A62] rounded-full blur-3xl"></div>
            </div>
            <div className="relative px-8 py-12 md:p-12 text-center">
              <div className="inline-flex items-center gap-2 bg-[#6B8A62]/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <FaAward className="w-4 h-4 text-[#B4C3AE]" />
                <span className="text-sm text-[#B4C3AE] font-medium">Join the family</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Are you an Owner?
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-3xl mx-auto">
                Join our growing network of partner restaurants. Attract new customers, 
                fill empty tables, and streamline your reservation management.
              </p>
              <Link to="/partner">
                <Button className="bg-gradient-to-r from-[#6B8A62] to-[#5A7352] hover:from-[#5A7352] hover:to-[#4A5C42] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg m-auto">
                  Contact Us →
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center py-12">
          <div className="inline-flex items-center bg-red-500/10 rounded-full px-4 py-2 ">
            <HiHeart className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 py-3">
            Ready to find your next <span className="text-[#6B8A62] font-bold">Fav</span> spot?
          </h3>
          
          <Link to="/spots">
            <Button className="bg-gradient-to-r from-[#6B8A62] to-[#5A7352] hover:from-[#5A7352] hover:to-[#4A5C42] text-white rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl m-auto">
              Explore →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
import { FaFacebookF, FaTwitter, FaInstagram, FaEnvelope, FaClock } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-12">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#6B8A62]">DineNow</h3>
            <p className="text-gray-300 leading-relaxed">
              Your trusted partner for restaurant reservations. Discover the best dining experiences in your city with just a few clicks.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="bg-[#6B8A62] hover:bg-[#5A7352] w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                <FaFacebookF className="text-white" />
              </a>
              <a href="#" className="bg-[#6B8A62] hover:bg-[#5A7352] w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                <FaTwitter className="text-white" />
              </a>
              <a href="#" className="bg-[#6B8A62] hover:bg-[#5A7352] w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                <FaInstagram className="text-white" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#6B8A62]">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="components" className="text-gray-300 hover:text-[#6B8A62] transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#6B8A62] transition-colors">How It Works</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#6B8A62] transition-colors">Partner Restaurants</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#6B8A62] transition-colors">Customer Reviews</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#6B8A62] transition-colors">Mobile App</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#6B8A62] transition-colors">Gift Cards</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#6B8A62]">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-[#6B8A62] transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#6B8A62] transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#6B8A62] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#6B8A62] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#6B8A62] transition-colors">Cancellation Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#6B8A62] transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[#6B8A62]">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <FaEnvelope className="text-[#6B8A62]" />
                <span className="text-gray-300">support@dinenow.com</span>
              </div>
              <div className="flex items-center gap-3">
                <FaClock className="text-[#6B8A62]" />
                <span className="text-gray-300">24/7 Customer Support</span>
              </div>
            </div>
            
            {/* Newsletter Signup */}
            <div className="mt-4">
              <h5 className="text-sm font-semibold text-[#6B8A62] mb-2">Newsletter</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-800 text-white border border-gray-700 rounded-l-lg focus:outline-none focus:border-[#6B8A62]"
                />
                <button className="bg-[#6B8A62] hover:bg-[#5A7352] px-4 py-2 rounded-r-lg transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © {currentYear} DineNow. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-400 text-sm">Payment Methods:</span>
              <div className="flex space-x-2">
                <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-800">V</span>
                </div>
                <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600">M</span>
                </div>
                <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-600">P</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

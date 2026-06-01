import herobg from '../../assets/herobg.jpg';

export default function Hero() {

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
        style={{ 
          backgroundImage: `url('${herobg}')`,
          backgroundAttachment: 'fixed'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/40" />
      {/* <div className="absolute inset-0 bg-gradient-to-tr from-[#6B8A62]/10 via-transparent to-[#6B8A62]/10" /> */}

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6B8A62]/75 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6B8A62]"></span>
            </span>
            <span className="text-sm items-up font-medium text-white">100+ Restaurants to Explore</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
            Book Your Table & 
            <span className="block text-[#89A181]">Order Food Online</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-lg md:text-lg text-gray-200 mb-10 max-w-3xl mx-auto">
            Reserve, relax, and relish — Tanta’s best dining experience at your fingertips.
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-white/10">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#B4C3AE]">70+</div>
              <div className="text-sm text-gray-300 mt-1">Restaurants</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#B4C3AE]">20+</div>
              <div className="text-sm text-gray-300 mt-1">Cuisines</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#B4C3AE]">10k+</div>
              <div className="text-sm text-gray-300 mt-1">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#B4C3AE]">24/7</div>
              <div className="text-sm text-gray-300 mt-1">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-scroll" />
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(15px); opacity: 0; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 3.5s ease-in-out infinite;
        }
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
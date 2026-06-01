export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl p-8 flex flex-col items-center gap-4">
        {/* Custom SVG Spinner */}
        <div className="relative w-16 h-16">
          <svg 
            className="animate-spin text-[#6B8A62]" 
            width="64" 
            height="64" 
            viewBox="0 0 24 24" 
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

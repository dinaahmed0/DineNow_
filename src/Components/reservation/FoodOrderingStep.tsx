import { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaHeart, FaRegHeart, FaUtensils } from 'react-icons/fa';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  rating?: number;
  isPopular?: boolean;
  allergens?: string[];
  image?: string;
  quantity?: number;
}

interface FoodOrderingStepProps {
  onFoodOrderUpdate: (foodItems: MenuItem[]) => void;
  partySize: number;
}

const mockMenu: MenuItem[] = [
  {
    id: 1,
    name: "Margherita Pizza",
    description: "Fresh mozzarella, tomato sauce, basil, extra virgin olive oil",
    price: 18.99,
    category: "Appetizers",
    rating: 4.8,
    isPopular: true,
    allergens: ["Gluten", "Dairy"],
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    name: "Bruschetta",
    description: "Toasted bread with tomatoes, garlic, basil, and olive oil",
    price: 12.99,
    category: "Appetizers",
    rating: 4.6,
    allergens: ["Gluten"],
    image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    name: "Caesar Salad",
    description: "Romaine lettuce, parmesan, croutons, Caesar dressing",
    price: 14.99,
    category: "Salads",
    rating: 4.5,
    allergens: ["Dairy", "Gluten"],
    image: "https://images.unsplash.com/photo-1540420773420-3366772bd47a?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    name: "Spaghetti Carbonara",
    description: "Pasta with eggs, pecorino cheese, guanciale, black pepper",
    price: 22.99,
    category: "Main Courses",
    rating: 4.9,
    isPopular: true,
    allergens: ["Gluten", "Dairy", "Eggs"],
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop"
  },
  {
    id: 5,
    name: "Grilled Salmon",
    description: "Atlantic salmon with lemon butter sauce, seasonal vegetables",
    price: 28.99,
    category: "Main Courses",
    rating: 4.7,
    allergens: ["Fish"],
    image: "https://images.unsplash.com/photo-1467003909585-2cd8f13a1b33?w=400&h=300&fit=crop"
  },
  {
    id: 6,
    name: "Tiramisu",
    description: "Coffee-soaked ladyfingers, mascarpone, cocoa powder",
    price: 8.99,
    category: "Desserts",
    rating: 4.8,
    isPopular: true,
    allergens: ["Dairy", "Eggs", "Gluten"],
    image: "https://images.unsplash.com/photo-1571877221720-1eb93fc6a85e?w=400&h=300&fit=crop"
  },
  {
    id: 7,
    name: "Panna Cotta",
    description: "Vanilla bean panna cotta with mixed berry compote",
    price: 7.99,
    category: "Desserts",
    rating: 4.6,
    allergens: ["Dairy"],
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop"
  },
  {
    id: 8,
    name: "House Wine",
    description: "Selection of red and white wines by the glass",
    price: 6.99,
    category: "Beverages",
    rating: 4.4,
    allergens: ["Sulfites"],
    image: "https://images.unsplash.com/photo-1510812431404-8a61cbe444c1?w=400&h=300&fit=crop"
  }
];

const categories = ["All", "Appetizers", "Salads", "Main Courses", "Desserts", "Beverages"];

export default function FoodOrderingStep({ onFoodOrderUpdate, partySize }: FoodOrderingStepProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [favorites, setFavorites] = useState<{ [key: number]: boolean }>({});

  const filteredMenu = selectedCategory === "All" 
    ? mockMenu 
    : mockMenu.filter(item => item.category === selectedCategory);

  const updateQuantity = (itemId: number, delta: number) => {
    setQuantities(prev => {
      const newQuantities = { ...prev };
      const currentQty = newQuantities[itemId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      
      if (newQty === 0) {
        delete newQuantities[itemId];
      } else {
        newQuantities[itemId] = newQty;
      }
      
      return newQuantities;
    });
  };

  const toggleFavorite = (itemId: number) => {
    setFavorites(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const calculateTotal = () => {
    return Object.entries(quantities).reduce((total, [itemId, qty]) => {
      const item = mockMenu.find(m => m.id === parseInt(itemId));
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getOrderedItems = () => {
    return Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]) => {
        const item = mockMenu.find(m => m.id === parseInt(itemId));
        return item ? { ...item, quantity: qty } : null;
      })
      .filter(Boolean) as MenuItem[];
  };

  // Update parent component when quantities change
  useEffect(() => {
    const orderedItems = getOrderedItems();
    onFoodOrderUpdate(orderedItems);
  }, [quantities, onFoodOrderUpdate]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Would you like to<span className='text-[#6B8A62]'> Pre-order</span> Your Food?</h1>
        <p className="text-sm text-gray-600">If not please continue to the next page</p>
        <p className="text-[#6B8A62] mt-4">Planning for {partySize} guest{partySize > 1 ? 's' : ''}</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category
                ? 'bg-[#6B8A62] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid gap-4">
        {filteredMenu.map(item => {
          const quantity = quantities[item.id] || 0;
          const isFavorite = favorites[item.id];
          
          return (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {/* Item Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <FaUtensils className="text-gray-400 text-2xl" />
                    </div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        {item.isPopular && (
                          <span className="bg-[#6B8A62]/10 text-[#6B8A62] text-xs px-2 py-1 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    </div>
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className="ml-2 p-2 rounded-full hover:bg-gray-100 transition"
                    >
                      {isFavorite ? (
                        <FaHeart className="text-red-500" />
                      ) : (
                        <FaRegHeart className="text-gray-400" />
                      )}
                    </button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        disabled={quantity === 0}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                          quantity === 0
                            ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            : 'bg-[#6B8A62] text-white hover:bg-[#5A7352]'
                        }`}
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <span className="w-8 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 rounded-full bg-[#6B8A62] text-white hover:bg-[#5A7352] flex items-center justify-center transition"
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                    {quantity > 0 && (
                      <span className="text-sm font-medium text-[#6B8A62] ml-auto">
                        ${(item.price * quantity).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Summary */}
      {getTotalItems() > 0 && (
        <div className="bg-[#6B8A62]/10 rounded-lg p-6 border border-[#6B8A62]/20">
          <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4">
            {getOrderedItems().map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-medium">${(item.price * (item.quantity || 0)).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#6B8A62]/20 pt-3">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span className="text-[#6B8A62]">${calculateTotal().toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              + 10% service charge will be added at the restaurant
            </p>
            <p className="text-xs text-[#6B8A62] mt-2">
              50% deposit option available on next step
            </p>
          </div>
        </div>
      )}

      {/* No Items Selected Notice */}
      {getTotalItems() === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
          <p className="text-gray-600 mb-2">No items selected</p>
          <p className="text-sm text-gray-500">
            You can skip this step and order at the restaurant
          </p>
        </div>
      )}
    </div>
  );
}

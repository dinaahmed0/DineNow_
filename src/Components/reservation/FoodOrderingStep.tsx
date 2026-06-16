import { useState, useEffect } from 'react';
import { FaPlus, FaMinus, FaUtensils, FaSpinner } from 'react-icons/fa';
import { getCategories, getMenuItemsByCategory } from '../../services/menu';
import type { MenuItem } from '../../types/menu';

interface OrderedMenuItem extends MenuItem {
  quantity?: number;
}

interface FoodOrderingStepProps {
  onFoodOrderUpdate: (foodItems: OrderedMenuItem[]) => void;
  partySize: number;
  restaurantId: number;
}

export default function FoodOrderingStep({ onFoodOrderUpdate, partySize, restaurantId }: FoodOrderingStepProps) {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      setMenu([]);
      setCategoryNames(['All']);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const catResponse = await getCategories(restaurantId);
        if (!catResponse.succeeded) {
          throw new Error(catResponse.message || 'Failed to load menu');
        }
        const cats = catResponse.data ?? [];
        const itemLists = await Promise.all(cats.map((c) => getMenuItemsByCategory(c.id)));
        if (cancelled) return;
        const items = itemLists.flatMap((r) => (r.succeeded ? r.data ?? [] : []));
        setMenu(items);
        setCategoryNames(['All', ...cats.map((c) => c.name)]);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load menu');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const filteredMenu = selectedCategory === 'All'
    ? menu
    : menu.filter(item => item.categoryName === selectedCategory);

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

  const calculateTotal = () => {
    return Object.entries(quantities).reduce((total, [itemId, qty]) => {
      const item = menu.find(m => m.id === parseInt(itemId));
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getOrderedItems = (): OrderedMenuItem[] => {
    return Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, qty]): OrderedMenuItem | null => {
        const item = menu.find(m => m.id === parseInt(itemId));
        return item ? { ...item, quantity: qty } : null;
      })
      .filter((item): item is OrderedMenuItem => item !== null);
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

      {loading && (
        <div className="flex items-center justify-center py-12 text-[#6B8A62]">
          <FaSpinner className="animate-spin text-2xl" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 rounded-lg p-6 text-center border border-red-100">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && menu.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
          <p className="text-gray-600 mb-2">No menu available for this restaurant yet</p>
          <p className="text-sm text-gray-500">You can skip this step and order at the restaurant</p>
        </div>
      )}

      {!loading && !error && menu.length > 0 && (
        <>
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categoryNames.map(category => (
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

              return (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <FaUtensils className="text-gray-400 text-xl" />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}
                        </div>
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
        </>
      )}
    </div>
  );
}

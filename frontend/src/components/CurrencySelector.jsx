import { useCurrency } from "../contexts/CurrencyContext";
import { DollarSign } from "lucide-react";

const CurrencySelector = () => {
  const { currency, setCurrency, exchangeRates } = useCurrency();

  if (!exchangeRates) return null;

  return (
    <div className="flex items-center space-x-2">
      <DollarSign className="w-4 h-4 text-gray-400" />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
      >
        {Object.entries(exchangeRates).map(([code, data]) => (
          <option key={code} value={code}>
            {data.symbol} {code}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelector;

import { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return context;
};

const EXCHANGE_RATES = {
  INR: { symbol: "₹", rate: 1 },
  USD: { symbol: "$", rate: 0.012 },     
  EUR: { symbol: "€", rate: 0.011 },     
  GBP: { symbol: "£", rate: 0.0095 },    
  JPY: { symbol: "¥", rate: 1.79 },      
  AUD: { symbol: "A$", rate: 0.018 },    
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(
    localStorage.getItem("app-currency") || "INR"
  );

  useEffect(() => {
    localStorage.setItem("app-currency", currency);
  }, [currency]);

  const convertFromINR = (amountInINR = 0) => {
    const cleanAmount = Number(
      String(amountInINR).replace(/,/g, "")
    );

    if (isNaN(cleanAmount)) return 0;

    const converted = cleanAmount * EXCHANGE_RATES[currency].rate;
    
    return converted;
  };

  const formatAmount = (amountInINR = 0) => {
    const converted = convertFromINR(amountInINR);

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRates: EXCHANGE_RATES,
        currencySymbol: EXCHANGE_RATES[currency].symbol,
        formatAmount,
        convertFromINR, 
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
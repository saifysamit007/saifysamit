import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_CURRENCIES, CurrencyConfig } from '../data/portfolioData';

interface CurrencyContextType {
  currentCurrency: CurrencyConfig;
  setCurrencyCode: (code: string) => void;
  currencies: CurrencyConfig[];
}

const CurrencyContext = createContext<CurrencyContextType>({
  currentCurrency: SUPPORTED_CURRENCIES[0],
  setCurrencyCode: () => {},
  currencies: SUPPORTED_CURRENCIES,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currencyCode, setCurrencyCodeState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('saify_portfolio_currency');
      return saved || 'USD';
    } catch {
      return 'USD';
    }
  });

  const currentCurrency =
    SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode) || SUPPORTED_CURRENCIES[0];

  const setCurrencyCode = (code: string) => {
    setCurrencyCodeState(code);
    try {
      localStorage.setItem('saify_portfolio_currency', code);
    } catch {}
  };

  return (
    <CurrencyContext.Provider
      value={{
        currentCurrency,
        setCurrencyCode,
        currencies: SUPPORTED_CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

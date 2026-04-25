import type { CountryName, ExchangeRateResponse } from "@/types/stripe.types";
import { supportedCountries } from "@/types/stripe.types";
import { logger } from "./logger.util";

export const toCents = (amount: number) => amount * 100;

export const validateMinimumThreshold = (
  options: {
    amount: number;
    exchangeRate: number;
    country: CountryName;
    convertToCents?: boolean;
  },
  callback: (error: Error | null, amount: number) => void,
) => {
  const { amount, exchangeRate, country, convertToCents } = options;

  const rateToFiftyCentsEquivalent = Math.ceil(0.5 * Math.ceil(exchangeRate));
  const isMinimumThreshold = amount >= rateToFiftyCentsEquivalent;

  const error = new Error(`Minimum amount is ${rateToFiftyCentsEquivalent} ${supportedCountries[country]}`);

  callback(isMinimumThreshold ? null : error, convertToCents ? toCents(rateToFiftyCentsEquivalent) : rateToFiftyCentsEquivalent);
};

export const getExchangeRate = async (from: CountryName, to: CountryName) => {
  try {
    const url = `https://open.er-api.com/v6/latest/${supportedCountries[from]}`;
    const response = (await (await fetch(url)).json()) as ExchangeRateResponse;

    if (response.result === "success") {
      const rates = response.rates;
      return rates[supportedCountries[to]] as number;
    }

    throw new Error(response["error-type"]);
  } catch (error) {
    logger.error(error);
    return null;
  }
};

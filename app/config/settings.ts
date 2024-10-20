import { LOIRocketSettings } from "@/utils/types";

export const loiRocketSettings: LOIRocketSettings = {
  // see the type definition for details about each setting property

  traditionalAgentFeePercentage: 0.06,
  newAgentFeePercentage: 0.03,
  traditionalClosingCostsPercentage: 0.02,
  cashOfferHighPercentage: 0.7,
  cashOfferLowPercentage: 0.6,
  maxInterestRatePercentage: 0.07,
  maxEquityPercentage: 0.15,
  maxEntryFeePercentage: 0.15,
  maxEntryFeeAmount: 20000,
  maxStandardCashToSeller: 20000,
  cashToSellerFactor: 1.5,
  cashToSellerOption: "Standard",
  negativeTiers: [
    { min: -5000, value: 1500 },
    { min: -10000, value: 1000 },
    { min: Number.NEGATIVE_INFINITY, value: 500 },
  ],
  roundValues: true,
  roundingFactor: 500,
  medianHomeSoldPrice: 500000,
  medianHomeSoldPriceFactor: 1.5,
  minimumListingPrice: 10000,
  maximumListingPrice: 1500000,
  estimatedRentRatePercentage: 0.01,
  filteredContent: [], // Empty array by default
  averageAssignmentFee: 15000,
  expandResults: false,

  // TBD fields with suggested default values
  overMarketValuePercentage: 0.03, // Suggested 3% as a reasonable default
  pricePerSquareFeet: undefined, // Left undefined as it's market-dependent
  daysOnMarket: 90, // Suggested 90 days as a reasonable default
};

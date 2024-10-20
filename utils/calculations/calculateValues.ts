import {
  ListingFull,
  ListingCalculatedData,
  ListingRawData,
  TagType,
} from "@/utils/types";
import { loiRocketSettings } from "@/app/config/settings";
import { calculateEstimatedPropertyValue } from "@/utils/calculations/estimatedPropertyValue";
import { calculateEstimatedMortgageBalance } from "@/utils/calculations/estimatedMortgageBalance";
import { calculateEstimatedOtherDebtBalance } from "@/utils/calculations/estimatedOtherDebtBalance";
import { calculateNewCashToSeller } from "@/utils/calculations/newCashToSeller.ts";
import { calculateOfferPrice } from "@/utils/calculations/offerPrice";
import { determineAcquisitionStrategy } from "@/utils/calculations/acquisitionStrategy";

// Calculates the values for a single listing
export function calculateValues(listing: ListingRawData): ListingFull {
  const estimatedPropertyValue = Math.round(
    calculateEstimatedPropertyValue(listing)
  );

  const estimatedMortgageBalance: number =
    calculateEstimatedMortgageBalance(listing);

  const estimatedOtherDebtBalance: number =
    calculateEstimatedOtherDebtBalance(listing);

  const estimatedEquityAdjusted: number =
    estimatedPropertyValue -
    estimatedMortgageBalance -
    estimatedOtherDebtBalance;

  const estimatedEquityPercentAdjusted = parseFloat(
    (estimatedEquityAdjusted / estimatedPropertyValue).toFixed(2)
  );

  const estimatedAgentFee =
    listing.listingStatus === "Active"
      ? loiRocketSettings.traditionalAgentFeePercentage * estimatedPropertyValue
      : 0;

  const estimatedClosingCosts =
    loiRocketSettings.traditionalClosingCostsPercentage *
    estimatedPropertyValue;

  const estimatedCashToSeller =
    estimatedPropertyValue -
    estimatedMortgageBalance -
    estimatedOtherDebtBalance -
    estimatedAgentFee -
    estimatedClosingCosts;

  // New Cash to Seller Calculation
  const newCashToSeller = calculateNewCashToSeller(
    estimatedCashToSeller,
    loiRocketSettings
  );

  // Offer Price calculation
  /**
   * Calculates the Offer Price based on the provided logic.
   * @param estMortgageBalance - The estimated mortgage balance.
   * @param estOtherDebtBalance - The estimated other debt balance.
   * @param estEquityAdjusted - The estimated equity adjusted.
   * @param newCashToSeller - The new cash to seller.
   * @param estClosingCosts - The estimated closing costs.
   * @param estAgentFee - The estimated agent fee.
   * @param listingPrice - The listing price.
   * @returns The calculated Offer Price.
   */
  const offerPrice = calculateOfferPrice(
    estimatedMortgageBalance,
    estimatedOtherDebtBalance,
    estimatedEquityAdjusted,
    newCashToSeller,
    estimatedClosingCosts,
    estimatedAgentFee,
    listing.listingPrice || 0
  );

  // Offer to asking
  // calculates the percentage of offer price to the asking price/estimated property value
  const offerToAsking = parseFloat(
    (offerPrice / estimatedPropertyValue).toFixed(2)
  );

  // New agent fee calculation
  const newAgentFee = offerPrice * loiRocketSettings.newAgentFeePercentage;

  // Total Cost calculation
  const totalCost = offerPrice * newAgentFee;

  // Cash Offer High Calculation
  const cashOfferHigh = parseFloat(
    (
      Math.floor(
        (estimatedPropertyValue * loiRocketSettings.cashOfferHighPercentage) /
          500
      ) * 500
    ).toFixed(2)
  );

  // Cash Offer Low calculation
  const cashOfferLow = parseFloat(
    (
      Math.floor(
        (estimatedPropertyValue * loiRocketSettings.cashOfferLowPercentage) /
          500
      ) * 500
    ).toFixed(2)
  );

  // Entry Fee w/o CC
  // calculates the estimated entry fee before closing costs.
  // NOTE: This will need to be flexible for users that are pricing out Buy and Holds and Fix and Flips where rehab, holding, furnishings, and marketing costs may be included.
  // NOTE: In addition, if the rental rate and monthly expenses are known (or calculated) the assignment fee could be based on cash flow alone or  with depreciation, and appreciation over 10 years.
  const entryFeeWithoutClosingCosts =
    newCashToSeller +
    newAgentFee +
    estimatedOtherDebtBalance +
    loiRocketSettings.averageAssignmentFee;

  // Entry Fee w/o CC %
  const entryFeeWithoutClosingCostsPercentage = parseFloat(
    (entryFeeWithoutClosingCosts / offerPrice).toFixed(2)
  );

  // Entry Fee w/ CC
  // calculates the estimated entry fee with closing costs
  const entryFeeWithClosingCosts =
    newCashToSeller +
    newAgentFee +
    estimatedOtherDebtBalance +
    estimatedClosingCosts +
    loiRocketSettings.averageAssignmentFee;

  // Entry Fee w/ CC %
  const entryFeeWithClosingCostsPercentage = parseFloat(
    (entryFeeWithClosingCosts / offerPrice).toFixed(2)
  );

  // console.log(`address: ${listing.propAddress}`);

  // Acquisition Strategy
  const acquisitionStrategy = determineAcquisitionStrategy(
    estimatedCashToSeller,
    newCashToSeller,
    estimatedMortgageBalance + estimatedOtherDebtBalance
  );
  // console.log(`acquisitionStrategy: ${acquisitionStrategy}`);
  // console.log("-------------------------------");

  const calculatedValues: ListingCalculatedData = {
    "Est. Equity Adjusted": estimatedEquityAdjusted,
    "Est. Equity Percent Adjusted": estimatedEquityPercentAdjusted,
    "Est. Agent Fee": estimatedAgentFee,
    "New Agent Fee": newAgentFee,
    "Est. Closing Costs": estimatedClosingCosts,
    "Est. Cash To Seller": estimatedCashToSeller,
    "New Cash To Seller": newCashToSeller,
    "Offer Price": offerPrice,
    "Total Cost": totalCost,
    "Cash Offer - High": cashOfferHigh,
    "Cash Offer - Low": cashOfferLow,
    "Entry Fee w/o CC": entryFeeWithoutClosingCosts,
    "Entry Fee w/o CC %": entryFeeWithoutClosingCostsPercentage,
    "Entry Fee w/ CC": entryFeeWithClosingCosts,
    "Entry Fee w/ CC %": entryFeeWithClosingCostsPercentage,
    "Offer To Asking": offerToAsking,
    "Acquisition Strategy": acquisitionStrategy,
    Note: "",
  };

  const newTag: TagType = {
    color: "red",
    type: "basic",
    value: acquisitionStrategy,
  };

  const tags = listing.tags ? [...listing.tags, newTag] : [newTag];

  const listingFullData: ListingFull = {
    ...listing,
    ...calculatedValues,
    tags,
  };

  return listingFullData;
}

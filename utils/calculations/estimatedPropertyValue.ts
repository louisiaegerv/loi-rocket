import { ListingRawData } from "@/utils/types";

/**
 * Calculate the estimated property value based on a series of fallback calculations.
 *
 * @param listing - The raw listing data object
 * @returns The estimated property value
 */
export const calculateEstimatedPropertyValue = (
  listing: ListingRawData
): number => {
  // Get the current date
  const currentDate = new Date();

  // 1. Use Listing Price for those that are On-Market
  if (listing.listingStatus === "Active" && listing.listingPrice) {
    return listing.listingPrice;
  }

  // 2. Prop. Last Sale Amount x (1.03)^years since Prop. Last Sale Date
  if (listing.propLastSaleAmount && listing.propLastSaleDate) {
    const lastSaleDate = new Date(listing.propLastSaleDate);
    const yearsSinceLastSale =
      currentDate.getFullYear() - lastSaleDate.getFullYear();
    return listing.propLastSaleAmount * Math.pow(1.03, yearsSinceLastSale);
  }

  // 3. Use Prop. Est. Value
  if (listing.propEstValue) {
    return listing.propEstValue;
  }

  // 4. Calculate Prop. Est. Market Value = Prop. Est. Market Imprv. Value + Prop. Est. Market Land Value
  if (listing.propEstMarketImprvValue || listing.propEstMarketLandValue) {
    const marketValue =
      (listing.propEstMarketImprvValue || 0) +
      (listing.propEstMarketLandValue || 0);
    if (marketValue > 0) {
      return marketValue;
    }
  }

  // 5. Calculate Prop. Assessed Total Value = Prop. Assessed Imprv. Value + Prop. Assessed Land Value
  if (listing.propAssessedImprvValue || listing.propAssessedLandValue) {
    const assessedValue =
      (listing.propAssessedImprvValue || 0) +
      (listing.propAssessedLandValue || 0);
    return assessedValue;
  }

  // If none of the values are available, return 0 or a suitable default
  return 0;
};

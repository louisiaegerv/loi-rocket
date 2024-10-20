import { ListingRawData } from "@/utils/types";

export function calculateEstimatedOtherDebtBalance(
  listing: ListingRawData
): number {
  // Initialize the estimated other debt balance
  const estOtherDebtBalance =
    (listing.foreclosureDefaultAmount || 0) + (listing.lienAmount || 0);

  // Return the estimated other debt balance
  return estOtherDebtBalance;
}

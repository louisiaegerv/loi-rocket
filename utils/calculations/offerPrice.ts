import { floorTo500 } from "../utils";

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
export function calculateOfferPrice(
  estMortgageBalance: number,
  estOtherDebtBalance: number,
  estEquityAdjusted: number,
  newCashToSeller: number,
  estClosingCosts: number,
  estAgentFee: number,
  listingPrice: number
): number {
  const totalDebt = estMortgageBalance + estOtherDebtBalance;

  if (totalDebt > 0) {
    if (estEquityAdjusted >= newCashToSeller + estClosingCosts + estAgentFee) {
      const result =
        estMortgageBalance +
        estOtherDebtBalance +
        estEquityAdjusted -
        estClosingCosts -
        estAgentFee;
      return floorTo500(result);
    } else {
      const result = estMortgageBalance + estOtherDebtBalance + newCashToSeller;
      return floorTo500(result);
    }
  } else {
    return listingPrice - estClosingCosts - estAgentFee;
  }
}

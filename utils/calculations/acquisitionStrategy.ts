/**
 * Determines the acquisition strategy based on the provided logic.
 * @param estCashToSeller - The estimated cash to seller.
 * @param newCashToSeller - The new cash to seller.
 * @param openMortgageBalance - The open mortgage balance.
 * @returns The acquisition strategy as a string.
 */
export function determineAcquisitionStrategy(
  estCashToSeller: number,
  newCashToSeller: number,
  openMortgageBalance: number
): string {
  // console.log(
  //   `estCashToSeller: ${estCashToSeller}\n newCashToSeller: ${newCashToSeller}\n openMortgageBalance: ${openMortgageBalance}`
  // );

  if (estCashToSeller > newCashToSeller && openMortgageBalance === 0) {
    return "Seller Financing";
  } else if (
    estCashToSeller >= 1.5 * newCashToSeller &&
    openMortgageBalance > 0
  ) {
    if (openMortgageBalance < newCashToSeller - 5000) {
      return "Seller Financing";
    } else {
      return "Hybrid";
    }
  } else if (
    estCashToSeller >= newCashToSeller &&
    estCashToSeller <= 2 * newCashToSeller &&
    openMortgageBalance > 0
  ) {
    return "Subject To";
  } else if (estCashToSeller < newCashToSeller && openMortgageBalance > 0) {
    return "Subject To";
  } else {
    return "Other";
  }
}

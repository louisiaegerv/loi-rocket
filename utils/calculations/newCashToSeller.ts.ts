import { LOIRocketSettings } from "@/utils/types";

/**
 * Calculates the New Cash to Seller value based on the provided settings and estimated cash to seller.
 * @param estCashToSeller - The estimated cash to seller.
 * @param settings - The settings object containing various parameters for the calculation.
 * @returns The New Cash to Seller value as a number.
 */
export function calculateNewCashToSeller(
  estCashToSeller: number,
  settings: LOIRocketSettings
): number {
  const {
    maxStandardCashToSeller,
    cashToSellerFactor,
    cashToSellerOption,
    negativeTiers,
    roundValues,
    roundingFactor,
  } = settings;

  // Calculate ceiling
  let ceiling: number;
  switch (cashToSellerOption) {
    case "Standard":
      ceiling = maxStandardCashToSeller;
      break;
    case "Aggressive":
      ceiling =
        Math.ceil(
          (maxStandardCashToSeller * cashToSellerFactor) / roundingFactor
        ) * roundingFactor;
      break;
    case "Conservative":
      ceiling =
        Math.floor(
          (maxStandardCashToSeller * (2 - cashToSellerFactor)) / roundingFactor
        ) * roundingFactor;
      break;
    default:
      throw new Error(`Invalid cashToSellerOption: ${cashToSellerOption}`);
  }

  // Calculate floor
  const floor = negativeTiers.reduce(
    (minValue, tier) => Math.min(minValue, tier.value),
    Infinity
  );

  // Calculate initial result
  let initialResult: number;
  if (estCashToSeller > 0) {
    initialResult = Math.min(ceiling, estCashToSeller);
  } else if (estCashToSeller === 0) {
    initialResult = negativeTiers[0].value;
  } else {
    const tier = negativeTiers.find((tier) => estCashToSeller >= tier.min);
    initialResult = tier
      ? tier.value
      : negativeTiers[negativeTiers.length - 1].value;
  }

  // Apply cashToSellerFactor if not Standard
  let result: number;
  if (cashToSellerOption === "Conservative") {
    result = initialResult * (2 - cashToSellerFactor);
  } else if (cashToSellerOption === "Aggressive") {
    result = initialResult * cashToSellerFactor;
  } else {
    result = initialResult;
  }

  // Round the result if roundValues is true
  if (roundValues) {
    if (cashToSellerOption === "Aggressive") {
      result = Math.ceil(result / roundingFactor) * roundingFactor;
    } else {
      result = Math.floor(result / roundingFactor) * roundingFactor;
    }
  }

  // Ensure result is within bounds
  result = Math.max(floor, Math.min(ceiling, result));

  return result;
}

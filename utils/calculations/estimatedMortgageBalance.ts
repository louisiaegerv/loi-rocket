import { ListingRawData } from "@/utils/types";

/**
 * Calculate the estimated mortgage balance.
 *
 * @param listing - The complete listing data object
 * @returns The estimated mortgage balance
 */
export const calculateEstimatedMortgageBalance = (
  listing: ListingRawData
): number => {
  // 1) Total Open Loans Balance = Loan 1 Balance + Loan 2 Balance + Loan 3 Balance + Loan 4 Balance
  const totalOpenLoansBalance =
    (listing.loan1Balance || 0) +
    (listing.loan2Balance || 0) +
    (listing.loan3Balance || 0) +
    (listing.loan4Balance || 0);

  if (totalOpenLoansBalance > 0) {
    return totalOpenLoansBalance;
  }

  // 2) Estimate the loan balance
  if (listing.propLastSaleAmount && listing.propLastSaleDate) {
    const initialLoanAmount = listing.propLastSaleAmount * 0.8; // Assuming 20% down payment
    const lastSaleDate = new Date(listing.propLastSaleDate);
    const currentDate = new Date();
    const yearsSinceLastSale =
      currentDate.getFullYear() -
      lastSaleDate.getFullYear() +
      (currentDate.getMonth() - lastSaleDate.getMonth()) / 12 +
      (currentDate.getDate() - lastSaleDate.getDate()) / 365;

    // Assuming a fixed 30-year mortgage interest rate of 4% (for simplicity)
    const annualInterestRate = 0.04; // 4%
    const monthlyInterestRate = annualInterestRate / 12;
    const totalPayments = 30 * 12; // 30 years * 12 months/year

    // Calculate the monthly payment
    const monthlyPayment =
      (initialLoanAmount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, totalPayments)) /
      (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);

    // Create an amortization schedule
    let remainingBalance = initialLoanAmount;
    const monthsSinceLastSale = Math.floor(yearsSinceLastSale * 12);

    for (let i = 0; i < monthsSinceLastSale; i++) {
      const interestPayment = remainingBalance * monthlyInterestRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
    }

    return remainingBalance;
  }

  // If no value is available, return 0 or handle it as needed
  return 0;
};

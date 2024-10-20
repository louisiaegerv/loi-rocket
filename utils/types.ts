import { ColumnFilter } from "@tanstack/react-table";

export const TagColors = [
  "pink",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "blue",
  "indigo",
  "purple",
];

type CashToSellerOptions = "Standard" | "Aggressive" | "Conservative";

// Define the type for the objects in the array
type NegativeTier = {
  min: number;
  value: number;
};

// Type for filtered content categories
type FilteredContentCategory =
  | "Domains"
  | "Email Addresses"
  | "Phone Numbers"
  | "Cities"
  | "States"
  | "ZIP - Postal Codes"
  | "Counties";

// Type for filtered content
type FilteredContent = {
  category: FilteredContentCategory;
  values: string[];
};

export type LOIRocketSettings = {
  traditionalAgentFeePercentage: number;
  //This setting allows the user to set a standard, or traditional, commission rate for real estate agents to calculate estimated closing costs; This only applies to On-Market real estate records; Defaults to 6%

  traditionalClosingCostsPercentage: number;
  //This setting allows the user to set a standard, or traditional, rate to calculate estimated closing costs; Defaults to 2%

  newAgentFeePercentage: number;
  //This setting allows the user to set a commission rate they are willing to pay a real estate agents and calculate adjusted estimated closing costs; This only applies to On-Market real estate records; Defaults to 3%

  cashOfferHighPercentage: number;
  //This setting allows the user to set a ceiling value for a cash offer; Combined with the Cash Offer Low End Percentage allows the user to provide a range for approximations or as a negotiation tactic; Used in all strategies; Defaults to 70%

  cashOfferLowPercentage: number;
  //This setting allows the user to set a floor value for a cash offer; Combined with the Cash Offer High End Percentage allows the user to provide a range for approximations or as a negotiation tactic; Used in all strategies; Defaults to 60%

  maxInterestRatePercentage: number;
  // Allow the user to define the maximum estimated interest rate a primary mortgage may have. This is used for identifying Subject-To and Hybrid deals. It is not used for Traditional or Cash deals; Defaults to 7%; Optional

  maxEquityPercentage: number;
  //Allow the user to define the maximum estimated equity percentage the homeowner may have. This is used for identifying Subject-To and Hybrid deals. It is not used for Traditional or Cash deals; This is only used when Filter Strategy set to 1 (i.e., nontraditional); Defaults to 15%

  maxEntryFeePercentage: number;
  //Allow the user to define the maximum entry fee percentage they are willing to pay. 10% or lower is considered a good deal! 20% or higher is challenging for most non-traditional investors. Defaults to 15%

  maxEntryFeeAmount: number;
  // Allow the user to define the maximum entry fee amount that they are willing to pay. This will override the Maximum Entry Fee Percentage; Defaults to $20,000

  maxStandardCashToSeller: number;
  // This setting allows the user to set the maximum amount they are willing to give to a seller at close as cash in pocket; Defaults to $20,000

  cashToSellerFactor: number;
  // This setting allows the user to set a multiplier factor for determining the aggressiveness of Cash to Seller Option setting; Using the default setting Conservative is 1.5 less and Aggressive is 1.5 more than Standard; Standard is set using Maximum Standard Cash to Seller; e.g, if Standard is $20,000.00 then Conservative would be $10,000.00 and Aggressive would be $30,000.00 at the 1.5 Factor; Defaults to 1.5

  cashToSellerOption: CashToSellerOptions;
  // This setting allows the user to set the aggressiveness of Est. Cash to Seller; Defaults to "Standard"; Other options include "Aggressive" and "Conservative"

  negativeTiers: NegativeTier[];
  // This setting allows the user to add and remove tiers (rows) as well as define the floor value of each plus the standard amount to pay to the seller for each tier. The negativeTiers list represents a tiered system for handling negative estCashToSeller values. Each tier is defined by a dictionary with two keys: "min" and "value".

  roundValues: boolean;
  // This setting allows the user to enable/disable rounding (up and down) of calculated values for cash to the seller. If enabled, users will be required to set a value for Rounding Factor. Defaults to True

  roundingFactor: number;
  // This variable represents the value to round the cash to the seller's result up or down to. The higher the value, the larger the interval to round by (e.g. rounding to the nearest 500, 1000, 5000, etc.). A smaller value would result in finer rounding, such as rounding to the nearest 0, 10, 20, 50, etc. For example if set to 500, the result for 13,233 would round down to 13,000 or round up to 13,500 if the cash to seller result was 13,400. Defaults to 500

  medianHomeSoldPrice: number;
  // This setting allows the user to define the average or median home sold price for their target area which is used for determine the Minimum Listing Price and Maximum Listing Price. Defaults to $500,000.00

  medianHomeSoldPriceFactor: number;
  // This setting allows the user to set a factor for determining the Minimum Listing Price and Maximum Listing Price to filter out outlier records; Only used if Median Home Sold Price is set

  minimumListingPrice: number;
  // This allows the user to set a minimum listing price; if set it overrides any minimum listing price calculated by the Median Home Sold Price Factor and becomes the true minimum price. Defaults to $10,000.00

  maximumListingPrice: number;
  // This allows the user to set a maximum listing price; if set it overrides any maximum listing price calculated by the Median Home Sold Price Factor and becomes the true maximum price. Defaults to $1.5M

  estimatedRentRatePercentage: number;
  // This setting allows the user to define the approximate monthly rent rate based on the listing price (i.e., the 1% rule). Defaults to 1%

  filteredContent: FilteredContent[];
  /* 
    A variety of values in various categories that allow the user/application to  filter out records if there is a match
    Defaults to N/A — this has no default, options include…
    Domains (checks urls and email, e.g., opendoor.com)
    Email Addresses (limited to email addresses)
    Phone Numbers (limited to phone numbers)
    Cities (limited to cities)
    States (limited to states)
    ZIP - Postal Codes (limited to zip codes)
    Counties (limited to counties)
  */

  averageAssignmentFee: number;
  // This allows a user to set a minimum value for estimating an Entry Fee; Used for a wholesale disposition. Defaults to $15,000.00

  expandResults: boolean;
  /* 
  This setting allows users to keep more records, even when their entry fees initially exceed the maximum allowed. The system can automatically adjust the Est. Cash to Seller to ensure the Entry Fee doesn't surpass the limits, while still including as many records as possible. This is only available if Maximum Entry Fee Percentage or Maximum Entry Fee Amount is set.
  
  Defaults to False
  
  Note this has not been tested and thus currently just a concept for consideration. I.e., calculate a new cash to seller/entry fee amount other than what is defined in the settings to try and make the offer work rather than filtering it out
  
  The adjusted Est. Cash to Seller will need to be within reason so as not to ruin the offer; perhaps using a maximum adjustment (another setting variable) of 10 or 20% of the original Est. Cash to Seller
  */

  /* TBD fields (with suggested types based on their descriptions) */

  overMarketValuePercentage?: number;
  // Allow the user to define an overage percentage of asking price (i.e., 1%–5%) over asking price

  pricePerSquareFeet?: number;
  // Find properties that are underpriced to find good deals
  // As a calculation this could be something that filters out high probability / high opportunity deals

  daysOnMarket?: number;
  // Allow users to filter out files by DOM
  // As a calculation this could be something that filters out high probability / high opportunity deals
};

export type CustomFilter = {
  name: string;
  filters: ColumnFilter[];
};

export type ListingFull = ListingRawData & ListingCalculatedData;

export type ListingCalculatedData = {
  "Est. Equity Adjusted": number;
  "Est. Equity Percent Adjusted": number;
  "Est. Agent Fee": number;
  "New Agent Fee": number;
  "Est. Closing Costs": number;
  "Est. Cash To Seller": number;
  "New Cash To Seller": number;
  "Offer Price": number;
  "Total Cost": number;
  "Cash Offer - High": number;
  "Cash Offer - Low": number;
  "Entry Fee w/o CC": number;
  "Entry Fee w/ CC": number;
  "Offer To Asking": number;
  "Entry Fee w/o CC %": number;
  "Entry Fee w/ CC %": number;
  "Acquisition Strategy": string;
  Note: string;
};

export type TagType = {
  color: string;
  value: string;
  type: "basic";
};

// Raw listing data
export type ListingRawData = {
  tags?: TagType[];

  // General property information
  currentLeaseEndDate?: string;
  currentMonthlyRent?: number;
  estGrossYieldPercentage?: number;
  estMonthlyRent?: number;
  attorneyCaseNumber?: string;
  auctionCityAndState?: string;
  auctionCourthouse?: string;
  auctionDate?: string;
  auctionLocation?: string;
  auctionTime?: string;
  auctionUrl?: string;
  foreclosureBorrowerName?: string;
  foreclosureCaseNumber?: string;
  foreclosureDefaultAmount?: number;
  foreclosureDocNumber?: string;
  foreclosureLender?: string;
  foreclosureOpeningBid?: number;
  foreclosureRecordNumber?: string;
  foreclosureRecordType?: string;
  foreclosureRecordingDate?: string;
  foreclosureStatus?: string;
  attorneyAddress?: string;
  attorneyName?: string;
  trusteeRefNumber?: string;
  foreclosureUnpaidAmount?: number;
  lienAmount?: number;
  lienDate?: string;
  lienType?: string;

  // Loan 1 information
  loan1Balance?: number;
  loan1DeedType?: string;
  loan1DueDate?: string;
  loan1InterestPayment?: number;
  loan1InterestRate?: number;
  loan1Lender?: string;
  loan1MonthsLeft?: number;
  loan1MortgageInsurance?: string;
  loan1OrgAmount?: number;
  loan1OrgDate?: string;
  loan1Payment?: number;
  loan1PrincipalPayment?: number;
  loan1InterestRateType?: string;
  loan1TermMonths?: number;
  loan1Ltv?: number;
  loan1Type?: string;

  // Loan 2 information
  loan2Balance?: number;
  loan2DeedType?: string;
  loan2DueDate?: string;
  loan2InterestPayment?: number;
  loan2InterestRate?: number;
  loan2Lender?: string;
  loan2MonthsLeft?: number;
  loan2MortgageInsurance?: string;
  loan2OrgAmount?: number;
  loan2OrgDate?: string;
  loan2Payment?: number;
  loan2PrincipalPayment?: number;
  loan2InterestRateType?: string;
  loan2TermMonths?: number;
  loan2Ltv?: number;
  loan2Type?: string;

  // Loan 3 information
  loan3Balance?: number;
  loan3DeedType?: string;
  loan3DueDate?: string;
  loan3InterestPayment?: number;
  loan3InterestRate?: number;
  loan3Lender?: string;
  loan3MonthsLeft?: number;
  loan3MortgageInsurance?: string;
  loan3OrgAmount?: number;
  loan3OrgDate?: string;
  loan3Payment?: number;
  loan3PrincipalPayment?: number;
  loan3InterestRateType?: string;
  loan3TermMonths?: number;
  loan3Ltv?: number;
  loan3Type?: string;

  // Loan 4 information
  loan4Balance?: number;
  loan4DeedType?: string;
  loan4DueDate?: string;
  loan4InterestPayment?: number;
  loan4InterestRate?: number;
  loan4Lender?: string;
  loan4MonthsLeft?: number;
  loan4MortgageInsurance?: string;
  loan4OrgAmount?: number;
  loan4OrgDate?: string;
  loan4Payment?: number;
  loan4PrincipalPayment?: number;
  loan4InterestRateType?: string;
  loan4TermMonths?: number;
  loan4Ltv?: number;
  loan4Type?: string;

  // Mailing address information
  mailingAddress?: string;
  mailingCareOfName?: string;
  mailingCarrierRoute?: string;
  mailingCity?: string;
  mailingCounty?: string;
  mailingDoNotMail?: string;
  mailingFips?: string;
  mailingFullAddress?: string;
  mailingStateRegion?: string;
  mailingUnitNumber?: string;
  mailingZipPlus4?: string;
  mailingZipPostalCode?: string;

  // Agent information
  agentEmail?: string;
  agentEmailDnc?: string;
  agentFirstName?: string;
  agentFullName?: string;
  agentLastName?: string;
  agentPhone?: string;
  agentPhoneDnc?: string;

  // Listing information
  listingPrice?: number;
  brokerageName?: string;
  brokeragePhone?: string;
  brokerageUrl?: string;
  listingDate?: string;
  listingDaysOnMarket?: number;
  listingNumber?: string;
  listingUrl?: string;
  listingSpreadAmount?: number;
  listingSpreadPercentage?: number;
  listingStatus?: string;
  listingType?: string;

  // Owner 1 information
  owner1FirstName?: string;
  owner1FullName?: string;
  owner1LastName?: string;
  owner1Email?: string;
  owner1EmailDnc?: string;
  owner1Phone?: string;
  owner1PhoneDnc?: string;

  // Owner 2 information
  owner2FirstName?: string;
  owner2FullName?: string;
  owner2LastName?: string;
  owner2Email?: string;
  owner2EmailDnc?: string;
  owner2Phone?: string;
  owner2PhoneDnc?: string;

  // Owner 3 information
  owner3FirstName?: string;
  owner3FullName?: string;
  owner3LastName?: string;
  owner3Email?: string;
  owner3EmailDnc?: string;
  owner3Phone?: string;
  owner3PhoneDnc?: string;

  // Owner 4 information
  owner4FirstName?: string;
  owner4FullName?: string;
  owner4LastName?: string;
  owner4Email?: string;
  owner4EmailDnc?: string;
  owner4Phone?: string;
  owner4PhoneDnc?: string;

  // Owner general information
  ownerBankruptcyDate?: string;
  ownerBusinessName?: string;
  ownerDeceased?: string;
  ownerDivorceDate?: string;
  ownerOccupied?: string;
  ownerType?: string;
  ownershipLengthMonths?: number;

  // Property information
  propAddress?: string;
  propAirConditioningType?: string;
  propApn?: string;
  propAssessedImprvPercentage?: number;
  propAssessedImprvValue: number;
  propAssessedImprvValuePercentage?: number;
  propAssessedLandValue: number;
  propAssessedTotalValue?: number;
  propAssessmentYear?: number;
  propHasAssociation?: string;
  propBathroomsNumber?: number;
  propBedroomsNumber?: number;
  propBuildingSqft?: number;
  propHasCarport?: string;
  propCarportSqft?: number;
  propCarrierRoute?: string;
  propCensusTract?: string;
  propCity?: string;
  propClassification?: string;
  propCounty?: string;
  propEstEquity?: number;
  propEstEquityPercentage?: number;
  propEstMarketImprvPercentage?: number;
  propEstMarketImprvValue: number;
  propEstMarketLandValue: number;
  propEstMarketValue: number;
  propEstAssocDuesMonthly?: number;
  propEstInsuranceMonthly?: number;
  propEstTaxesMonthly?: number;
  propEstValue: number;
  propFips?: string;
  propFireplacesNumber?: number;
  propFullAddress?: string;
  propGarageSqft?: number;
  propGarageType?: string;
  propHeatingType?: string;
  propLandUse?: string;
  propZoningCode?: string;
  propLastSaleAmount: number;
  propLastSaleBuyer1?: string;
  propLastSaleBuyer2?: string;
  propLastSaleCashBuy?: string;
  propLastSaleDate: string;
  propLastSaleDateRecorded?: string;
  propLegalDescription?: string;
  propLotNumber?: string;
  propLotSizeAcres?: number;
  propLotSizeSqft?: number;
  propNumber?: string;
  propHasPool?: string;
  propPoolType?: string;
  propPostDirectional?: string;
  propPreDirectional?: string;
  propPriorSaleAmount?: number;
  propPriorBuyer1?: string;
  propPriorBuyer2?: string;
  propPriorCashBuy?: string;
  propPriorSaleDate?: string;
  propPriorSaleDateRecorded?: string;
  propStateRegion?: string;
  propStoriesNumber?: number;
  propStreetName?: string;
  propStreetType?: string;
  propSubdivision?: string;
  propTaxDelinquent?: string;
  propTaxDelinquentYear?: number;
  propTaxYear?: number;
  propType?: string;
  propUnitCount?: number;
  propUnitNumber?: string;
  propUse?: string;
  propVacant?: string;
};

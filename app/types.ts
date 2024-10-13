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

export type CustomFilter = {
  name: string;
  filters: ColumnFilter[];
};

export type Listing = {
  id: string;
  address: string;
  price: number;
  estimatedValue: number;
  mlsStatus?: string;
  sqFt: number;
  pricePerSqFt: number;
  bedrooms: number;
  bathrooms: number;
  yearBuilt: number;
  daysOnMarket: number;
  tags?: TagType[];
};

export type ListingFull = ListingRawData & ListingCustomData;

export type ListingCustomData = {
  tags?: TagType[];
};

// Raw listing data
export type ListingRawData = {
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

export type TagType = {
  color: string;
  value: string;
  type: "basic";
};

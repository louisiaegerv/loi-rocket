"use client";
import { DataTable } from "./data-table";
import { columns, columnsFull } from "./columns";
import { data, dataFull } from "./data";
import { ListingFull, ListingRawData } from "./types";
import { useState, useEffect } from "react";

function processData(data: ListingFull[]) {
  const ACQUISITION_STRATEGIES = [
    "Subject To",
    "Hybrid",
    "Seller Financing",
    "Other",
    "Problem",
  ];

  const APP_SETTINGS = {};

  const EST_PROPERTY_VALUE = getEstPropValue(data[0]);
  console.log(`EST_PROPERTY_VALUE: ${EST_PROPERTY_VALUE}`);

  // Calculate Est. Cash to seller
  // getEstCashToSeller()

  // Calculate New Cash to seller
  // Calculate Open Mortgage Balance
  // Calculate
  // Calculate
  // Calculate
  // Calculate
  // Calculate
  // Calculate
  // Calculate
  // Calculate
  // Calculate

  return data.map((item) => item);
}

function getEstPropValue(propData: ListingFull) {
  //   Use the following values in order of availability to determine the estimated value of the property:

  if (propData.listingPrice) {
    // Option 1
    //Listing Price (for those that are On-Market)
    return propData.listingPrice;
  } else if (propData.propLastSaleAmount && propData.propLastSaleDate) {
    // Option 2
    // Prop. Last Sale Amount x (1.03)^years since Prop. Last Sale Date (e.g., To estimate the appraised value of the property, we can multiply the Prop. Last Sale Amount by (1 + 0.03)^n, where n is the number of years since the Prop. Last Sale Date. This assumes a consistent annual appreciation rate of 3%.)
    const currentDate = new Date();
    const yearsSinceLastSale =
      currentDate.getFullYear() -
      new Date(propData.propLastSaleDate).getFullYear();
    const appreciationRate = 1.03;
    const LAST_SALE_AMOUNT_ADJUSTED =
      propData.propLastSaleAmount *
      Math.pow(appreciationRate, yearsSinceLastSale);
    console.log(`LAST_SALE_AMOUNT_ADJUSTED: ${LAST_SALE_AMOUNT_ADJUSTED}`);
    return LAST_SALE_AMOUNT_ADJUSTED;
  } else if (propData.propEstValue) {
    // Prop. Est. Value
    console.log(`PROP_EST_VALUE: ${propData.propEstValue}`);
    return propData.propEstValue;
  }

  const PROP_EST_MARKET_VALUE_1 = propData.propEstMarketValue;
  console.log(`PROP_EST_MARKET_VALUE_1: ${PROP_EST_MARKET_VALUE_1}`);

  // Prop. Est. Market Value = Prop. Est. Market Imprv. Value + Prop. Est. Market Land Value
  const PROP_EST_MARKET_VALUE_2 =
    propData.propEstMarketImprvValue + propData.propEstMarketLandValue;
  console.log(`PROP_EST_MARKET_VALUE_2: ${PROP_EST_MARKET_VALUE_2}`);

  // Prop. Assessed Total Value = Prop. Assessed Imprv. Value + Prop. Assessed Land Value
  const PROP_ASSESSED_TOTAL_VALUE =
    propData.propAssessedImprvValue + propData.propAssessedLandValue;
  console.log(`PROP_ASSESSED_TOTAL_VALUE: ${PROP_ASSESSED_TOTAL_VALUE}`);

  return LISTING_PRICE;
}

// Calculate Est. Cash to seller
function getEstCashToSeller() {
  // Est. Prop Value - Est. Mortgage Balance - Est. Other Debt Balance - Est. Agent Fee - Est. Closing Costs
}

function acquisitionStrategyFormula(getCell) {
  return `=IF(AND(${getCell("Est. Cash To Seller")} > ${getCell(
    "New Cash To Seller"
  )}, 
      OR(${getCell("Open Mortgage Balance")} <= 0, ISBLANK(${getCell(
    "Open Mortgage Balance"
  )}))), 
    "Seller Financing", 
    IF(AND(${getCell("Est. Cash To Seller")} >= (${getCell(
    "New Cash To Seller"
  )} * 2), 
           OR(${getCell("Open Mortgage Balance")} > 0, ISBLANK(${getCell(
    "Open Mortgage Balance"
  )}))), 
      IF(AND(OR(${getCell("Open Mortgage Balance")} > 0, ISBLANK(${getCell(
    "Open Mortgage Balance"
  )})),
             ${getCell("Open Mortgage Balance")} < (${getCell(
    "New Cash To Seller"
  )} - 5000)), 
         "Seller Financing", 
         "Hybrid"),
    IF(AND(${getCell("Est. Cash To Seller")} > ${getCell(
    "New Cash To Seller"
  )}, 
      ${getCell("Est. Cash To Seller")} < (${getCell(
    "New Cash To Seller"
  )} * 2), 
      OR(${getCell("Open Mortgage Balance")} > 0, ISBLANK(${getCell(
    "Open Mortgage Balance"
  )}))), 
      "Subject To", 
    IF(AND(${getCell("Est. Cash To Seller")} < ${getCell(
    "New Cash To Seller"
  )}, 
           OR(${getCell("Open Mortgage Balance")} > 0, ISBLANK(${getCell(
    "Open Mortgage Balance"
  )}))), 
      "Subject To", 
    "Other"))))`;
}

export default function App() {
  const [processedData, setProcessedData] = useState<ListingFull[]>([]);

  useEffect(() => {
    const processed = processData(dataFull);
    // console.log(JSON.stringify(processed));

    setProcessedData(processed);
  }, []);

  return <DataTable columns={columnsFull} data={dataFull}></DataTable>;
}

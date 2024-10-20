const newColumns = [
    { name: "Est. Equity Adjusted", format: "currency" },
    { name: "Est. Equity Percent Adjusted", format: "percentage" },
    { name: "Est. Agent Fee", format: "currency" },
    { name: "Est. Closing Costs", format: "currency" },
    { name: "Est. Cash To Seller", format: "currency" },
    { name: "New Cash To Seller", format: "currency" },
    { name: "Offer Price", format: "currency" },
    { name: "New Agent Fee", format: "currency" },
    { name: "Total Cost", format: "currency" },
    { name: "Cash Offer - High", format: "currency" },
    { name: "Cash Offer - Low", format: "currency" },
    { name: "Entry Fee w/o CC", format: "currency" },
    { name: "Entry Fee w/ CC", format: "currency" },
    { name: "Offer To Asking", format: "percentage" },
    { name: "Entry Fee w/o CC %", format: "percentage" },
    { name: "Entry Fee w/ CC %", format: "percentage" },
    { name: "Acquisition Strategy", format: "text" },
    { name: "Note", format: "text" },
];

/**
 * Calculates values for a single row.
 * @param {Array} row - The row data.
 * @param {Object} columnMap - A map of column headers to their positions.
 * @param {Object} settings - The settings object.
 * @param {number} rowIndex - The index of the current row.
 * @returns {Object} An object containing the calculated values or formulas.
 */
function calculateValues(row, columnMap, settings, rowIndex) {
    const getCell = (header) => {
        if (columnMap.hasOwnProperty(header)) {
            return `${columnToLetter(columnMap[header])}${rowIndex + 2}`;
        }
        console.warn(`Warning: Column "${header}" not found in columnMap`);
        return "";
    };

    const calculations = {
        "Est. Equity Adjusted": `=${getCell("Listing Price")} - ${getCell(
            "Open Mortgage Balance"
        )}`,
        "Est. Equity Percent Adjusted": `=${getCell(
            "Est. Equity Adjusted"
        )} / ${getCell("Listing Price")}`,
        "Est. Agent Fee": `=${getCell("Listing Price")} * Settings!$C$5`,
        "Est. Closing Costs": `=${getCell("Listing Price")} * Settings!$C$6`,
        "Est. Cash To Seller": `=${getCell("Listing Price")} - ${getCell(
            "Open Mortgage Balance"
        )} - ${getCell("Est. Agent Fee")} - ${getCell("Est. Closing Costs")}`,
        "New Cash To Seller": newCashToSellerFormula(getCell),
        "Offer Price": offerPriceFormula(getCell),
        "Offer To Asking": `=${getCell("Offer Price")} / ${getCell(
            "Listing Price"
        )}`,
        "New Agent Fee": `=${getCell("Offer Price")} * Settings!$C$7`,
        "Total Cost": `=${getCell("Offer Price")} + ${getCell(
            "New Agent Fee"
        )}`,
        "Cash Offer - High": `=FLOOR(${getCell(
            "Listing Price"
        )} * Settings!$C$8, 500)`,
        "Cash Offer - Low": `=FLOOR(${getCell(
            "Listing Price"
        )} * Settings!$C$9, 500)`,
        "Entry Fee w/o CC": `=${getCell("New Cash To Seller")} + ${getCell(
            "New Agent Fee"
        )} + Settings!$C$10`,
        "Entry Fee w/o CC %": `=${getCell("Entry Fee w/o CC")} / ${getCell(
            "Offer Price"
        )}`,
        "Entry Fee w/ CC": `=${getCell("New Cash To Seller")} + ${getCell(
            "New Agent Fee"
        )} + ${getCell("Est. Closing Costs")} + Settings!$C$10`,
        "Entry Fee w/ CC %": `=${getCell("Entry Fee w/ CC")} / ${getCell(
            "Offer Price"
        )}`,
        "Acquisition Strategy": acquisitionStrategyFormula(getCell),
        Note: noteFormula(getCell),
    };

    return calculations;
}
    
/**
 * Generates the formula for Acquisition Strategy.
 * @param {Function} getCell - Function to get cell references.
 * @returns {string} The formula for Acquisition Strategy.
 *
 * Here's a simplified explanation of the logic:
 *  If the estimated cash to seller is greater than the new cash to seller, and there's no open mortgage balance:
 *    Result: "Seller Financing"
 *  If the estimated cash to seller is at least one and half times the new cash to seller, and there is an open mortgage balance:
 *    If the open mortgage balance is less than (new cash to seller - 5000):
 *      Result: "Seller Financing"
 *    Otherwise:
 *      Result: "Hybrid"
 *  If the estimated cash to seller is between the new cash to seller and double the new cash to seller, and there is an open mortgage balance:
 *    Result: "Subject To"
 *  If the estimated cash to seller is less than the new cash to seller, and there is an open mortgage balance:
 *    Result: "Subject To"
 *  If none of the above conditions are met:
 *    Result: "Other"
 */
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
}`
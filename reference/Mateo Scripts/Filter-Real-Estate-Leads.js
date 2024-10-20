// Filter-Read-Estate-Leads.js

// Global variables and configuration
const CONFIG = {
    COPY_ORIGINAL_SHEET: true, // Set to false if you don't want to copy the original sheet
    DELETE_CREATED_SHEETS: true, // Set to false if you want to keep the original created sheets
    INCLUDE_FORMULAS: true, // Set to false if you want to calculate values instead of including formulas
    DISPLAY_COLUMN_MAPPING: false, // Set to false to skip the column mapping review
    HIDE_SPECIFIED_COLUMNS: true, // Set to false to show all columns
};

const SHEET_NAMES = {
    SETTINGS: "Settings",
    MAPPED_COLUMNS: "Mapped Columns",
    ORIGINAL_PROPWIRE: "Original Propwire",
    PROPWIRE_IMPORTED: "Propwire Imported Leads",
};

const ACQUISITION_STRATEGIES = [
    "Subject To",
    "Hybrid",
    "Seller Financing",
    "Other",
    "Problem",
];

const HIDDEN_COLUMNS = [
    { start: 1, end: 1 }, // A
    { start: 13, end: 16 }, // M-P
    { start: 22, end: 27 }, // V-AA
    { start: 30, end: 35 }, // AD-AI
    { start: 43, end: 44 }, // AQ-AR
    { start: 49, end: 51 }, // AW-AY
    { start: 53, end: 54 }, // BA-BB
    { start: 60, end: 64 }, // BH-BL
    { start: 68, end: 85 }, // BP-CG
];

/**
 * Creates a custom menu when the spreadsheet is opened.
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu("Property Filter")
        .addItem("Filter Records", "filterRecordsFromUI")
        .addItem(
            "Create Individual Sheets by Acquisition Strategy",
            "createIndividualSheets"
        )
        .addToUi();
}

/**
 * Main function to filter records, called from the UI.
 */
function filterRecordsFromUI() {
    filterRecords(true);
}

/**
 * Main function to filter on-market records.
 * This function orchestrates the entire filtering process.
 * @param {boolean} fromUI - Whether the function is called from the UI
 */
function filterRecords(fromUI = false) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = fromUI ? SpreadsheetApp.getUi() : createMockUI();

    // Prepare sheets
    if (CONFIG.DELETE_CREATED_SHEETS) deleteExistingSheets(ss);
    if (CONFIG.COPY_ORIGINAL_SHEET) copyOriginalSheet(ss);
    const mainSheet = getOrCreateMainSheet(ss);

    // Process data
    const columnMap = addAndFormatNewColumns(mainSheet);
    if (CONFIG.DISPLAY_COLUMN_MAPPING) {
        displayColumnMappingForReview(ss, columnMap, fromUI);
        return;
    }

    // Perform calculations and apply notes to the main sheet
    const settings = getSettings(ss);
    performCalculationsAndApplyNotes(mainSheet, columnMap, settings);

    // Create filtered sheets if user agrees
    if (promptUserForFilteredSheets(ui, fromUI)) {
        createFilteredSheets(ss, mainSheet, columnMap, false);
    } else {
        ui.alert(
            'Filtered sheets were not created. You can create them later using the "Create Individual Sheets by Acquisition Strategy" menu option.'
        );
    }

    // Final steps
    orderSheets(ss);
    toggleSpecifiedColumns(mainSheet);
    ui.alert("Processing completed successfully.");
}

/**
 * Creates a mock UI object for non-UI contexts.
 * @returns {Object} A mock UI object
 */
function createMockUI() {
    return {
        alert: function (message) {
            console.log("ALERT:", message);
        },
        prompt: function (title, prompt, buttons) {
            console.log("PROMPT:", title, prompt);
            return {
                getSelectedButton: () => "OK",
                getResponseText: () => "Yes",
            };
        },
        Button: { OK: "OK", YES: "YES", NO: "NO" },
        ButtonSet: { YES_NO: "YES_NO", OK_CANCEL: "OK_CANCEL" },
    };
}

/**
 * Deletes existing sheets if they exist.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 */
function deleteExistingSheets(ss) {
    const sheetsToDelete = [
        ...ACQUISITION_STRATEGIES.map((strategy) => `${strategy} Leads`),
        SHEET_NAMES.PROPWIRE_IMPORTED,
    ];

    ss.getSheets().forEach((sheet) => {
        const sheetName = sheet.getName();
        if (
            sheetsToDelete.includes(sheetName) ||
            sheetName.startsWith(SHEET_NAMES.PROPWIRE_IMPORTED)
        ) {
            ss.deleteSheet(sheet);
        }
    });
}

/**
 * Copies the original sheet if it exists.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 */
function copyOriginalSheet(ss) {
    const originalSheet = findSheet(
        ss,
        (name) =>
            name.startsWith("Propwire Export") ||
            name.startsWith("Original Propwire Export")
    );

    if (!originalSheet) return;

    const newName = originalSheet.getName().startsWith("Original")
        ? originalSheet.getName().replace("Original ", "")
        : "Original " + originalSheet.getName();

    originalSheet.copyTo(ss).setName(newName);
}

/**
 * Gets the main sheet or creates it if it doesn't exist.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 * @returns {SpreadsheetApp.Sheet} The main sheet.
 */
function getOrCreateMainSheet(ss) {
    let mainSheet = renameMainSheet(ss);
    if (!mainSheet) {
        mainSheet = ss
            .getSheets()
            .find((sheet) =>
                sheet.getName().startsWith(SHEET_NAMES.PROPWIRE_IMPORTED)
            );
        if (!mainSheet) {
            mainSheet = ss.getActiveSheet();
        }
    }
    return mainSheet;
}

/**
 * Renames the main sheet with today's date.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 * @returns {SpreadsheetApp.Sheet|null} The renamed main sheet or null if not found.
 */
function renameMainSheet(ss) {
    const mainSheet = findSheet(ss, (name) =>
        name.startsWith("Propwire Export")
    );

    if (mainSheet) {
        const today = new Date();
        const newName = `${
            SHEET_NAMES.PROPWIRE_IMPORTED
        } - ${Utilities.formatDate(
            today,
            Session.getScriptTimeZone(),
            "MMM dd, yyyy"
        )}`;
        mainSheet.setName(newName);
    }

    return mainSheet || null;
}

/**
 * Adds new columns to the sheet.
 * @param {SpreadsheetApp.Sheet} sheet - The sheet to add columns to.
 * @param {Object} columnMap - The map of existing columns.
 * @param {Array} newColumns - The array of new columns to add.
 */
function addNewColumns(sheet, columnMap, newColumns) {
    let lastColumn = sheet.getLastColumn();

    newColumns.forEach((column) => {
        if (!columnMap.hasOwnProperty(column.name)) {
            lastColumn++;
            sheet.insertColumnAfter(lastColumn - 1);
            sheet.getRange(1, lastColumn).setValue(column.name);
            columnMap[column.name] = lastColumn;

            const range = sheet.getRange(2, lastColumn, sheet.getLastRow() - 1);
            if (column.format === "currency") {
                range.setNumberFormat("$#,##0.00");
            } else if (column.format === "percentage") {
                range.setNumberFormat("0.00%");
            }
        }
    });
}

/**
 * Adds and formats new columns.
 * @param {SpreadsheetApp.Sheet} sheet - The main sheet.
 * @returns {Object} A map of column headers to their positions.
 */
function addAndFormatNewColumns(sheet) {
    const headers = sheet
        .getRange(1, 1, 1, sheet.getLastColumn())
        .getDisplayValues()[0];
    const columnMap = createColumnMap(headers);

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

    addNewColumns(sheet, columnMap, newColumns);
    formatExistingColumns(sheet, columnMap);

    return columnMap;
}

/**
 * Displays column mapping for review.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 * @param {Object} columnMap - A map of column headers to their positions.
 * @param {boolean} fromUI - Whether the function is called from the UI.
 */
function displayColumnMappingForReview(ss, columnMap, fromUI) {
    const mappingSheet = ss.insertSheet(SHEET_NAMES.MAPPED_COLUMNS);

    // Add headers
    mappingSheet.getRange("A1:B1").setValues([["Header", "Column"]]);

    // Add column mapping data
    const mappingData = Object.entries(columnMap).map(([header, colNum]) => [
        header,
        columnToLetter(colNum),
    ]);
    mappingSheet.getRange(2, 1, mappingData.length, 2).setValues(mappingData);

    // Auto-resize columns
    mappingSheet.autoResizeColumns(1, 2);

    // Display message to user
    if (fromUI) {
        SpreadsheetApp.getUi().alert(
            "Column Mapping Review",
            'A new sheet "Mapped Columns" has been created with the current column mapping.\n\n' +
                "Please review the mapping and then run the script again to continue processing.",
            SpreadsheetApp.getUi().ButtonSet.OK
        );
    } else {
        console.log(
            'Column Mapping Review: A new sheet "Mapped Columns" has been created.'
        );
    }

    // Throw an error to pause the script execution
    throw new Error(
        "Script paused for column mapping review. Please review the 'Mapped Columns' sheet and run the script again to continue."
    );
}

/**
 * Handles the column mapping review process.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 * @param {SpreadsheetApp.Ui} ui - The UI for displaying alerts.
 * @param {boolean} fromUI - Whether the function is called from the UI.
 * @returns {boolean} True if the process should be halted, false otherwise.
 */
function handleColumnMappingReview(ss, ui, fromUI) {
    const mappingSheet = ss.getSheetByName(SHEET_NAMES.MAPPED_COLUMNS);
    if (!mappingSheet) return false;

    if (fromUI) {
        const response = ui.alert(
            "Continue Processing?",
            "Do you want to continue processing after reviewing the column mapping?",
            ui.ButtonSet.YES_NO
        );

        if (response !== ui.Button.YES) {
            ui.alert("Operation cancelled by user.");
            return true;
        }
    } else {
        console.log("Column mapping review: Assuming user wants to continue.");
    }

    ss.deleteSheet(mappingSheet);
    return false;
}

/**
 * Performs calculations and applies notes to the main sheet.
 * @param {SpreadsheetApp.Sheet} mainSheet - The main sheet.
 * @param {Object} columnMap - A map of column headers to their positions.
 * @param {Object} settings - The settings object.
 */
function performCalculationsAndApplyNotes(mainSheet, columnMap, settings) {
    const headers = Object.keys(columnMap);
    const data = mainSheet
        .getRange(2, 1, mainSheet.getLastRow() - 1, headers.length)
        .getDisplayValues();

    const batchSize = 1000;
    const updatedData = [];

    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const processedBatch = batch.map((row, index) =>
            processRow(row, columnMap, settings, i + index)
        );
        updatedData.push(...processedBatch);
    }

    // Write updated data back to the main sheet
    mainSheet
        .getRange(2, 1, updatedData.length, headers.length)
        .setValues(updatedData);

    // Format columns, freeze first row, and adjust column widths
    formatExistingColumns(mainSheet, columnMap);
    mainSheet.setFrozenRows(1);
    mainSheet.autoResizeColumns(1, mainSheet.getLastColumn());
}

/**
 * Processes a single row of data.
 * @param {Array} row - The row data.
 * @param {Object} columnMap - A map of column headers to their positions.
 * @param {Object} settings - The settings object.
 * @param {number} rowIndex - The index of the current row.
 * @returns {Array} The processed row data.
 */
function processRow(row, columnMap, settings, rowIndex) {
    // console.log("Starting processRow function");
    // console.log("columnMap:", JSON.stringify(columnMap));
    // console.log("row:", JSON.stringify(row));

    const indexMap = createIndexMap(columnMap);
    // console.log("indexMap:", JSON.stringify(indexMap));

    if (indexMap.listingPrice === undefined) {
        console.error("Listing Price column not found in columnMap");
        return row; // Return the original row if we can't process it
    }

    const maxEquityPercentage = settings.MaximumEquityPercentage || 0;
    const maxInterestRate = settings.MaximumInterestRate || 0;

    let note = row[indexMap.note] || "";
    let acquisitionStrategy = "";

    if (!row[indexMap.listingPrice]) {
        row[indexMap.note] = "Problem - Missing Listing Price";
        row[indexMap.acquisitionStrategy] = "Problem";
    } else {
        try {
            const calculations = calculateValues(
                row,
                columnMap,
                settings,
                rowIndex
            );
            Object.entries(calculations).forEach(([key, value]) => {
                const index = columnMap[key] - 1;
                if (index !== undefined) {
                    row[index] = CONFIG.INCLUDE_FORMULAS
                        ? value
                        : evaluateFormula(value, row, columnMap, settings);
                }
            });

            if (row[indexMap.offerPrice] > row[indexMap.listingPrice]) {
                row[indexMap.note] =
                    "Problem - possibly upside down, a short-sale, the listing price is incorrect, or the loan balance is incorrect. Further exploration is required.";
            } else if (
                row[indexMap.openMortgageBalance] > 0 &&
                row[indexMap.openMortgageBalance] <
                    row[indexMap.newCashToSeller] - 5000
            ) {
                row[indexMap.note] =
                    "Loan balance may be paid off or close to it. Requires further exploration or some creative negotiating to be 100% Seller Financing.";
            }

            if (
                maxInterestRate > 0 &&
                row[indexMap.recordedMortgageInterestRate] > maxInterestRate
            ) {
                note += (note ? " " : "") + "Exceeded Maximum Interest Rate";
            }

            if (
                (acquisitionStrategy === "Subject To" ||
                    acquisitionStrategy === "Hybrid") &&
                maxEquityPercentage > 0 &&
                row[indexMap.estEquityPercentAdjusted] > maxEquityPercentage
            ) {
                note +=
                    (note ? " " : "") + "Exceeded Maximum Equity Percentage";
            }
        } catch (error) {
            console.error("Error in calculations:", error);
            note = "Error in calculations";
            acquisitionStrategy = "Error";
        }
    }

    row[indexMap.note] = note;
    row[indexMap.acquisitionStrategy] = acquisitionStrategy;

    console.log(
        `Processed row ${rowIndex}. Acquisition Strategy: ${acquisitionStrategy}, Note: ${note}`
    );

    return row;
}

/**
 * Creates an index map for quick access to specific columns.
 * @param {Object} columnMap - A map of column headers to their positions.
 * @returns {Object} An index map for quick column access.
 */
function createIndexMap(columnMap) {
    return {
        listingPrice: columnMap["Listing Price"] - 1,
        acquisitionStrategy: columnMap["Acquisition Strategy"] - 1,
        note: columnMap["Note"] - 1,
        estEquityPercentAdjusted: columnMap["Est. Equity Percent Adjusted"] - 1,
        recordedMortgageInterestRate:
            columnMap["Recorded Mortgage Interest Rate"] - 1,
    };
}

/**
 * Creates filtered sheets based on Acquisition Strategy without changing the active sheet.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 * @param {SpreadsheetApp.Sheet} mainSheet - The main sheet.
 * @param {Object} columnMap - A map of column headers to their positions.
 * @param {boolean} forceCreate - Whether to force create new sheets without prompting.
 */
function createFilteredSheets(ss, mainSheet, columnMap, forceCreate) {
    const activeSheet = ss.getActiveSheet();
    const headers = Object.keys(columnMap);
    const headerFormats = mainSheet
        .getRange(1, 1, 1, headers.length)
        .getNumberFormats()[0];
    const data = mainSheet
        .getRange(2, 1, mainSheet.getLastRow() - 1, headers.length)
        .getDisplayValues();

    ACQUISITION_STRATEGIES.forEach((strategy) => {
        const sheetName = strategy + " Leads";
        let existingSheet = ss.getSheetByName(sheetName);
        let shouldCreateSheet =
            !existingSheet ||
            forceCreate ||
            (existingSheet && showCustomDialog(sheetName) === "overwrite");

        if (shouldCreateSheet) {
            const filteredData = filterDataForStrategy(
                data,
                strategy,
                columnMap
            );

            if (filteredData.length > 0) {
                existingSheet = createOrClearSheet(
                    ss,
                    sheetName,
                    existingSheet
                );
                writeDataToSheet(
                    existingSheet,
                    headers,
                    headerFormats,
                    filteredData
                );
                formatSheet(existingSheet, columnMap);
            } else if (existingSheet) {
                ss.deleteSheet(existingSheet);
            }
        }
    });

    orderSheets(ss);
    ss.setActiveSheet(activeSheet);
}

/**
 * Filters data for a specific strategy.
 * @param {Array} data - The main sheet data.
 * @param {string} strategy - The strategy to filter for.
 * @param {Object} columnMap - Map of column indices.
 * @returns {Array} Filtered data for the strategy.
 */
function filterDataForStrategy(data, strategy, columnMap) {
    const indexMap = createIndexMap(columnMap);

    return data.filter((row) => {
        if (strategy === "Problem") {
            return row[indexMap.note] && row[indexMap.note].includes("Problem");
        } else if (strategy === "Other") {
            return (
                row[indexMap.acquisitionStrategy] === strategy ||
                (row[indexMap.note] &&
                    (row[indexMap.note].includes(
                        "Exceeded Maximum Equity Percentage"
                    ) ||
                        row[indexMap.note].includes(
                            "Exceeded Maximum Interest Rate"
                        )))
            );
        } else {
            return (
                row[indexMap.acquisitionStrategy] === strategy &&
                (!row[indexMap.note] ||
                    (!row[indexMap.note].includes(
                        "Exceeded Maximum Equity Percentage"
                    ) &&
                        !row[indexMap.note].includes(
                            "Exceeded Maximum Interest Rate"
                        )))
            );
        }
    });
}

/**
 * Creates or clears a sheet.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 * @param {string} sheetName - The name of the sheet.
 * @param {SpreadsheetApp.Sheet} existingSheet - The existing sheet, if any.
 * @returns {SpreadsheetApp.Sheet} The created or cleared sheet.
 */
function createOrClearSheet(ss, sheetName, existingSheet) {
    if (!existingSheet) {
        return ss.insertSheet(sheetName);
    }
    existingSheet.clear();
    return existingSheet;
}

/**
 * Writes data to a sheet.
 * @param {SpreadsheetApp.Sheet} sheet - The sheet to write to.
 * @param {Array} headers - The headers for the sheet.
 * @param {Array} headerFormats - The number formats for the headers.
 * @param {Array} data - The data to write to the sheet.
 */
function writeDataToSheet(sheet, headers, headerFormats, data) {
    sheet
        .getRange(1, 1, 1, headers.length)
        .setValues([headers])
        .setNumberFormats([headerFormats]);
    sheet.setFrozenRows(1);

    if (data.length > 0) {
        const targetRange = sheet.getRange(2, 1, data.length, headers.length);
        targetRange.setValues(data);
    }

    // Remove any excess rows
    if (sheet.getMaxRows() > data.length + 1) {
        sheet.deleteRows(data.length + 2, sheet.getMaxRows() - data.length - 1);
    }
}

/**
 * Formats a sheet.
 * @param {SpreadsheetApp.Sheet} sheet - The sheet to format.
 * @param {Object} columnMap - A map of column headers to their positions.
 */
function formatSheet(sheet, columnMap) {
    formatExistingColumns(sheet, columnMap);
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, sheet.getLastColumn());
    toggleSpecifiedColumns(sheet);
}

/**
 * Orders the sheets in the specified sequence.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 */
function orderSheets(ss) {
    const desiredOrder = [
        SHEET_NAMES.SETTINGS,
        ...ACQUISITION_STRATEGIES.map((strategy) => `${strategy} Leads`),
        SHEET_NAMES.PROPWIRE_IMPORTED,
        SHEET_NAMES.ORIGINAL_PROPWIRE,
    ];

    const sheets = ss.getSheets();
    const orderedSheets = new Array(desiredOrder.length);
    const otherSheets = [];

    // Separate sheets into ordered and other
    sheets.forEach((sheet) => {
        const name = sheet.getName();
        const orderIndex = desiredOrder.findIndex((prefix) =>
            name.startsWith(prefix)
        );

        if (orderIndex !== -1) {
            orderedSheets[orderIndex] = sheet;
        } else {
            otherSheets.push(sheet);
        }
    });

    // Combine ordered sheets with other sheets, removing any undefined entries
    const finalOrder = [...orderedSheets.filter(Boolean), ...otherSheets];

    // Reorder the sheets without changing the active sheet
    const activeSheet = ss.getActiveSheet();
    finalOrder.forEach((sheet, index) => {
        ss.setActiveSheet(sheet);
        ss.moveActiveSheet(index + 1);
    });

    // Ensure we're back on the original active sheet
    ss.setActiveSheet(activeSheet);
}

/**
 * Toggles the visibility of specified columns.
 * @param {SpreadsheetApp.Sheet} sheet - The sheet to modify.
 */
function toggleSpecifiedColumns(sheet) {
    if (CONFIG.HIDE_SPECIFIED_COLUMNS) {
        HIDDEN_COLUMNS.forEach((range) => {
            sheet.hideColumns(range.start, range.end - range.start + 1);
        });
    } else {
        HIDDEN_COLUMNS.forEach((range) => {
            sheet.showColumns(range.start, range.end - range.start + 1);
        });
    }
}

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

    return {
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
}

/**
 * Generates the formula for New Cash To Seller.
 * @param {Function} getCell - Function to get cell references.
 * @returns {string} The formula for New Cash To Seller.
 */
function newCashToSellerFormula(getCell) {
    return `=IF(${getCell("Est. Cash To Seller")} > 20000, 20000, 
    IF(AND(${getCell("Est. Cash To Seller")} >= 0, ${getCell(
        "Est. Cash To Seller"
    )} <= 20000), 
      FLOOR(${getCell("Est. Cash To Seller")}, 500), 
    IF(AND(${getCell("Est. Cash To Seller")} >= -5000, ${getCell(
        "Est. Cash To Seller"
    )} < 0), 1500, 
    IF(AND(${getCell("Est. Cash To Seller")} >= -10000, ${getCell(
        "Est. Cash To Seller"
    )} < -5000), 1000, 500))))`;
}

/**
 * Generates the formula for Offer Price.
 * @param {Function} getCell - Function to get cell references.
 * @returns {string} The formula for Offer Price.
 */
function offerPriceFormula(getCell) {
    return `=IF(${getCell("Open Mortgage Balance")} > 0, 
    IF(${getCell("Est. Equity Adjusted")} >= (${getCell(
        "New Cash To Seller"
    )} + ${getCell("Est. Closing Costs")} + ${getCell("Est. Agent Fee")}), 
      FLOOR(${getCell("Open Mortgage Balance")} + (${getCell(
        "Est. Equity Adjusted"
    )} - ${getCell("Est. Closing Costs")} - ${getCell(
        "Est. Agent Fee"
    )}), 500), 
      FLOOR(${getCell("Open Mortgage Balance")} + ${getCell(
        "New Cash To Seller"
    )}, 500)), 
    ${getCell("Listing Price")} - ${getCell("Est. Closing Costs")} - ${getCell(
        "Est. Agent Fee"
    )})`;
}

/**
 * Generates the formula for Acquisition Strategy.
 * @param {Function} getCell - Function to get cell references.
 * @returns {string} The formula for Acquisition Strategy.
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
    )} * 1.5), 
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

/**
 * Generates the formula for the Note column.
 * @param {Function} getCell - Function to get cell references.
 * @returns {string} The formula for the Note column.
 */
function noteFormula(getCell) {
    return `=IF(${getCell("Offer Price")} > ${getCell("Listing Price")}, 
    "Problem - possibly upside down, a short-sale, the listing price is incorrect, or the loan balance is incorrect. Further exploration is required.",
    IF(AND(OR(${getCell("Open Mortgage Balance")} > 0, ISBLANK(${getCell(
        "Open Mortgage Balance"
    )})),
           ${getCell("Open Mortgage Balance")} < (${getCell(
        "New Cash To Seller"
    )} - 5000)),
      "Loan balance may be paid off or close to it. Requires further exploration or some creative negotiating to be 100% Seller Financing.",
    ""))`;
}

/**
 * Evaluates a formula or returns the value if it's not a formula.
 * @param {string} formula - The formula to evaluate.
 * @param {Array} row - The row data.
 * @param {Object} columnMap - A map of column headers to their positions.
 * @param {Object} settings - The settings object.
 * @returns {*} The evaluated result.
 */
function evaluateFormula(formula, row, columnMap, settings) {
    console.log("Evaluating formula:", formula);

    if (typeof formula !== "string" || !formula.startsWith("=")) {
        return formula;
    }

    // Remove the '=' at the start of the formula
    formula = formula.substring(1);

    try {
        // Replace cell references with actual values
        Object.entries(columnMap).forEach(([header, colIndex]) => {
            const cellRef = columnToLetter(colIndex);
            const regex = new RegExp(cellRef + "\\d+", "g");
            const value = row[colIndex - 1];
            formula = formula.replace(
                regex,
                value !== undefined && value !== "" ? value : 0
            );
        });

        // Replace settings references
        Object.entries(settings).forEach(([key, value]) => {
            const regex = new RegExp(`Settings!\\$C\\$${key}`, "g");
            formula = formula.replace(regex, value);
        });

        // Convert Excel IF statements to JavaScript ternary operators
        formula = formula.replace(/IF\((.*?),(.*?),(.*?)\)/g, "($1)?($2):($3)");

        // Replace AND and OR functions
        formula = formula
            .replace(/AND\((.*?)\)/g, "($1)")
            .replace(/OR\((.*?)\)/g, "($1)");

        // Replace ISBLANK with a null check
        formula = formula.replace(/ISBLANK\((.*?)\)/g, '($1===null||$1==="")');

        console.log("Processed formula:", formula);

        // Evaluate the formula
        const result = new Function(`return ${formula}`)();
        console.log("Evaluation result:", result);
        return result;
    } catch (error) {
        console.error(`Error evaluating formula: ${formula}`);
        console.error(error);
        return "#ERROR!";
    }
}

/**
 * Gets settings from the Settings sheet.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 * @returns {Object} An object containing the settings.
 * @throws {Error} If the Settings sheet is not found or is improperly formatted.
 */
function getSettings(ss) {
    const settingsSheet = ss.getSheetByName(SHEET_NAMES.SETTINGS);
    if (!settingsSheet) {
        throw new Error(
            `${SHEET_NAMES.SETTINGS} sheet not found. Please ensure it exists and try again.`
        );
    }

    const settingsRange = settingsSheet.getRange("B3:C10").getDisplayValues();
    return settingsRange.reduce((settings, [key, value]) => {
        const sanitizedKey = key
            .replace(/\s+/g, "")
            .replace(/[^a-zA-Z0-9]/g, "");
        settings[sanitizedKey] = value;
        return settings;
    }, {});
}

/**
 * Formats existing columns in the sheet.
 * @param {SpreadsheetApp.Sheet} sheet - The sheet to format.
 * @param {Object} columnMap - The map of existing columns.
 */
function formatExistingColumns(sheet, columnMap) {
    const columnFormats = {
        currency: [
            "Listing Price",
            "Last Sale Amount",
            "Estimated Value",
            "Estimated Equity",
            "Open Mortgage Balance",
            "Tax Amount",
            "Assessed Total Value",
            "Assessed Land Value",
            "Assessed Improvement Value",
            "Market Value",
            "Market Land Value",
            "Market Improvement Value",
            "Default Amount",
            "Opening bid",
            "Est. Equity Adjusted",
            "Est. Agent Fee",
            "Est. Closing Costs",
            "Est. Cash To Seller",
            "New Cash To Seller",
            "Offer Price",
            "New Agent Fee",
            "Total Cost",
            "Cash Offer - High",
            "Cash Offer - Low",
            "Entry Fee w/o CC",
            "Entry Fee w/ CC",
        ],
        percentageOriginal: [
            "Estimated Equity Percent",
            "Recorded Mortgage Interest Rate",
            "Assessed Improvement Percentage",
            "Market Improvement Percentage",
        ],
        percentageCalculated: [
            "Est. Equity Percent Adjusted",
            "Offer To Asking",
            "Entry Fee w/o CC %",
            "Entry Fee w/ CC %",
        ],
    };

    Object.entries(columnFormats).forEach(([format, headers]) => {
        headers.forEach((header) => {
            if (columnMap.hasOwnProperty(header)) {
                const colIndex = columnMap[header];
                const range = sheet.getRange(
                    2,
                    colIndex,
                    sheet.getLastRow() - 1
                );

                if (format === "currency") {
                    range.setNumberFormat("$#,##0.00");
                } else if (format === "percentageOriginal") {
                    // Get the current values
                    const values = range.getDisplayValues();

                    // Convert the values to the correct decimal form if necessary
                    const correctedValues = values.map((row) => {
                        let value = parseFloat(row[0]);
                        // If the value is greater than 1, assume it's not in decimal form and divide by 100
                        return [
                            isNaN(value) ? 0 : value > 1 ? value / 100 : value,
                        ];
                    });

                    // Set the corrected values
                    range.setValues(correctedValues);

                    // Now apply the percentage format
                    range.setNumberFormat("0.00%");
                } else if (format === "percentageCalculated") {
                    // These are already calculated correctly, just apply the format
                    range.setNumberFormat("0.00%");
                }
            }
        });
    });
}

/**
 * Creates a map of column headers to their positions.
 * @param {Array} headers - The array of header values.
 * @returns {Object} A map of column headers to their positions.
 */
function createColumnMap(headers) {
    return headers.reduce((map, header, index) => {
        map[header] = index + 1;
        return map;
    }, {});
}

/**
 * Converts a column number to a column letter (e.g., 1 -> A, 27 -> AA).
 * @param {number} columnNumber - The column number to convert.
 * @returns {string} The column letter(s).
 */
function columnToLetter(columnNumber) {
    let columnLetter = "";
    while (columnNumber > 0) {
        columnNumber--;
        columnLetter =
            String.fromCharCode(65 + (columnNumber % 26)) + columnLetter;
        columnNumber = Math.floor(columnNumber / 26);
    }
    return columnLetter;
}

/**
 * Prompts the user about creating filtered sheets.
 * @param {SpreadsheetApp.Ui} ui - The UI for displaying prompts.
 * @param {boolean} fromUI - Whether the function is called from the UI.
 * @returns {boolean} True if the user wants to create filtered sheets, false otherwise.
 */
function promptUserForFilteredSheets(ui, fromUI) {
    if (fromUI) {
        const response = ui.alert(
            "Create Filtered Sheets",
            "Do you want to create individual sheets for each acquisition strategy now?",
            ui.ButtonSet.YES_NO
        );
        console.log(
            `User response for creating filtered sheets: ${
                response === ui.Button.YES
            }`
        );
        return response === ui.Button.YES;
    } else {
        console.log("Prompt: Create filtered sheets? Assuming Yes.");
        return true;
    }
}

/**
 * Shows a custom dialog and returns the user's choice.
 * @param {string} sheetName - The name of the sheet being processed.
 * @returns {string} The user's choice: 'overwrite', 'append', or 'skip'.
 */
function showCustomDialog(sheetName) {
    const html = HtmlService.createHtmlOutputFromFile("SheetActionDialog")
        .setWidth(400)
        .setHeight(300);

    PropertiesService.getScriptProperties().setProperty(
        "dialogTitle",
        `The sheet "${sheetName}" already exists. What would you like to do?`
    );

    const userInterface = SpreadsheetApp.getUi();
    userInterface.showModalDialog(html, "Sheet Action");

    // Wait for user input
    let action = "";
    const startTime = new Date().getTime();
    const timeout = 60000; // 1 minute timeout
    while (action === "" && new Date().getTime() - startTime < timeout) {
        Utilities.sleep(100);
        action =
            PropertiesService.getScriptProperties().getProperty("userAction") ||
            "";
    }

    if (action === "") {
        throw new Error("User action timeout. Operation cancelled.");
    }

    // Clear the properties for the next use
    PropertiesService.getScriptProperties().deleteProperty("userAction");
    PropertiesService.getScriptProperties().deleteProperty("dialogTitle");

    return action;
}

/**
 * Gets the dialog title from script properties.
 * @returns {string} The dialog title.
 */
function getDialogTitle() {
    return (
        PropertiesService.getScriptProperties().getProperty("dialogTitle") || ""
    );
}

/**
 * Processes the user's choice from the custom dialog.
 * @param {string} action - The user's chosen action.
 */
function processUserChoice(action) {
    PropertiesService.getScriptProperties().setProperty("userAction", action);
}

/**
 * Function to create individual sheets by acquisition strategy.
 */
function createIndividualSheets() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const propwireSheets = ss
        .getSheets()
        .filter((sheet) =>
            sheet.getName().startsWith(SHEET_NAMES.PROPWIRE_IMPORTED)
        );

    if (propwireSheets.length === 0) {
        SpreadsheetApp.getUi().alert(
            'No sheet found starting with "Propwire Imported." Please run "Filter On-Market Records" first.'
        );
        return;
    }

    const mainSheet =
        propwireSheets.length === 1
            ? propwireSheets[0]
            : promptUserForSheet(propwireSheets);

    if (!mainSheet) return; // User cancelled the operation

    const headers = mainSheet
        .getRange(1, 1, 1, mainSheet.getLastColumn())
        .getDisplayValues()[0];
    const columnMap = createColumnMap(headers);

    createFilteredSheets(ss, mainSheet, columnMap, false);
    orderSheets(ss);
}

/**
 * Prompts the user to select a sheet when multiple options are available.
 * @param {Array<SpreadsheetApp.Sheet>} sheets - Array of sheet objects to choose from.
 * @returns {SpreadsheetApp.Sheet|null} The selected sheet or null if cancelled.
 */
function promptUserForSheet(sheets) {
    const ui = SpreadsheetApp.getUi();
    const sheetOptions = sheets
        .map((sheet, index) => `${index + 1}. ${sheet.getName()}`)
        .join("\n");

    const response = ui.prompt(
        "Select a Sheet",
        `Multiple sheets starting with "${SHEET_NAMES.PROPWIRE_IMPORTED}" found. Enter the number of the sheet to use:\n\n${sheetOptions}`,
        ui.ButtonSet.OK_CANCEL
    );

    if (response.getSelectedButton() === ui.Button.OK) {
        const selection = parseInt(response.getResponseText()) - 1;
        if (selection >= 0 && selection < sheets.length) {
            return sheets[selection];
        }
        ui.alert("Invalid selection. Operation cancelled.");
    }
    return null;
}

/**
 * Finds a sheet based on a name condition.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 * @param {Function} condition - A function that takes a sheet name and returns a boolean.
 * @returns {SpreadsheetApp.Sheet|undefined} The found sheet or undefined.
 */
function findSheet(ss, condition) {
    return ss.getSheets().find((sheet) => condition(sheet.getName()));
}

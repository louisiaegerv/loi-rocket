// Filter-Project.js main library; stored on xybermatthew.com and is the main library for Filter-Read-Estate-Leads.js

// Global variables and configuration
const CONFIG = {
    COPY_ORIGINAL_SHEET: true, // Set to false if you don't want to copy the original sheet
    DELETE_CREATED_SHEETS: true, // Set to false if you want to keep the original created sheets
    INCLUDE_FORMULAS: true, // Set to false if you want to calculate values instead of including formulas
    DISPLAY_COLUMN_MAPPING: false, // Set to false to skip the column mapping review
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

/**
 * Creates a custom menu when the spreadsheet is opened.
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu("Property Filter")
        .addItem("Filter Records", "filterRecords")
        .addItem(
            "Create Individual Sheets by Acquisition Strategy",
            "createIndividualSheets"
        )
        .addToUi();
}

/**
 * Main function to filter on-market records.
 * This function orchestrates the entire filtering process.
 */
function filterRecords() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();

    // Check if we're continuing after a column mapping review
    if (handleColumnMappingReview(ss, ui)) return;

    // Prepare sheets
    if (CONFIG.DELETE_CREATED_SHEETS) deleteExistingSheets(ss);
    if (CONFIG.COPY_ORIGINAL_SHEET) copyOriginalSheet(ss);
    const mainSheet = getOrCreateMainSheet(ss);

    // Process data
    const columnMap = addAndFormatNewColumns(mainSheet);
    if (CONFIG.DISPLAY_COLUMN_MAPPING) {
        displayColumnMappingForReview(ss, columnMap);
        return;
    }

    // Perform calculations
    const settings = getSettings(ss);
    performCalculations(mainSheet, columnMap, settings);

    // Create filtered sheets if user agrees
    if (promptUserForFilteredSheets(ui)) {
        createFilteredSheets(ss, mainSheet, columnMap, false);
    } else {
        ui.alert(
            'Filtered sheets were not created. You can create them later using the "Create Individual Sheets by Acquisition Strategy" menu option.'
        );
    }

    // Final steps
    orderSheets(ss);
    ui.alert("Processing completed successfully.");
}

// Helper function to find the main sheet
function findMainSheet(ss) {
    // First, try to find a sheet that starts with "Propwire Imported"
    var sheet = ss
        .getSheets()
        .find((sheet) => sheet.getName().startsWith("Propwire Imported"));

    // If not found, look for a sheet named "Propwire Export" or similar
    if (!sheet) {
        sheet = ss
            .getSheets()
            .find((sheet) => sheet.getName().startsWith("Propwire Export"));
    }

    // If still not found, use the active sheet (as a last resort)
    if (!sheet) {
        sheet = ss.getActiveSheet();
    }

    return sheet;
}

/**
 * Handles the column mapping review process.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 * @param {SpreadsheetApp.Ui} ui - The UI for displaying alerts.
 * @returns {boolean} True if the process should be halted, false otherwise.
 */
function handleColumnMappingReview(ss, ui) {
    const mappingSheet = ss.getSheetByName(SHEET_NAMES.MAPPED_COLUMNS);
    if (!mappingSheet) return false;

    const response = ui.alert(
        "Continue Processing?",
        "Do you want to continue processing after reviewing the column mapping?",
        ui.ButtonSet.YES_NO
    );

    if (response !== ui.Button.YES) {
        ui.alert("Operation cancelled by user.");
        return true;
    }

    ss.deleteSheet(mappingSheet);
    return false;
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
 * Prompts the user about creating filtered sheets.
 * @param {SpreadsheetApp.Ui} ui - The UI for displaying prompts.
 * @returns {boolean} True if the user wants to create filtered sheets, false otherwise.
 */
function promptUserForFilteredSheets(ui) {
    const response = ui.alert(
        "Create Filtered Sheets",
        "Do you want to create individual sheets for each acquisition strategy now?",
        ui.ButtonSet.YES_NO
    );
    return response === ui.Button.YES;
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
        .getValues()[0];
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
 * Finds a sheet based on a name condition.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 * @param {Function} condition - A function that takes a sheet name and returns a boolean.
 * @returns {SpreadsheetApp.Sheet|undefined} The found sheet or undefined.
 */
function findSheet(ss, condition) {
    return ss.getSheets().find((sheet) => condition(sheet.getName()));
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
 * Adds and formats new columns.
 * @param {SpreadsheetApp.Sheet} sheet - The main sheet.
 * @returns {Object} A map of column headers to their positions.
 */
function addAndFormatNewColumns(sheet) {
    const headers = sheet
        .getRange(1, 1, 1, sheet.getLastColumn())
        .getValues()[0];
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
                    const values = range.getValues();

                    // Convert the values to the correct decimal form if necessary
                    const correctedValues = values.map((row) => {
                        let value = row[0];
                        // If the value is greater than 1, assume it's not in decimal form and divide by 100
                        return [value > 1 ? value / 100 : value];
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
 * Creates a new sheet with column mapping for review.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 * @param {Object} columnMap - A map of column headers to their positions.
 */
function displayColumnMappingForReview(ss, columnMap) {
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
    SpreadsheetApp.getUi().alert(
        "Column Mapping Review",
        'A new sheet "Mapped Columns" has been created with the current column mapping.\n\n' +
            "Please review the mapping and then run the script again to continue processing.",
        SpreadsheetApp.getUi().ButtonSet.OK
    );

    // Throw an error to pause the script execution
    throw new Error(
        "Script paused for column mapping review. Please review the 'Mapped Columns' sheet and run the script again to continue."
    );
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

    const settingsRange = settingsSheet.getRange("B3:C10").getValues();
    return settingsRange.reduce((settings, [key, value]) => {
        const sanitizedKey = key
            .replace(/\s+/g, "")
            .replace(/[^a-zA-Z0-9]/g, "");
        settings[sanitizedKey] = value;
        return settings;
    }, {});
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
    if (typeof formula === "string" && formula.startsWith("=")) {
        // Remove the '=' at the start of the formula
        formula = formula.substring(1);

        // Replace cell references with actual values
        Object.entries(columnMap).forEach(([header, colIndex]) => {
            const cellRef = columnToLetter(colIndex) + (row.index + 2);
            const regex = new RegExp(cellRef, "g");
            formula = formula.replace(regex, row[colIndex - 1] || 0); // Use 0 if the value is undefined
        });

        // Replace settings references
        Object.entries(settings).forEach(([key, value]) => {
            const regex = new RegExp(`Settings!\\$C\\$${key}`, "g");
            formula = formula.replace(regex, value);
        });

        // Replace common spreadsheet functions with JavaScript equivalents
        formula = formula
            .replace(/FLOOR\(/g, "Math.floor(")
            .replace(/AND\(/g, "&&")
            .replace(/OR\(/g, "||")
            .replace(/IF\(/g, "(")
            .replace(/,/g, "?")
            .replace(/:/g, ":");

        // Evaluate the formula
        try {
            // Use Function instead of eval for slightly better security
            return new Function(`return ${formula}`)();
        } catch (error) {
            console.error(`Error evaluating formula: ${formula}`);
            return "#ERROR!";
        }
    }
    return formula;
}

/**
 * Performs calculations for each row.
 * @param {SpreadsheetApp.Sheet} sheet - The main sheet.
 * @param {Object} columnMap - A map of column headers to their positions.
 * @param {Object} settings - The settings object.
 */
function performCalculations(sheet, columnMap, settings) {
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();

    const calculationBatch = [];
    const nonEmptyRows = [];

    data.forEach((row, rowIndex) => {
        if (row.some((cell) => cell !== "" && cell != null)) {
            nonEmptyRows.push(row);
            if (row[columnMap["Listing Price"] - 1] === "") {
                calculationBatch.push({
                    range: sheet.getRange(
                        nonEmptyRows.length + 1,
                        columnMap["Acquisition Strategy"]
                    ),
                    value: "Other",
                });
            } else {
                const calculations = calculateValues(
                    row,
                    columnMap,
                    settings,
                    nonEmptyRows.length - 1
                );
                Object.entries(calculations).forEach(([key, value]) => {
                    const col = columnMap[key];
                    if (col) {
                        // Only add to batch if the column exists
                        calculationBatch.push({
                            range: sheet.getRange(nonEmptyRows.length + 1, col),
                            value: value,
                            isFormula:
                                typeof value === "string" &&
                                value.startsWith("="),
                        });
                    }
                });
            }
        }
    });

    // Update the sheet with non-empty rows
    sheet
        .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
        .clearContent();
    if (nonEmptyRows.length > 0) {
        sheet
            .getRange(2, 1, nonEmptyRows.length, nonEmptyRows[0].length)
            .setValues(nonEmptyRows);
    }

    // Apply all calculations in batches
    const batchSize = 1000; // Adjust this value based on your needs
    for (let i = 0; i < calculationBatch.length; i += batchSize) {
        const batch = calculationBatch.slice(i, i + batchSize);
        batch.forEach((item) => {
            if (item.range) {
                // Only set value if range exists
                if (CONFIG.INCLUDE_FORMULAS && item.isFormula) {
                    item.range.setFormula(item.value);
                } else {
                    item.range.setValue(
                        CONFIG.INCLUDE_FORMULAS
                            ? item.value
                            : evaluateFormula(
                                  item.value,
                                  nonEmptyRows[item.range.getRow() - 2],
                                  columnMap,
                                  settings
                              )
                    );
                }
            }
        });
    }

    // Format columns, freeze first row, and adjust column widths
    formatExistingColumns(sheet, columnMap);
    sheet.setFrozenRows(1);

    // Add delay before resizing columns
    Utilities.sleep(2000); // 2 second delay
    sheet.autoResizeColumns(1, sheet.getLastColumn());

    // Remove any excess rows
    if (sheet.getMaxRows() > nonEmptyRows.length + 1) {
        sheet.deleteRows(
            nonEmptyRows.length + 2,
            sheet.getMaxRows() - nonEmptyRows.length - 1
        );
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
 * Creates filtered sheets based on Acquisition Strategy without changing the active sheet.
 * @param {SpreadsheetApp.Spreadsheet} ss - The active spreadsheet.
 * @param {SpreadsheetApp.Sheet} mainSheet - The main sheet.
 * @param {Object} columnMap - A map of column headers to their positions.
 * @param {boolean} forceCreate - Whether to force create new sheets without prompting.
 */
function createFilteredSheets(ss, mainSheet, columnMap, forceCreate) {
    // Store the current active sheet
    const activeSheet = ss.getActiveSheet();

    // If mainSheet is not provided, try to find it
    if (!mainSheet) {
        mainSheet = findMainSheet(ss);
    }

    // If we still don't have a main sheet, show an error and exit
    if (!mainSheet) {
        console.error("Unable to find the main sheet");
        SpreadsheetApp.getUi().alert(
            'Error: Unable to find the main Propwire data sheet. Please make sure you have run "Filter On-Market Records" first.'
        );
        return;
    }

    // If columnMap is not provided, try to recreate it
    if (!columnMap) {
        const headers = mainSheet
            .getRange(1, 1, 1, mainSheet.getLastColumn())
            .getValues()[0];
        columnMap = createColumnMap(headers);
    }

    var strategies = [
        "Subject To",
        "Hybrid",
        "Seller Financing",
        "Other",
        "Problem",
    ];
    var headers = mainSheet
        .getRange(1, 1, 1, mainSheet.getLastColumn())
        .getValues()[0];
    var headerFormats = mainSheet
        .getRange(1, 1, 1, mainSheet.getLastColumn())
        .getNumberFormats()[0];
    var acquisitionStrategyIndex = headers.indexOf("Acquisition Strategy");
    var noteIndex = headers.indexOf("Note");

    // If we don't have an acquisition strategy column, show an error and exit
    if (acquisitionStrategyIndex === -1) {
        SpreadsheetApp.getUi().alert(
            'Error: "Acquisition Strategy" column not found in the main sheet.'
        );
        return;
    }

    // Create or update filtered sheets without changing the active sheet
    strategies.forEach((strategy) => {
        const sheetName = strategy + " Leads";
        let existingSheet = ss.getSheetByName(sheetName);
        let shouldCreateSheet = false;

        if (existingSheet && !forceCreate) {
            const action = showCustomDialog(sheetName);
            if (action === "skip") return;
            if (action === "overwrite") {
                existingSheet.clear();
                shouldCreateSheet = true;
            }
        } else {
            shouldCreateSheet = true;
        }

        if (shouldCreateSheet) {
            // Process data in batches to check if we need to create this sheet
            const batchSize = 1000;
            let startRow = 2; // Start from the second row of the main sheet (after headers)
            const mainSheetLastRow = mainSheet.getLastRow();
            let hasData = false;

            while (startRow <= mainSheetLastRow && !hasData) {
                const endRow = Math.min(
                    startRow + batchSize - 1,
                    mainSheetLastRow
                );
                const rowCount = endRow - startRow + 1;
                if (rowCount <= 0) break; // Ensure we're not trying to get a range with 0 or negative rows

                const batchRange = mainSheet.getRange(
                    startRow,
                    1,
                    rowCount,
                    headers.length
                );
                const batchValues = batchRange.getValues();

                hasData = batchValues.some((row) => {
                    if (strategy === "Problem") {
                        return (
                            row[noteIndex] &&
                            row[noteIndex].toString().startsWith("Problem")
                        );
                    } else if (strategy === "Subject To") {
                        return (
                            row[acquisitionStrategyIndex] === strategy &&
                            (!row[noteIndex] ||
                                !row[noteIndex]
                                    .toString()
                                    .startsWith("Problem"))
                        );
                    } else {
                        return row[acquisitionStrategyIndex] === strategy;
                    }
                });

                startRow = endRow + 1;
            }

            if (hasData) {
                if (!existingSheet) {
                    existingSheet = ss.insertSheet(sheetName);
                    ss.setActiveSheet(activeSheet); // Immediately set back to the original active sheet
                }

                // Set up the header
                existingSheet
                    .getRange(1, 1, 1, headers.length)
                    .setValues([headers])
                    .setNumberFormats([headerFormats]);
                existingSheet.setFrozenRows(1);

                // Process data in batches
                startRow = 2;
                let targetRow = 2; // Start writing data from the second row of the target sheet

                while (startRow <= mainSheetLastRow) {
                    const endRow = Math.min(
                        startRow + batchSize - 1,
                        mainSheetLastRow
                    );
                    const rowCount = endRow - startRow + 1;
                    if (rowCount <= 0) break; // Ensure we're not trying to get a range with 0 or negative rows

                    const batchRange = mainSheet.getRange(
                        startRow,
                        1,
                        rowCount,
                        headers.length
                    );
                    const batchValues = batchRange.getValues();
                    const batchFormats = batchRange.getNumberFormats();
                    const batchBackgrounds = batchRange.getBackgrounds();
                    const batchFontColors = batchRange.getFontColors();

                    const filteredBatch = batchValues.reduce(
                        (acc, row, index) => {
                            if (
                                strategy === "Problem" &&
                                row[noteIndex] &&
                                row[noteIndex].toString().startsWith("Problem")
                            ) {
                                acc.values.push(row);
                                acc.formats.push(batchFormats[index]);
                                acc.backgrounds.push(batchBackgrounds[index]);
                                acc.fontColors.push(batchFontColors[index]);
                            } else if (
                                strategy === "Subject To" &&
                                row[acquisitionStrategyIndex] === strategy &&
                                (!row[noteIndex] ||
                                    !row[noteIndex]
                                        .toString()
                                        .startsWith("Problem"))
                            ) {
                                acc.values.push(row);
                                acc.formats.push(batchFormats[index]);
                                acc.backgrounds.push(batchBackgrounds[index]);
                                acc.fontColors.push(batchFontColors[index]);
                            } else if (
                                strategy !== "Problem" &&
                                strategy !== "Subject To" &&
                                row[acquisitionStrategyIndex] === strategy
                            ) {
                                acc.values.push(row);
                                acc.formats.push(batchFormats[index]);
                                acc.backgrounds.push(batchBackgrounds[index]);
                                acc.fontColors.push(batchFontColors[index]);
                            }
                            return acc;
                        },
                        {
                            values: [],
                            formats: [],
                            backgrounds: [],
                            fontColors: [],
                        }
                    );

                    if (filteredBatch.values.length > 0) {
                        const targetRange = existingSheet.getRange(
                            targetRow,
                            1,
                            filteredBatch.values.length,
                            headers.length
                        );
                        targetRange.setValues(filteredBatch.values);
                        targetRange.setNumberFormats(filteredBatch.formats);
                        targetRange.setBackgrounds(filteredBatch.backgrounds);
                        targetRange.setFontColors(filteredBatch.fontColors);

                        targetRow += filteredBatch.values.length;
                    }

                    startRow = endRow + 1;
                    SpreadsheetApp.flush();
                }

                // Remove any excess rows
                if (existingSheet.getMaxRows() > targetRow - 1) {
                    existingSheet.deleteRows(
                        targetRow,
                        existingSheet.getMaxRows() - targetRow + 1
                    );
                }

                // Format columns and adjust column widths
                formatExistingColumns(existingSheet, columnMap);
                existingSheet.setFrozenRows(1);
                existingSheet.autoResizeColumns(
                    1,
                    existingSheet.getLastColumn()
                );
            } else if (existingSheet) {
                // If there's no data for this strategy and the sheet exists, delete it
                ss.deleteSheet(existingSheet);
            }
        }
    });

    // Order the sheets after creating filtered sheets, without changing the active sheet
    orderSheets(ss);

    // Ensure we're back on the original active sheet
    ss.setActiveSheet(activeSheet);
}

/**
 * Shows a custom dialog and returns the user's choice.
 * @param {string} sheetName - The name of the sheet being processed.
 * @returns {string} The user's choice: 'overwrite', 'append', or 'skip'.
 **/
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

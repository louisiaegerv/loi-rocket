function generateRandomListing() {
  const streets = [
    "Main St",
    "Elm St",
    "Oak Ave",
    "Pine St",
    "Maple Dr",
    "Cedar Ln",
  ];
  const cities = [
    "Anytown",
    "Big City",
    "Small Town",
    "Metropolis",
    "Suburbia",
    "Riverside",
  ];
  const states = ["CA", "NY", "TX", "FL", "IL", "OH"];
  const propertyTypes = [
    "Single-Family Home",
    "Condo",
    "Townhouse",
    "Multi-Family",
  ];
  const lenders = [
    "Acme Mortgage",
    "XYZ Bank",
    "First National Bank",
    "City Credit Union",
  ];
  const loanTypes = ["30-Year Fixed", "15-Year Fixed", "ARM", "FHA"];
  const brokerages = [
    "ABC Realty",
    "DEF Realty",
    "GHI Real Estate",
    "JKL Properties",
  ];
  const statuses = ["Active", "Pending", "Sold", "Withdrawn"];
  const tagColors = ["yellow", "teal", "pink", "green", "blue", "purple"];
  const tagValues = [
    "Pool",
    "Garage",
    "Nice yard",
    "Renovated",
    "View",
    "Fireplace",
  ];

  const randomDate = (start, end) => {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    )
      .toISOString()
      .split("T")[0];
  };

  const randomTags = () => {
    const numTags = Math.floor(Math.random() * 3) + 1;
    return Array.from({ length: numTags }, () => ({
      color: tagColors[Math.floor(Math.random() * tagColors.length)],
      value: tagValues[Math.floor(Math.random() * tagValues.length)],
      type: "basic",
    }));
  };

  return {
    propAddress: `${Math.floor(Math.random() * 1000)} ${
      streets[Math.floor(Math.random() * streets.length)]
    }`,
    propCity: cities[Math.floor(Math.random() * cities.length)],
    propStateRegion: states[Math.floor(Math.random() * states.length)],
    listingPrice: Math.floor(Math.random() * 2000000) + 100000,
    propEstValue: Math.floor(Math.random() * 2000000) + 100000,
    loan1Balance: Math.floor(Math.random() * 1500000) + 50000,
    loan1InterestRate: (Math.random() * 3 + 2).toFixed(2),
    propBedroomsNumber: Math.floor(Math.random() * 5) + 1,
    propBathroomsNumber: Math.floor(Math.random() * 4) + 1,
    propBuildingSqft: Math.floor(Math.random() * 3000) + 1000,
    propLotSizeSqft: Math.floor(Math.random() * 15000) + 2000,
    propApn: Math.floor(Math.random() * 10000000000).toString(),
    propType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
    propLastSaleAmount: Math.floor(Math.random() * 1500000) + 50000,
    propLastSaleDate: randomDate(new Date(2020, 0, 1), new Date()),
    propAssessedTotalValue: Math.floor(Math.random() * 2000000) + 100000,
    propVacant: Math.random() < 0.5,
    ownerOccupied: Math.random() < 0.5,
    loan1Lender: lenders[Math.floor(Math.random() * lenders.length)],
    loan1OrgDate: randomDate(new Date(2015, 0, 1), new Date()),
    loan1Type: loanTypes[Math.floor(Math.random() * loanTypes.length)],
    brokerageName: brokerages[Math.floor(Math.random() * brokerages.length)],
    agentFullName: `${
      ["John", "Jane", "Mike", "Sarah"][Math.floor(Math.random() * 4)]
    } ${["Doe", "Smith", "Johnson", "Brown"][Math.floor(Math.random() * 4)]}`,
    agentPhone: `(${Math.floor(Math.random() * 900) + 100}) ${
      Math.floor(Math.random() * 900) + 100
    }-${Math.floor(Math.random() * 9000) + 1000}`,
    agentEmail: `agent${Math.floor(Math.random() * 1000)}@example.com`,
    listingDate: randomDate(new Date(2022, 0, 1), new Date()),
    listingStatus: statuses[Math.floor(Math.random() * statuses.length)],
    mailingAddress: `${Math.floor(Math.random() * 1000)} ${
      streets[Math.floor(Math.random() * streets.length)]
    }`,
    mailingCity: cities[Math.floor(Math.random() * cities.length)],
    mailingStateRegion: states[Math.floor(Math.random() * states.length)],
    mailingZipPostalCode: Math.floor(Math.random() * 90000) + 10000,
    tags: randomTags(),
  };
}

function generateListings(count) {
  return Array.from({ length: count }, generateRandomListing);
}

// Generate 10 random listings
const dataFull = generateListings(10);
console.log(JSON.stringify(dataFull, null, 2));

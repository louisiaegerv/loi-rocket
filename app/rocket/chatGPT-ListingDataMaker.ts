type Tag = {
  color: string;
  value: string;
  type: string;
};

type ListingFull = {
  propAddress: string;
  propCity: string;
  propStateRegion: string;
  listingPrice: number;
  propEstValue: number;
  loan1Balance: number;
  loan1InterestRate: number;
  propBedroomsNumber: number;
  propBathroomsNumber: number;
  propBuildingSqft: number;
  propLotSizeSqft: number;
  propApn: string;
  propType: string;
  propLastSaleAmount: number;
  propLastSaleDate: string;
  propAssessedTotalValue: number;
  propVacant: boolean;
  ownerOccupied: boolean;
  loan1Lender: string;
  loan1OrgDate: string;
  loan1Type: string;
  brokerageName: string;
  agentFullName: string;
  agentPhone: string;
  agentEmail: string;
  listingDate: string;
  listingStatus: string;
  mailingAddress: string;
  mailingCity: string;
  mailingStateRegion: string;
  mailingZipPostalCode: string;
  tags: Tag[];
};

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateListings = (count: number): ListingFull[] => {
  const cities = ["Anytown", "Big City", "Smallville", "Lakeview"];
  const states = ["CA", "NY", "TX", "FL"];
  const streetNames = ["Main", "Elm", "Oak", "Pine", "Maple"];
  const propertyTypes = [
    "Single-Family Home",
    "Condo",
    "Townhouse",
    "Apartment",
  ];
  const statuses = ["Active", "Pending", "Sold"];
  const lenders = ["Acme Mortgage", "XYZ Bank", "ABC Lenders"];
  const agentNames = [
    "John Doe",
    "Jane Smith",
    "Michael Johnson",
    "Emily Davis",
  ];
  const realtyNames = ["ABC Realty", "DEF Realty", "GHI Realty"];
  const tagValues = ["Pool", "Garage", "Nice yard", "New Roof"];
  const tagColors = ["yellow", "teal", "pink", "green", "blue"];

  const listings: ListingFull[] = [];

  for (let i = 0; i < count; i++) {
    const streetNumber = randomBetween(100, 999);
    const streetName = streetNames[randomBetween(0, streetNames.length - 1)];
    const propCity = cities[randomBetween(0, cities.length - 1)];
    const propStateRegion = states[randomBetween(0, states.length - 1)];

    const listing: ListingFull = {
      propAddress: `${streetNumber} ${streetName} St`,
      propCity,
      propStateRegion,
      listingPrice: randomBetween(200000, 2000000),
      propEstValue: randomBetween(220000, 2200000),
      loan1Balance: randomBetween(150000, 1500000),
      loan1InterestRate: parseFloat((Math.random() * (6 - 3) + 3).toFixed(2)),
      propBedroomsNumber: randomBetween(1, 5),
      propBathroomsNumber: randomBetween(1, 4),
      propBuildingSqft: randomBetween(1000, 4000),
      propLotSizeSqft: randomBetween(3000, 10000),
      propApn: `${randomBetween(1000000000, 9999999999)}`,
      propType: propertyTypes[randomBetween(0, propertyTypes.length - 1)],
      propLastSaleAmount: randomBetween(150000, 1800000),
      propLastSaleDate: new Date(
        randomBetween(2018, 2023),
        randomBetween(1, 12),
        randomBetween(1, 28)
      )
        .toISOString()
        .split("T")[0],
      propAssessedTotalValue: randomBetween(200000, 2100000),
      propVacant: Math.random() < 0.5,
      ownerOccupied: Math.random() < 0.5,
      loan1Lender: lenders[randomBetween(0, lenders.length - 1)],
      loan1OrgDate: new Date(
        randomBetween(2010, 2020),
        randomBetween(1, 12),
        randomBetween(1, 28)
      )
        .toISOString()
        .split("T")[0],
      loan1Type: "30-Year Fixed",
      brokerageName: realtyNames[randomBetween(0, realtyNames.length - 1)],
      agentFullName: agentNames[randomBetween(0, agentNames.length - 1)],
      agentPhone: `(555) 555-55${randomBetween(10, 99)}`,
      agentEmail: `agent${i}@realty.com`,
      listingDate: new Date(
        randomBetween(2022, 2023),
        randomBetween(1, 12),
        randomBetween(1, 28)
      )
        .toISOString()
        .split("T")[0],
      listingStatus: statuses[randomBetween(0, statuses.length - 1)],
      mailingAddress: `${streetNumber} ${streetName} St`,
      mailingCity: propCity,
      mailingStateRegion: propStateRegion,
      mailingZipPostalCode: `${randomBetween(10000, 99999)}`,
      tags: [
        {
          color: tagColors[randomBetween(0, tagColors.length - 1)],
          value: tagValues[randomBetween(0, tagValues.length - 1)],
          type: "basic",
        },
        {
          color: tagColors[randomBetween(0, tagColors.length - 1)],
          value: tagValues[randomBetween(0, tagValues.length - 1)],
          type: "basic",
        },
      ],
    };

    listings.push(listing);
  }

  return listings;
};

// Generate 5 sample listings
const sampleListings = generateListings(5);
console.log(JSON.stringify(sampleListings, null, 2));

Thank you for providing the detailed information about the Google Apps Script/Google Sheet code you want to convert to a Next.js/TypeScript application. Based on the given information, I'll create a folder structure and the necessary functions to calculate the acquisition strategy for the data. I'll focus on the core functionality needed for the acquisition strategy calculation.

First, let's create a folder structure for our Next.js application:

```
src/
  ├── components/
  ├── lib/
  │   ├── constants.ts
  │   ├── types.ts
  │   ├── utils.ts
  │   └── calculations/
  │       ├── acquisitionStrategy.ts
  │       ├── equity.ts
  │       ├── offers.ts
  │       └── fees.ts
  ├── pages/
  │   └── api/
  └── config/
      └── settings.ts
```

Now, let's create the necessary files and functions:

1. src/lib/types.ts

This file will contain the `ListingRawData` type you provided. We'll also add a `Settings` type:

```typescript
export type ListingRawData = {
  // ... (keep the type definition you provided)
};

export type Settings = {
  agentFeePercentage: number;
  closingCostsPercentage: number;
  newAgentFeePercentage: number;
  cashOfferHighPercentage: number;
  cashOfferLowPercentage: number;
  entryFeeFixedAmount: number;
};
```

2. src/config/settings.ts

This file will contain the default settings:

```typescript
import { Settings } from '../lib/types';

export const defaultSettings: Settings = {
  agentFeePercentage: 0.06,
  closingCostsPercentage: 0.02,
  newAgentFeePercentage: 0.03,
  cashOfferHighPercentage: 0.85,
  cashOfferLowPercentage: 0.75,
  entryFeeFixedAmount: 2500,
};
```

3. src/lib/constants.ts

```typescript
export const ACQUISITION_STRATEGIES = [
  "Subject To",
  "Hybrid",
  "Seller Financing",
  "Other",
  "Problem",
] as const;

export type AcquisitionStrategy = typeof ACQUISITION_STRATEGIES[number];
```

4. src/lib/utils.ts

```typescript
export function floorTo500(value: number): number {
  return Math.floor(value / 500) * 500;
}
```

5. src/lib/calculations/equity.ts

```typescript
import { ListingRawData } from '../types';

export function calculateEquity(listing: ListingRawData): {
  estEquityAdjusted: number;
  estEquityPercentAdjusted: number;
} {
  const listingPrice = listing.listingPrice || 0;
  const openMortgageBalance = listing.loan1Balance || 0;

  const estEquityAdjusted = listingPrice - openMortgageBalance;
  const estEquityPercentAdjusted = listingPrice !== 0 ? estEquityAdjusted / listingPrice : 0;

  return {
    estEquityAdjusted,
    estEquityPercentAdjusted,
  };
}
```

6. src/lib/calculations/fees.ts

```typescript
import { ListingRawData, Settings } from '../types';
import { floorTo500 } from '../utils';

export function calculateFees(listing: ListingRawData, settings: Settings): {
  estAgentFee: number;
  estClosingCosts: number;
  estCashToSeller: number;
  newCashToSeller: number;
  newAgentFee: number;
} {
  const listingPrice = listing.listingPrice || 0;
  const openMortgageBalance = listing.loan1Balance || 0;

  const estAgentFee = listingPrice * settings.agentFeePercentage;
  const estClosingCosts = listingPrice * settings.closingCostsPercentage;
  const estCashToSeller = listingPrice - openMortgageBalance - estAgentFee - estClosingCosts;

  let newCashToSeller: number;
  if (estCashToSeller > 20000) {
    newCashToSeller = 20000;
  } else if (estCashToSeller >= 0 && estCashToSeller <= 20000) {
    newCashToSeller = floorTo500(estCashToSeller);
  } else if (estCashToSeller >= -5000 && estCashToSeller < 0) {
    newCashToSeller = 1500;
  } else if (estCashToSeller >= -10000 && estCashToSeller < -5000) {
    newCashToSeller = 1000;
  } else {
    newCashToSeller = 500;
  }

  const newAgentFee = listingPrice * settings.newAgentFeePercentage;

  return {
    estAgentFee,
    estClosingCosts,
    estCashToSeller,
    newCashToSeller,
    newAgentFee,
  };
}
```

7. src/lib/calculations/offers.ts

```typescript
import { ListingRawData, Settings } from '../types';
import { floorTo500 } from '../utils';

export function calculateOffers(listing: ListingRawData, settings: Settings, fees: {
  estClosingCosts: number;
  estAgentFee: number;
  newCashToSeller: number;
}): {
  offerPrice: number;
  offerToAsking: number;
  cashOfferHigh: number;
  cashOfferLow: number;
  totalCost: number;
  entryFeeWithoutCC: number;
  entryFeeWithoutCCPercent: number;
  entryFeeWithCC: number;
  entryFeeWithCCPercent: number;
} {
  const listingPrice = listing.listingPrice || 0;
  const openMortgageBalance = listing.loan1Balance || 0;
  const { estClosingCosts, estAgentFee, newCashToSeller } = fees;

  let offerPrice: number;
  if (openMortgageBalance > 0) {
    const estEquityAdjusted = listingPrice - openMortgageBalance;
    if (estEquityAdjusted >= (newCashToSeller + estClosingCosts + estAgentFee)) {
      offerPrice = floorTo500(openMortgageBalance + (estEquityAdjusted - estClosingCosts - estAgentFee));
    } else {
      offerPrice = floorTo500(openMortgageBalance + newCashToSeller);
    }
  } else {
    offerPrice = listingPrice - estClosingCosts - estAgentFee;
  }

  const offerToAsking = listingPrice !== 0 ? offerPrice / listingPrice : 0;
  const cashOfferHigh = floorTo500(listingPrice * settings.cashOfferHighPercentage);
  const cashOfferLow = floorTo500(listingPrice * settings.cashOfferLowPercentage);

  const newAgentFee = offerPrice * settings.newAgentFeePercentage;
  const totalCost = offerPrice + newAgentFee;

  const entryFeeWithoutCC = newCashToSeller + newAgentFee + settings.entryFeeFixedAmount;
  const entryFeeWithoutCCPercent = offerPrice !== 0 ? entryFeeWithoutCC / offerPrice : 0;

  const entryFeeWithCC = newCashToSeller + newAgentFee + estClosingCosts + settings.entryFeeFixedAmount;
  const entryFeeWithCCPercent = offerPrice !== 0 ? entryFeeWithCC / offerPrice : 0;

  return {
    offerPrice,
    offerToAsking,
    cashOfferHigh,
    cashOfferLow,
    totalCost,
    entryFeeWithoutCC,
    entryFeeWithoutCCPercent,
    entryFeeWithCC,
    entryFeeWithCCPercent,
  };
}
```

8. src/lib/calculations/acquisitionStrategy.ts

```typescript
import { ListingRawData } from '../types';
import { AcquisitionStrategy, ACQUISITION_STRATEGIES } from '../constants';

export function calculateAcquisitionStrategy(listing: ListingRawData, fees: {
  estCashToSeller: number;
  newCashToSeller: number;
}): AcquisitionStrategy {
  const { estCashToSeller, newCashToSeller } = fees;
  const openMortgageBalance = listing.loan1Balance || 0;

  if (estCashToSeller > newCashToSeller && (openMortgageBalance <= 0 || openMortgageBalance === undefined)) {
    return "Seller Financing";
  }

  if (estCashToSeller >= newCashToSeller * 2 && (openMortgageBalance > 0 || openMortgageBalance === undefined)) {
    if (openMortgageBalance < (newCashToSeller - 5000)) {
      return "Seller Financing";
    }
    return "Hybrid";
  }

  if (estCashToSeller > newCashToSeller && estCashToSeller < newCashToSeller * 2 && (openMortgageBalance > 0 || openMortgageBalance === undefined)) {
    return "Subject To";
  }

  if (estCashToSeller < newCashToSeller && (openMortgageBalance > 0 || openMortgageBalance === undefined)) {
    return "Subject To";
  }

  return "Other";
}

export function generateNote(listing: ListingRawData, acquisitionStrategy: AcquisitionStrategy): string {
  // Implement note generation logic here
  return `Acquisition Strategy: ${acquisitionStrategy}`;
}
```

Now you have the core functionality to calculate the acquisition strategy and related values. You can use these functions in your Next.js pages or API routes to process the data.

For example, you could create an API route that takes a `ListingRawData` object and returns the calculated values:

9. src/pages/api/calculate-acquisition.ts

```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import { ListingRawData, Settings } from '../../lib/types';
import { defaultSettings } from '../../config/settings';
import { calculateEquity } from '../../lib/calculations/equity';
import { calculateFees } from '../../lib/calculations/fees';
import { calculateOffers } from '../../lib/calculations/offers';
import { calculateAcquisitionStrategy, generateNote } from '../../lib/calculations/acquisitionStrategy';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const listing: ListingRawData = req.body;
  const settings: Settings = { ...defaultSettings, ...req.body.settings };

  const equity = calculateEquity(listing);
  const fees = calculateFees(listing, settings);
  const offers = calculateOffers(listing, settings, fees);
  const acquisitionStrategy = calculateAcquisitionStrategy(listing, fees);
  const note = generateNote(listing, acquisitionStrategy);

  res.status(200).json({
    equity,
    fees,
    offers,
    acquisitionStrategy,
    note,
  });
}
```

This structure and these functions should provide a good starting point for your Next.js/TypeScript application. You can further expand on this by creating React components to display the results and handle user input for the listings and settings.
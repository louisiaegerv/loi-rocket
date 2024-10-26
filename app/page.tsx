"use client";
import { DataTable } from "@/components/data-table";
import { dataFull } from "./data";
import { ListingFull, ListingRawData } from "@/utils/types";
import { useState, useEffect } from "react";
import { calculateValues } from "@/utils/calculations/calculateValues";

// implementation of calculation functions
const ACQUISITION_STRATEGIES = [
  "Subject To",
  "Hybrid",
  "Seller Financing",
  "Other",
  "Problem",
];

function processData(data: ListingRawData[]): ListingFull[] {
  return data.map((listing) => calculateValues(listing));
}

export default function App() {
  const [processedData, setProcessedData] = useState<ListingFull[]>([]);

  useEffect(() => {
    const processed = processData(dataFull);
    setProcessedData(processed);
  }, []);

  return <DataTable data={processedData}></DataTable>;
}

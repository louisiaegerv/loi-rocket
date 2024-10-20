"use client";

import { ColumnDef, RowExpanding } from "@tanstack/react-table";
import { ListingFull, TagType } from "@/utils/types";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { numToCurrency } from "@/utils/utils";

export const columnsFull: ColumnDef<ListingFull>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        className="m-2"
        checked={
          table.getIsAllRowsSelected() ||
          (table.getIsSomeRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select Row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "Tags",
    accessorKey: "tags",
    header: "Tags",
    minSize: 200,
    size: 200,
    cell: (row) => (
      <div className={`min-w-max text-left`}>
        {row.row.original.tags?.map((tag, index) => (
          <span
            key={index}
            className={`text-nowrap property-tag inline-block cursor-default rounded-md px-3 py-1 font-semibold mr-2 hover:shadow-md duration-300 ${
              "bg-" + tag.color + "-200 text-" + tag.color + "-600"
            }`}
          >
            {tag.value}
            {/* <button className="ml-2 text-red-500 font-bold">×</button> */}
          </span>
        ))}
      </div>
    ),
    meta: {
      filterVariant: "array",
    },
    filterFn: (row, columnId, filterValue: string) => {
      const rowVal: TagType[] = row.getValue(columnId);
      if (!rowVal) return false;
      else
        return rowVal.some((item) =>
          String(item.value).toLowerCase().includes(filterValue.toLowerCase())
        );
    },
  },
  {
    id: "Prop. Address",
    accessorKey: "propAddress",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Address
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },
  {
    id: "Prop. City",
    accessorKey: "propCity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          City
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Prop. State/Region",
    accessorKey: "propStateRegion",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          State/Region
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Listing Price",
    accessorKey: "listingPrice",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {column.columnDef.meta?.isNumeric ? (
            <>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {column.id}
            </>
          ) : (
            <>
              {column.id}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const amount = getValue() as number;
      return numToCurrency(amount);
    },
    meta: {
      filterVariant: "range",
      isNumeric: true,
      isCurrency: true,
    },
    size: 200,
  },

  {
    id: "Prop. Est. Value",
    accessorKey: "propEstValue",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {column.columnDef.meta?.isNumeric ? (
            <>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {column.id}
            </>
          ) : (
            <>
              {column.id}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const amount = getValue() as number;
      return numToCurrency(amount);
    },
    meta: {
      filterVariant: "range",
      isNumeric: true,
    },
    size: 200,
  },

  {
    id: "Loan 1 Balance",
    accessorKey: "loan1Balance",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {column.columnDef.meta?.isNumeric ? (
            <>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {column.id}
            </>
          ) : (
            <>
              {column.id}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const amount = getValue() as number;
      return numToCurrency(amount);
    },
    meta: {
      filterVariant: "range",
      isNumeric: true,
    },
    size: 200,
  },

  {
    id: "Loan 1 Interest Rate",
    accessorKey: "loan1InterestRate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {column.columnDef.meta?.isNumeric ? (
            <>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              {column.id}
            </>
          ) : (
            <>
              {column.id}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      );
    },
    cell: ({ getValue, column }) => {
      return (
        <div
          className={`${
            column.columnDef.meta?.isNumeric
              ? "text-right font-mono mr-[24px]"
              : ""
          }`}
        >
          {getValue() as number}
        </div>
      );
    },
    meta: {
      filterVariant: "range",
      isNumeric: true,
    },
    size: 200,
  },

  {
    id: "Prop. Bedrooms #",
    accessorKey: "propBedroomsNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {column.columnDef.meta?.isNumeric ? (
            <>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Beds
            </>
          ) : (
            <>
              Beds
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    meta: {
      filterVariant: "range",
      isNumeric: true,
    },
    size: 200,
  },

  {
    id: "Prop. Bathrooms #",
    accessorKey: "propBathroomsNumber",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {column.columnDef.meta?.isNumeric ? (
            <>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Baths
            </>
          ) : (
            <>
              Baths
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    meta: {
      filterVariant: "range",
      isNumeric: true,
    },
    size: 200,
  },

  {
    id: "Prop. Building Sqft",
    accessorKey: "propBuildingSqft",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {column.columnDef.meta?.isNumeric ? (
            <>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Building Sqft.
            </>
          ) : (
            <>
              Building Sqft.
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    meta: {
      filterVariant: "range",
      isNumeric: true,
    },
    size: 200,
  },

  {
    id: "Prop. Lot Size (Sqft)",
    accessorKey: "propLotSizeSqft",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {column.columnDef.meta?.isNumeric ? (
            <>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Lot Size (Sqft)
            </>
          ) : (
            <>
              Lot Size (Sqft)
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    meta: {
      filterVariant: "range",
      isNumeric: true,
    },
    size: 200,
  },

  {
    id: "Prop. APN",
    accessorKey: "propApn",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          APN
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Prop. Type",
    accessorKey: "propType",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Prop. Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Prop. Last Sale Amount",
    accessorKey: "propLastSaleAmount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {column.columnDef.meta?.isNumeric ? (
            <>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Last Sale Amount
            </>
          ) : (
            <>
              Last Sale Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const amount = getValue() as number;
      return numToCurrency(amount);
    },
    meta: {
      filterVariant: "range",
      isNumeric: true,
    },
    size: 200,
  },

  {
    id: "Prop. Last Sale Date",
    accessorKey: "propLastSaleDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Sale Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Prop. Assessed Total Value",
    accessorKey: "propAssessedTotalValue",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {column.columnDef.meta?.isNumeric ? (
            <>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Assessed Total Value
            </>
          ) : (
            <>
              Assessed Total Value
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      );
    },
    cell: ({ getValue }) => {
      const amount = getValue() as number;
      return numToCurrency(amount);
    },
    meta: {
      filterVariant: "range",
      isNumeric: true,
    },
  },

  {
    id: "Prop. Vacant",
    accessorKey: "propVacant",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Vacant
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    meta: {
      filterVariant: "select",
      selectOptions: ["any", "true", "false"],
    },
    filterFn: "equalsString",
    size: 200,
  },

  {
    id: "Owner Occupied",
    accessorKey: "ownerOccupied",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Owner Occupied
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    meta: {
      filterVariant: "select",
      selectOptions: ["any", "true", "false"],
    },
    filterFn: "equalsString",
    size: 200,
  },

  {
    id: "Loan 1 Lender",
    accessorKey: "loan1Lender",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Loan 1 Lender
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Loan 1 Org. Date",
    accessorKey: "loan1OrgDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Loan 1 Org. Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Loan 1 Type",
    accessorKey: "loan1Type",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Loan 1 Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Brokerage Name",
    accessorKey: "brokerageName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Brokerage Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Agent Full Name",
    accessorKey: "agentFullName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Agent Full Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Agent Phone",
    accessorKey: "agentPhone",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Agent Phone
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Agent Email",
    accessorKey: "agentEmail",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Agent Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Listing Date",
    accessorKey: "listingDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Listing Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Listing Status",
    accessorKey: "listingStatus",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Listing Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    meta: {
      filterVariant: "select",
      selectOptions: ["any", "active", "pending", "inactive"],
    },
    filterFn: "equals",
    size: 200,
  },

  {
    id: "Mailing Address",
    accessorKey: "mailingAddress",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mailing Address
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Mailing City",
    accessorKey: "mailingCity",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mailing City
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Mailing State/Region",
    accessorKey: "mailingStateRegion",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mailing State/Region
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },

  {
    id: "Mailing ZIP/Postal Code",
    accessorKey: "mailingZipPostalCode",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className={`p-0 w-[${column.getSize()}px] ${
            column.columnDef.meta?.isNumeric ? "!justify-end" : "!justify-start"
          }`}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mailing ZIP/Postal Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: (row) => (
      <div
        className={`${row.column.columnDef.meta?.isNumeric ? "font-mono" : ""}`}
      >
        {String(row.getValue())}
      </div>
    ),
    size: 200,
  },
];

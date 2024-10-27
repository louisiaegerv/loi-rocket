"use client";

import React, { useState, useEffect, useCallback, ChangeEvent } from "react";

import { TagType, TagColors, CustomFilter, ListingFull } from "@/utils/types";
/* SHADCN Components */

import { numToCurrency, debounce } from "@/utils/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ListFilter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Tag,
  Save,
  Check,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Settings,
} from "lucide-react";

import {
  Column,
  ColumnDef,
  RowExpanding,
  RowData,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnResizeMode,
  ColumnResizeDirection,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  PaginationState,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useVirtualizer } from "@tanstack/react-virtual";

interface DataTableProps<TData> {
  data: TData[];
}

declare module "@tanstack/react-table" {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select" | "array";
    selectOptions?: string[];
    isNumeric?: boolean;
    isCurrency?: boolean;
  }
}

export function DataTable<TData extends ListingFull>({
  data,
}: DataTableProps<TData>) {
  const [tableData, setTableData] = useState<ListingFull[]>([]);
  const [columns, setColumns] = useState<ColumnDef<ListingFull>[]>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [allColumnVisibility, setAllColumnVisibility] = useState<boolean>(true);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({});
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([]);
  const [columnResizeMode] = React.useState<ColumnResizeMode>("onChange");
  const [columnResizeDirection] = React.useState<ColumnResizeDirection>("ltr");
  const [columnSizing, setColumnSizing] = React.useState({});

  const [newCustomFilterName, setNewCustomFilterName] = useState<string>("");
  const [loadedCustomFilterName, setLoadedCustomFilterName] =
    useState<string>("");
  const [saveCustomFilterPopoverOpen, setSaveCustomFilterPopoverOpen] =
    useState(false);
  const [loadCustomFilterPopoverOpen, setLoadCustomFilterPopoverOpen] =
    useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [newTag, setNewTag] = useState<TagType>({
    color: "",
    value: "",
    type: "basic",
  });
  const [devMode, setDevMode] = useState<boolean>(false);

  const table = useReactTable({
    data: tableData,
    columns,
    columnResizeMode,
    columnResizeDirection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onColumnSizingChange: setColumnSizing,
    getFilteredRowModel: getFilteredRowModel(),
    defaultColumn: {
      size: 200,
      minSize: 50,
    },
    filterFns: {},
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      columnFilters,
      columnSizing,
      pagination: {
        pageIndex: 0,
        pageSize: 300,
      },
    },
    sortDescFirst: false,
  });

  //initialize the table data
  useEffect(() => {
    setTableData(data);
  }, [data]);

  //initialize the data table columns
  useEffect(() => {
    const initialColumns: ColumnDef<ListingFull>[] = [
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
            className="m-2"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        enableResizing: false,
        size: 50,
      },
      {
        id: "Tags",
        accessorKey: "tags",
        header: "Tags",
        cell: (row) => (
          <div className={`min-w-max text-left`}>
            {row.row.original.tags?.map((tag, index) => (
              <Badge variant="outline" key={index} className="mr-1">
                {tag.value}
                <button
                  className="ml-2 text-red-500 font-bold"
                  onClick={() =>
                    removeTag(row.row.original.propAddress || "", tag)
                  }
                >
                  ×
                </button>
              </Badge>
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
              String(item.value)
                .toLowerCase()
                .includes(filterValue.toLowerCase())
            );
        },
        enableSorting: false,
      },
      {
        id: "Prop. Address",
        accessorKey: "propAddress",
        header: "Address",
        cell: (row) => String(row.getValue()),
      },
      {
        id: "Prop. City",
        accessorKey: "propCity",
        header: "City",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Prop. State/Region",
        accessorKey: "propStateRegion",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Listing Price",
        accessorKey: "listingPrice",
        cell: ({ getValue, row }) => {
          // const rowData = row.original;

          // Log the "Est. Property Value" if it exists
          // console.log(
          //   rowData["Est. Property Value"] ||
          //     "Est. Property Value not available"
          // );

          const amount = getValue() as number;
          return numToCurrency(amount);
        },
        meta: {
          filterVariant: "range",
          isNumeric: true,
          isCurrency: true,
        },
      },

      {
        id: "Prop. Est. Value",
        accessorKey: "propEstValue",
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
        id: "Loan 1 Balance",
        accessorKey: "loan1Balance",
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
        id: "Loan 1 Interest Rate",
        accessorKey: "loan1InterestRate",
        cell: ({ getValue }) => {
          return getValue() as number;
        },
        meta: {
          filterVariant: "range",
          isNumeric: true,
        },
      },

      {
        id: "Prop. Bedrooms #",
        accessorKey: "propBedroomsNumber",
        cell: (row) => String(row.getValue()),
        meta: {
          filterVariant: "range",
          isNumeric: true,
        },
      },

      {
        id: "Prop. Bathrooms #",
        accessorKey: "propBathroomsNumber",
        cell: (row) => String(row.getValue()),
        meta: {
          filterVariant: "range",
          isNumeric: true,
        },
      },

      {
        id: "Prop. Building Sqft",
        accessorKey: "propBuildingSqft",
        cell: (row) => String(row.getValue()),
        meta: {
          filterVariant: "range",
          isNumeric: true,
        },
      },

      {
        id: "Prop. Lot Size (Sqft)",
        accessorKey: "propLotSizeSqft",
        cell: (row) => String(row.getValue()),
        meta: {
          filterVariant: "range",
          isNumeric: true,
        },
      },

      {
        id: "Prop. APN",
        accessorKey: "propApn",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Prop. Type",
        accessorKey: "propType",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Prop. Last Sale Amount",
        accessorKey: "propLastSaleAmount",
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
        id: "Prop. Last Sale Date",
        accessorKey: "propLastSaleDate",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Prop. Assessed Total Value",
        accessorKey: "propAssessedTotalValue",
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
        cell: (row) => String(row.getValue()),
        meta: {
          filterVariant: "select",
          selectOptions: ["any", "true", "false"],
        },
        filterFn: "equalsString",
      },

      {
        id: "Owner Occupied",
        accessorKey: "ownerOccupied",
        cell: (row) => String(row.getValue()),
        meta: {
          filterVariant: "select",
          selectOptions: ["any", "true", "false"],
        },
        filterFn: "equalsString",
      },

      {
        id: "Loan 1 Lender",
        accessorKey: "loan1Lender",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Loan 1 Org. Date",
        accessorKey: "loan1OrgDate",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Loan 1 Type",
        accessorKey: "loan1Type",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Brokerage Name",
        accessorKey: "brokerageName",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Agent Full Name",
        accessorKey: "agentFullName",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Agent Phone",
        accessorKey: "agentPhone",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Agent Email",
        accessorKey: "agentEmail",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Listing Date",
        accessorKey: "listingDate",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Listing Status",
        accessorKey: "listingStatus",
        cell: (row) => String(row.getValue()),
        meta: {
          filterVariant: "select",
          selectOptions: ["any", "active", "pending", "inactive"],
        },
        filterFn: "equals",
      },

      {
        id: "Mailing Address",
        accessorKey: "mailingAddress",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Mailing City",
        accessorKey: "mailingCity",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Mailing State/Region",
        accessorKey: "mailingStateRegion",
        cell: (row) => String(row.getValue()),
      },

      {
        id: "Mailing ZIP/Postal Code",
        accessorKey: "mailingZipPostalCode",
        cell: (row) => String(row.getValue()),
      },
    ];
    setColumns(initialColumns);
  }, []);

  // Load saved filters from localStorage on component mount
  useEffect(() => {
    const localSavedFilters = localStorage.getItem("customFilters");
    if (localSavedFilters) {
      setCustomFilters(JSON.parse(localSavedFilters));
    }
  }, []);

  const saveCustomFilter = () => {
    if (newCustomFilterName && table.getState().columnFilters?.length > 0) {
      const newCustomFilter: CustomFilter = {
        name: newCustomFilterName,
        filters: table.getState().columnFilters,
      };
      const updatedSets = [...customFilters, newCustomFilter];
      setCustomFilters(updatedSets);
      localStorage.setItem("customFilters", JSON.stringify(updatedSets));
      setNewCustomFilterName("");
      setSaveCustomFilterPopoverOpen(false);
      console.log(JSON.stringify(customFilters, null, 2));
    }
  };

  const loadCustomFilter = (filterName: string) => {
    const filterToLoad: CustomFilter | undefined = customFilters.find(
      (filter) => filter.name === filterName
    );
    console.log(filterToLoad);
    console.log(filterToLoad?.filters);

    // Ensure filterToLoad is an array of ColumnFilter objects
    if (!Array.isArray(filterToLoad?.filters)) {
      console.error("filterToLoad is not an array of ColumnFilter objects");
      return;
    }

    if (filterToLoad) {
      table.setColumnFilters(filterToLoad.filters);
      setLoadedCustomFilterName(filterName);
      setLoadCustomFilterPopoverOpen(false);
    }
  };

  const deleteCustomFilter = (filterName: string) => {
    const updatedFilters = customFilters.filter(
      (filter) => filter.name !== filterName
    );
    setCustomFilters(updatedFilters);
    localStorage.setItem("customFilters", JSON.stringify(updatedFilters));
  };

  const removeFilter = useCallback((index: number) => {
    setColumnFilters((prevFilters) => {
      return prevFilters.filter((_, i) => i !== index);
    });
  }, []);

  const handleSaveTagValue = (newTag: TagType) => {
    setNewTag(newTag);
    console.log(newTag);
  };

  //add a new tag to the selected listings
  const addTagToSelected = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedRowIds = selectedRows.map((row) => row.original.propAddress);
    if (newTag && selectedRows.length > 0) {
      setTableData((prevData: ListingFull[]) =>
        prevData.map((listing) =>
          selectedRowIds.includes(listing.propAddress)
            ? {
                ...listing,
                tags: Array.from(new Set([...(listing.tags ?? []), newTag])),
              }
            : listing
        )
      );

      setNewTag({
        color: "",
        value: "",
        type: "basic",
      });
    }
  }, [newTag, table]);

  // remove tag from selected listing
  const removeTag = useCallback(
    (propertyAddress: string, tagToRemove: TagType) => {
      setTableData((prevData: ListingFull[]) =>
        prevData.map((property) =>
          property.propAddress === propertyAddress
            ? {
                ...property,
                tags: property.tags?.filter((tag) => tag !== tagToRemove),
              }
            : property
        )
      );
    },
    []
  );

  const { rows } = table.getRowModel();

  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 10,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div className="p-4 flex flex-col h-screen">
      {/* <pre>                    // info about the column resizing, for debugging
        {JSON.stringify(
          {
            columnSizing: table.getState().columnSizing,
            columnSizingInfo: table.getState().columnSizingInfo,
          },
          null,
          2
        )}
      </pre> */}
      {/* Header Controls */}
      <div id="header" className="mb-2 flex justify-between">
        <div className="header-controls-left flex gap-2 items-center">
          {/* Save Tags Sidebar */}
          <Sheet>
            <SheetTrigger
              disabled={!table.getFilteredSelectedRowModel().rows.length}
              asChild
            >
              <Button
                variant="outline"
                disabled={!table.getFilteredSelectedRowModel().rows.length}
              >
                <Tag className="inline-block" />
                <span className="hidden ml-2 sm:inline-block">Tag</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="md:max-w-sm">
              <SheetHeader>
                <SheetTitle>Save Tag</SheetTitle>
                <SheetDescription>
                  Save a custom tag for the{" "}
                  {table.getFilteredSelectedRowModel().flatRows.length}{" "}
                  currently selected rows.
                </SheetDescription>
              </SheetHeader>
              {/* SAVE TAG Section */}
              <div className="">
                <Label
                  htmlFor="tagName"
                  className="block mb-2 mt-3 font-medium font-bold"
                >
                  Tag Name
                </Label>
                {/* <Input
                  type="text"
                  id="tagName"
                  value={newTag.value}
                  onChange={(e) =>
                    setNewTag({ ...newTag, value: e.target.value })
                  }
                  placeholder="Enter new tag"
                /> */}
                <DebouncedInput
                  type="text"
                  id="tagName"
                  value={newTag.value}
                  onChange={(tagValue) => {
                    // setNewTag({ ...newTag, value: tagValue });
                    handleSaveTagValue({ ...newTag, value: tagValue });
                  }}
                  placeholder="Enter new tag"
                />
                <Label
                  htmlFor="tagColor"
                  className="block mb-2 mt-3 font-medium font-bold"
                >
                  Tag Color
                </Label>
                <Select
                  name="tagColor"
                  onValueChange={(color) =>
                    setNewTag({ ...newTag, color: color })
                  }
                  value={newTag.color || ""}
                >
                  <SelectTrigger
                    className={`col-span-2 ${
                      newTag.color
                        ? `bg-${newTag.color}-200 text-${newTag.color}-600`
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Choose a color" />
                  </SelectTrigger>
                  <SelectContent>
                    {TagColors.map((color) => (
                      <SelectItem
                        key={color}
                        value={color}
                        className={`mt-1 bg-${color}-200 text-${color}-600`}
                      >
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={addTagToSelected}
                  className="w-full mt-4 px-4 py-2"
                  disabled={!newTag.value || !newTag.color}
                  // variant="outline"
                >
                  Add Tag
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Show/Hide Columns */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Columns3 className="inline-block" />
                <span className="hidden ml-2 sm:inline-block">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <ScrollArea className="h-72">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onSelect={(event) => event.preventDefault()}
                        onCheckedChange={(value) => {
                          column.toggleVisibility(!!value);
                        }}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </ScrollArea>
              {/* Toggle All Columns */}
              <Button
                variant="outline"
                className="w-full my-1"
                onClick={() => {
                  table.toggleAllColumnsVisible(!allColumnVisibility);
                  setAllColumnVisibility((prev) => !prev);
                }}
              >
                Toggle All
              </Button>
              {/* Reset Columns */}
              <Button
                className="w-full"
                onClick={() => table.toggleAllColumnsVisible(true)}
              >
                Reset
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="header-controls-right flex gap-2 items-center">
          {/* Filter Sidebar */}
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="px-4 py-2 rounded">
                <ListFilter className="inline-block" />
                <div className="hidden ml-2 sm:inline-block">Filters</div>
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col">
              <SheetHeader className="pb-4 border-b">
                <SheetTitle>
                  <div className="flex align-center gap-4">
                    {/* SAVE Filters Popover */}
                    <Popover
                      open={saveCustomFilterPopoverOpen}
                      onOpenChange={setSaveCustomFilterPopoverOpen}
                    >
                      <PopoverTrigger
                        disabled={
                          !table.getState().columnFilters?.length ||
                          table
                            .getState()
                            .columnFilters.some((filter) => filter.value === "")
                        }
                        asChild
                      >
                        <Button
                          variant="outline"
                          className="bg-background"
                          disabled={
                            !table.getState().columnFilters?.length ||
                            table
                              .getState()
                              .columnFilters.some(
                                (filter) => filter.value === ""
                              )
                          }
                        >
                          <Plus className="mr-2" />
                          Save Filters
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="flex w-full max-w-sm items-center space-x-2">
                          <Input
                            type="text"
                            placeholder="Custom Filter Name"
                            value={newCustomFilterName}
                            onChange={(e) =>
                              setNewCustomFilterName(e.target.value)
                            }
                          />
                          <Button type="submit" onClick={saveCustomFilter}>
                            Save
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    {/* LOAD Filters Popover */}
                    <Popover
                      open={loadCustomFilterPopoverOpen}
                      onOpenChange={setLoadCustomFilterPopoverOpen}
                    >
                      <PopoverTrigger disabled={!customFilters.length} asChild>
                        <Button
                          disabled={!customFilters.length}
                          variant="outline"
                          role="combobox"
                          className="bg-background  justify-between"
                        >
                          <Save className="mr-2" />
                          Load Filter
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Command>
                          <CommandInput placeholder="Search custom filter..." />
                          <CommandList>
                            <CommandEmpty>No Filter found.</CommandEmpty>
                            <CommandGroup>
                              {customFilters.map((filter) => (
                                <CommandItem
                                  key={filter.name}
                                  value={filter.name}
                                  onSelect={() => {
                                    loadCustomFilter(filter.name);
                                  }}
                                  className="flex justify-between flex-nowrap text-nowrap align-middle"
                                >
                                  <div className="flex">
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        loadedCustomFilterName === filter.name
                                          ? "opacity-100"
                                          : "opacity-0"
                                      }`}
                                    />
                                    {filter.name}
                                  </div>
                                  <X
                                    onClick={() =>
                                      deleteCustomFilter(filter.name)
                                    }
                                    className="bg-destructive text-destructive-foreground rounded hover:cursor-pointer"
                                    size={18}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Current Active Filters */}
                  <div id="filterContainer" className="mt-5 text-left">
                    {table.getState().columnFilters?.map((filter, index) => {
                      return (
                        <Badge
                          variant="secondary"
                          className="mr-2 mb-2 font-normal text-md border rounded"
                          key={filter.id}
                        >
                          {Array.isArray(filter.value)
                            ? filter.id +
                              ": " +
                              (filter.value[0] !== undefined &&
                              filter.value[0] !== 0 &&
                              !isNaN(filter.value[0]) &&
                              filter.value[0] !== "" &&
                              filter.value[0] !== null
                                ? Number(filter.value[0]).toLocaleString(
                                    "en-us",
                                    {
                                      minimumFractionDigits: 0,
                                    }
                                  )
                                : "Any") +
                              " - " +
                              (filter.value[1] !== undefined &&
                              filter.value[1] !== 0 &&
                              !isNaN(filter.value[1]) &&
                              filter.value[1] !== "" &&
                              filter.value[1] !== null
                                ? Number(filter.value[1]).toLocaleString(
                                    "en-us",
                                    {
                                      minimumFractionDigits: 0,
                                    }
                                  )
                                : "Any")
                            : filter.id + ": " + filter.value}
                          <X
                            className="ml-4 text-destructive-foreground bg-destructive rounded hover:cursor-pointer"
                            size={15}
                            onClick={() => removeFilter(index)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="flex-1">
                {/* Filters */}
                <div className="w-full flex flex-col items-center p-1">
                  {table.getFlatHeaders().map((header) => (
                    <div
                      key={header.column.id}
                      className="w-full grid grid-cols-2 rounded-lg gap-2 mb-6"
                    >
                      {header.column.getCanFilter() && (
                        <>
                          {/* {header.column.id} */}
                          <Filter
                            key={header.column.id}
                            column={header.column}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              {/* SIDEBAR FOOTER */}
              <div className="pt-4 border-t bg-background flex justify-between items-center gap-4">
                <Button
                  onClick={() => setColumnFilters([])}
                  variant="outline"
                  className="flex-1 text-md py-5"
                  disabled={!table.getState().columnFilters?.length}
                >
                  Reset all
                </Button>
                <Button
                  onClick={() => setFilterSheetOpen(false)}
                  className="flex-1 text-md py-5"
                >
                  See {table.getFilteredRowModel().rows.length} results
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* More Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Settings />
              </Button>
            </SheetTrigger>
            <SheetContent></SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Table */}
      <ScrollArea ref={parentRef} id="scrollarea" className="rounded-md border">
        <Table
          className="relative table-fixed" // relative position for sticky header, table-fixed for truncating cell overflow content with ellipsis...
          style={{
            width: table.getCenterTotalSize(),
          }}
        >
          <TableHeader className="sticky shadow-sm top-0 z-10 bg-gray-50">
            <TableRow isHeader>
              {table.getFlatHeaders().map((header) => (
                <TableHead
                  key={header.id}
                  className={`group overflow-hidden relative ${
                    header.column.getIsResizing()
                      ? "border-blue-500 border-2"
                      : ""
                  }`}
                  style={{
                    width: `${header.getSize()}px`,
                  }}
                >
                  {/* Content Container */}
                  <div
                    className={`flex items-center pr-[15px] ${
                      header.column.columnDef.meta?.isNumeric
                        ? "justify-end"
                        : ""
                    }`}
                  >
                    {/* Add right padding to prevent content from overlapping resizer */}
                    <div
                      className={`flex items-center gap-2 min-w-0 ${
                        header.column.getCanSort() &&
                        "cursor-pointer hover:bg-gray-50  rounded px-2 py-1"
                      }`}
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {/* Header Text with Truncation */}
                      <div className="truncate flex-1 min-w-0">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </div>
                      {/* Sort Icon */}
                      {header.column.getCanSort() && (
                        <div
                          className={`flex-shrink-0 transition-opacity duration-200 group-hover:opacity-100 ${
                            header.column.getIsSorted() ? "" : "opacity-0"
                          }`}
                        >
                          {header.column.getIsSorted() ? (
                            header.column.getIsSorted() === "desc" ? (
                              <ArrowDown size={16} />
                            ) : (
                              <ArrowUp size={16} />
                            )
                          ) : (
                            <ArrowUp size={16} className="text-gray-400" />
                          )}
                        </div>
                      )}
                    </div>
                    {/* Resizer - Positioned absolutely */}
                    {header.column.getCanResize() && (
                      <div
                        onDoubleClick={() => header.column.resetSize()}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className="absolute top-0 right-0 h-full w-[15px] cursor-col-resize z-10 flex items-center justify-center touch-none"
                      >
                        <div
                          className={`w-[2px] h-2/3 bg-gray-500/50 ${
                            header.column.getIsResizing() ? "hidden" : ""
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        width: `${cell.column.getSize()}px`,
                        maxWidth: `${cell.column.getSize()}px`,
                      }}
                      className="border-b p-0 overflow-hidden"
                    >
                      <div
                        className={`truncate min-w-0 p-2 ${
                          cell.column.columnDef.meta?.isNumeric
                            ? "text-right mr-[24px]"
                            : "text-left"
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Footer */}
      <div id="footer" className="h-[50px]">
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="left">
            <div className="flex-1 text-md text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
              <span
                className="ml-2 hover:cursor-pointer"
                onClick={() => setDevMode((prev) => !prev)}
              >
                .
              </span>
            </div>
          </div>
          <div className="right flex gap-2"></div>
        </div>

        {/* Dev Mode log section */}
        {devMode && (
          <div>
            <pre>
              {JSON.stringify(
                { rowSelection: table.getState().rowSelection },
                null,
                2
              )}
            </pre>
            <pre>
              {JSON.stringify(
                { columnFilters: table.getState().columnFilters },
                null,
                2
              )}
            </pre>
            <pre>
              {JSON.stringify(
                {
                  FilteredSelectedRows:
                    table.getFilteredSelectedRowModel().rows,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  const { filterVariant, selectOptions } = column.columnDef.meta ?? {};

  return (
    <>
      <Label className="col-span-2 font-bold" htmlFor={column.id}>
        {column.id}
      </Label>
      {filterVariant === "range" ? (
        <>
          <DebouncedInput
            type="number"
            value={(columnFilterValue as [number, number])?.[0] ?? ""}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                value,
                old?.[1],
              ])
            }
            placeholder={`Min`}
            className=""
          />
          <DebouncedInput
            type="number"
            value={(columnFilterValue as [number, number])?.[1] ?? ""}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                value,
              ])
            }
            placeholder={`Max`}
            className=""
          />
        </>
      ) : filterVariant === "select" ? (
        <Select
          onValueChange={(value) => {
            if (value === "any") {
              column.setFilterValue("");
            } else {
              column.setFilterValue(value);
            }
          }}
          value={columnFilterValue?.toString() || ""}
        >
          <SelectTrigger className="col-span-2">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {selectOptions?.map((option) => (
              <SelectItem key={option.valueOf()} value={option.valueOf()}>
                {option.valueOf()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        // ) : filterVariant === "array" ? (
        //   <DebouncedInput
        //     className="col-span-2"
        //     onChange={(value) => column.setFilterValue(value)}
        //     placeholder={`Search ${column.id}...`}
        //     type="text"
        //     value={(columnFilterValue ?? "") as string}
        //   />
        <DebouncedInput
          className="col-span-2"
          onChange={(value) => column.setFilterValue(value)}
          placeholder={`Search ${column.id}...`}
          type="text"
          value={(columnFilterValue ?? "") as string}
        />
      )}
    </>
  );
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

const DebouncedInput3: React.FC<{
  value: string;
  onChange: (value: string) => void;
  debounceTime?: number;
}> = ({ value: initialValue, onChange, debounceTime = 1000, ...props }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const debouncedOnChange = debounce((value: string) => {
    onChange(value);
  }, debounceTime);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    debouncedOnChange(newValue);
  };

  return <input {...props} value={value} onChange={handleInputChange} />;
};

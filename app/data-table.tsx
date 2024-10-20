"use client";

import React, { useState, useEffect, useCallback } from "react";

import {
  TagType,
  TagColors,
  CustomFilter,
  ListingFull,
  ListingRawData,
} from "@/utils/types";
/* SHADCN Components */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
  Tag,
  Save,
  Check,
  ChevronsUpDown,
  Plus,
  TagIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Ellipsis,
} from "lucide-react";

import {
  Column,
  ColumnDef,
  RowData,
  ColumnFiltersState,
  ColumnOrderState,
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | ListingFull[];
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

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
}: DataTableProps<TData, TValue>) {
  const [data, setData] = useState<ListingFull[]>(initialData);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [allColumnVisibility, setAllColumnVisibility] = useState<boolean>(true);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({});
  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([]);
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
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {},
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      columnFilters,
      pagination: {
        pageIndex: 0,
        pageSize: 50,
      },
    },
  });

  // Debugging: Log when data prop changes
  useEffect(() => {
    setData(initialData); // Make sure to update the internal data state
  }, [initialData]);

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

  //add a new tag to the selected listings
  const addTagToSelected = useCallback(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const selectedRowIds = selectedRows.map((row) => row.original.propAddress);
    if (newTag && selectedRows.length > 0) {
      setData((prevData: ListingFull[]) =>
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
  // const removeTag = useCallback((propertyId: number, tagToRemove: TagType) => {
  //   setData((prevData: Listing[]) =>
  //     prevData.map((property) =>
  //       property.id === propertyId
  //         ? {
  //             ...property,
  //             tags: property.tags.filter((tag) => tag !== tagToRemove),
  //           }
  //         : property
  //     )
  //   );
  // }, []);

  return (
    <div className="p-4 flex flex-col h-[88vh] lg:h-screen">
      {/* Header Controls */}
      <div id="header" className="mb-2 flex justify-between">
        <div className="header-controls-left flex gap-2 items-center">
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
                <Input
                  type="text"
                  id="tagName"
                  value={newTag.value}
                  onChange={(e) =>
                    setNewTag({ ...newTag, value: e.target.value })
                  }
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

          {/* More Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Ellipsis />
              </Button>
            </SheetTrigger>
            <SheetContent></SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Table */}
      <ScrollArea id="scrollarea" className="rounded-md border">
        <Table className="">
          <TableHeader>
            <TableRow>
              {table.getFlatHeaders().map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  className={
                    header.column.columnDef.meta?.isNumeric ? "text-right" : ""
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      cell.column.columnDef.meta?.isNumeric
                        ? "text-right font-mono"
                        : ""
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
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
              <Button
                className="ml-2"
                onClick={() => setDevMode((prev) => !prev)}
              >
                Dev Mode: {devMode ? "ON 🤖" : "OFF"}
              </Button>
            </div>
          </div>
          <div className="right flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
              <span className="hidden sm:inline">Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight />
            </Button>
          </div>
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

"use client"

import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  RowSelectionState,
  OnChangeFn
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import "../public/css/table.css";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSort?: (columnId: string) => void; // Global sorting function
  sortConfig?: {
    columnId: string | null;
    direction: 'asc' | 'desc' | null;
  }; // Sorting state
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
}

export function DataTable<TData, TValue>({
  columns,
  data: initialData,
  onSort,
  sortConfig,
  rowSelection,
  onRowSelectionChange,
}: DataTableProps<TData, TValue>) {
  
  const [data, setData] = useState<TData[]>(initialData || []);
  const [currentPage, setCurrentPage] = useState(0);
  const rowsPerPage = 6;

  React.useEffect(() => {
    setData(initialData || []); // Ensure data is always an array
}, [initialData]);


  const table = useReactTable({
    data: data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection: rowSelection || {},
    },
    onRowSelectionChange: onRowSelectionChange || (() => { }),
    getRowId: (original) => (original as any)?.id ?? String(Math.random()), // Fallback ID
  });

  React.useEffect(() => {
    setData(initialData || []); // Ensure data is always an array
}, [initialData]);

  // Calculate paginated data based on filtered data
  const paginatedRows = React.useMemo(() => {
    if (!data) return []; // Return empty array if data is undefined
    const start = currentPage * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end); // Use filtered data directly
}, [data, currentPage, rowsPerPage]);

  // Calculate total pages based on filtered data
  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div className="mt-1 pl-2 overflow-x-auto bg-white shadow">
      <Table className="table bg-white">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  className="border-none text-black text-center font-sans text-sm font-semibold "
                  key={header.id}
                >
                  {header.isPlaceholder ? null : (
                    <div className="flex items-center justify-center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {onSort &&
                        ['pickupDate', 'dropDate', 'distance', 'bookingDate', 'amount', "enquiryAt", "lastLogin", "createdAt", "name", "id", "phone", "transactionId", "enquiryAt", "licenseNumber", "orderNumber","category",
                          "refId", "bookingId", "invoiceId", "date", "driverId", "driverName", "totalAmount", "customerName", "phoneNumber", "vendorId", "vendorName", "offerType", "serviceType", "startDate", "endDate"
                          , "ipAddress", "totalVisits", "lastLogin", "status", "amount", "email", "pickupLocation", "dropLocation", "totalBookings", "totalSpent", "originDistrict", "destinationDistrict", "hillCharges", "vehicleCharges",
                          "walletBalance", "isActive", "walletAmount", "includeId", "origin", "destination", "tollPrice", "hillPrice", "Km", "vehicleType", "vehiclePrice", "pickup", "drop", "finalAmount","offerId","offerName",
                          "type","value","pickupTime","isLogin",
                        ].includes(
                          header.column.id
                        ) && (
                          <button
                            onClick={() => onSort(header.column.id)}
                            className="ml-2"
                          >
                            {sortConfig?.columnId === header.column.id && sortConfig?.direction === 'asc' ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        )}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).length ? (
            table.getRowModel().rows.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage).map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell 
                    key={cell.id} 
                    className={`text-center ${
                      // Add columns that should have fixed widths
                      ['name', 'email', 'phone', 'address'].includes(cell.column.id)
                        ? 'min-w-[100px] md:min-w-[150px] lg:min-w-[200px]'
                        : 'min-w-auto'  // default width for other columns
                    } whitespace-nowrap overflow-hidden text-ellipsis`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>

      </Table>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            className={`flex items-center justify-center p-2 rounded ${currentPage === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'}`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="mx-2">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage === totalPages - 1}
            className={`flex items-center justify-center p-2 rounded ${currentPage === totalPages - 1 ? 'text-gray-400 cursor-not-allowed' : 'text-black hover:bg-gray-200'}`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
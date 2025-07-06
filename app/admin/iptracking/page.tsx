'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { DataTable } from 'components/others/DataTable';
import { columns } from './columns';
import { useIpTrackingStore } from 'stores/-ipTrackingStore';
import { Card } from 'components/ui/card';
import CounterCard from 'components/cards/CounterCard';
import { Activity, ArrowDown, ArrowUp, Trash } from 'lucide-react';
import { Label } from 'components/ui/label';
import DateRangeAccordion from '../../../components/others/DateRangeAccordion';
import { Button } from 'components/ui/button';
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter
} from 'components/ui/alert-dialog';

interface IpTrackingData {
  id: string;
  ipAddress: string;
  totalVisits: number;
  visitsToday: number;
  lastLogin: string;
}

export default function IpTrackingPage() {
  const router = useRouter();
  const { fetchIpTrackings, ipTrackings, multiDeleteIp } = useIpTrackingStore();
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [formattedData, setFormattedData] = useState<IpTrackingData[]>([]);
  const [filteredData, setFilteredData] = useState<IpTrackingData[]>([]);
  const [overallTotalVisits, setOverallTotalVisits] = useState(0);
  const [overallTodayVisits, setOverallTodayVisits] = useState(0);
  const [visitsLessThan5, setVisitsLessThan5] = useState(0);
  const [visitsMoreThan5, setVisitsMoreThan5] = useState(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'lessThan5' | 'moreThan5'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    columnId: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ columnId: null, direction: null });

  const [filters, setFilters] = useState({
    search: '',
  });

  useEffect(() => {
    fetchIpTrackings();
  }, [fetchIpTrackings]);

  useEffect(() => {
    if (!ipTrackings || !Array.isArray(ipTrackings) || ipTrackings.length === 0) {
      setFormattedData([]);
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    const visitCounts = ipTrackings.reduce((acc, tracking) => {
      const ip = tracking.ipAddress;
      const visitDate = tracking.visitTime
        ? new Date(tracking.visitTime).toISOString().split('T')[0]
        : null;

      if (startDate && endDate && visitDate && (visitDate < startDate || visitDate > endDate)) {
        return acc;
      }

      if (!acc[ip]) {
        acc[ip] = { totalVisits: 0, visitsToday: 0, lastLogin: '' };
      }

      acc[ip].totalVisits += 1;

      if (visitDate === today) {
        acc[ip].visitsToday += 1;
      }

      acc[ip].lastLogin = tracking.visitTime
        ? new Date(tracking.visitTime).toLocaleTimeString([], {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
        : '';

      return acc;
    }, {} as { [key: string]: { totalVisits: number; visitsToday: number; lastLogin: string } });

    const formatted = Object.keys(visitCounts).map(ip => ({
      id: ip,
      ipAddress: ip,
      totalVisits: visitCounts[ip].totalVisits,
      visitsToday: visitCounts[ip].visitsToday,
      lastLogin: visitCounts[ip].lastLogin,
    }));

    setFormattedData(formatted);
  }, [ipTrackings, startDate, endDate]);

  useEffect(() => {
    let filtered = formattedData;

    if (filterType === 'lessThan5') {
      filtered = formattedData.filter(data => data.totalVisits < 5);
    } else if (filterType === 'moreThan5') {
      filtered = formattedData.filter(data => data.totalVisits >= 5);
    }

    setFilteredData(filtered);
  }, [formattedData, filterType]);

  useEffect(() => {
    const totalVisits = filteredData.reduce((sum, record) => sum + record.totalVisits, 0);
    const todayVisits = filteredData.reduce((sum, record) => sum + record.visitsToday, 0);
    const lessThan5Count = filteredData.filter(record => record.totalVisits < 5).length;
    const moreThan5Count = filteredData.filter(record => record.totalVisits >= 5).length;

    setOverallTotalVisits(totalVisits);
    setOverallTodayVisits(todayVisits);
    setVisitsLessThan5(lessThan5Count);
    setVisitsMoreThan5(moreThan5Count);
  }, [filteredData]);

  const unFilteredData = [...filteredData].sort((a, b) => {
    const aLastLogin = new Date(a.lastLogin).getTime();
    const bLastLogin = new Date(b.lastLogin).getTime();
    return bLastLogin - aLastLogin;
  });

  const sortedData = useMemo(() => {
    const dataToSort = [...unFilteredData];
    if (!sortConfig.columnId || !sortConfig.direction) return dataToSort;

    return dataToSort.sort((a, b) => {
      const aValue = a[sortConfig.columnId as keyof IpTrackingData];
      const bValue = b[sortConfig.columnId as keyof IpTrackingData];

      if (aValue === null || bValue === null) return 0;
      if (aValue === bValue) return 0;

      return sortConfig.direction === 'asc'
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });

  }, [filteredData, sortConfig]);

  const handleSort = (columnId: string) => {
    setSortConfig(prev => ({
      columnId,
      direction: prev.columnId === columnId && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleClear = () => {
    setFilters({ search: '' });
    setStartDate('');
    setEndDate('');
    setFilterType('all');
    setSortConfig({ columnId: null, direction: null });
  };

  const handleBulkDelete = () => {
    const selectedIds = Object.keys(rowSelection);
    if (selectedIds.length === 0) return;
    setIsDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection);
    await multiDeleteIp(selectedIds);
    const newFormattedData = formattedData.filter(record => !selectedIds.includes(record.ipAddress));
    setFormattedData(newFormattedData);
    setFilteredData(newFormattedData);
    setRowSelection({});
    const status = useIpTrackingStore.getState().statusCode
    const message = useIpTrackingStore.getState().message
    if (status === 200 || status === 201) {
      toast.success("IpTrackings deleted successfully");
      router.push("/admin/iptracking");
    } else {
      toast.error(message || "Error deleting IpTrackings", {
        style: {
          backgroundColor: "#FF0000",
          color: "#fff",
        },
      });
    }
    setIsDialogOpen(false);
  }

  const cancelBulkDelete = () => {
    setIsDialogOpen(false);
  };

  const getFormattedDateRange = () => {
    const start = startDate ? new Date(startDate).toLocaleDateString() : '';
    const end = endDate ? new Date(endDate).toLocaleDateString() : '';
    return start && end ? `${start} - ${end}` : 'Pick a range';
  };

  return (
    <>
      <div className="space-y-6">
        <div className="rounded bg-white p-5 shadow">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-5">
              <h1 className="text-2xl font-bold tracking-tight">Site Analytics</h1>
              <div className="flex items-center gap-2">
                {/* {showFilters && <Button variant="outline" onClick={handleClear}>
                  Clear
                </Button>} */}
                <Button
                  variant="none"
                  className='text-[#009F7F] hover:bg-[#009F7F] hover:text-white'
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                  {showFilters ? <ArrowDown className="ml-2" /> : <ArrowUp className="ml-2" />}
                </Button>
                <div className="flex items-center gap-2">
                  {Object.keys(rowSelection).length > 0 && (
                    <>
                      <Button
                        variant="destructive"
                        onClick={handleBulkDelete}
                        className="flex items-center gap-2"
                      >
                        <Trash className="h-4 w-4" />
                        ({Object.keys(rowSelection).length})
                      </Button>

                      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {Object.keys(rowSelection).length} selected drivers? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={cancelBulkDelete}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmBulkDelete}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5">
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-emerald-100"
                    icon={Activity}
                    count={overallTotalVisits}
                    label="Total Visits"
                    cardSize="w-[180px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-100" />
              </Card>
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 w-full" />
                <div className="h-[150PX] w-full">
                  <CounterCard
                    color="bg-blue-100"
                    icon={Activity}
                    count={overallTodayVisits}
                    label="Today's Visits"
                    cardSize="w-[180px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-100" />
              </Card>
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-100 w-full" />
                <div className="h-[150px] w-full">
                  <CounterCard
                    color="bg-purple-100"
                    icon={Activity}
                    count={visitsLessThan5}
                    label="Visits < 5 times"
                    cardSize="w-[180px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-100" />
              </Card>
              <Card className="relative overflow-hidden border-none bg-gradient-to-br from-purple-50 to-pink-50 shadow-md w-[230px] h-[120px] transform transition duration-300 ease-in-out hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-100 w-full" />
                <div className="h-[150px] w-full">
                  <CounterCard
                    color="bg-orange-100"
                    icon={Activity}
                    count={visitsMoreThan5}
                    label="Visits ≥ 5 times"
                    cardSize="w-[180px] h-[90px]"
                  />
                </div>
                <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-100" />
              </Card>
            </div>
            {showFilters && (
              <div className="flex gap-8 items-center mt-4">
                <div className="flex flex-col w-[230px]">
                  <Label className="text-sm font-medium leading-none mb-2">
                    Date Visited
                  </Label>
                  <DateRangeAccordion
                    label={getFormattedDateRange()}
                    startDate={startDate}
                    endDate={endDate}
                    onStartDateChange={(date: string) => setStartDate(date)}
                    onEndDateChange={(date: string) => setEndDate(date)}
                  />
                </div>
                <div className="flex flex-col w-[230px]">
                  <Label className="text-sm font-medium">Visits Filter</Label>
                  <div className="flex space-x-2 mt-2">
                    <Button
                      variant={filterType === 'lessThan5' ? 'primary' : 'outline'}
                      onClick={() => setFilterType('lessThan5')}
                    >
                      Less Than 5 Visits
                    </Button>
                    <Button
                      variant={filterType === 'moreThan5' ? 'primary' : 'outline'}
                      onClick={() => setFilterType('moreThan5')}
                    >
                      More Than 5 Visits
                    </Button>
                  </div>
                </div>
                <div className='flex justify-start items-center'>
                  <Button
                    className='mt-4 ml-14 p-1 border-none bg-[#009F87] flex justify-center items-center w-28'
                    // variant="outline"
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="rounded bg-white shadow">
          {sortedData.length > 0 ? (
            <DataTable
              columns={columns}
              data={sortedData}
              onSort={handleSort}
              sortConfig={sortConfig}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
            />
          ) : (
            <p className='text-center text-gray-500 p-5'>No data available.</p>
          )}
        </div>
      </div>
    </>
  );
}
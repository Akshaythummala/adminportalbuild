import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Typography,
  TableSortLabel,
  TextField,
  IconButton,
  Button,
} from '@mui/material';
import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  getFilteredRowModel,
} from '@tanstack/react-table';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FilterListIcon from '@mui/icons-material/FilterList';

const MaterialTable = ({ data = [], loading, error, title, columns: customColumns }) => {
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnSizing, setColumnSizing] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  // Track which columns have their filter box open
  const [openFilters, setOpenFilters] = useState({});

  // Ensure data is an array
  const tableData = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') {
      // If it's an object with numeric keys, convert to array
      if (Object.keys(data).every(key => !isNaN(key))) {
        return Object.values(data);
      }
      // If it has a data property that's an object with numeric keys
      if (data.data && typeof data.data === 'object') {
        return Object.values(data.data);
      }
    }
    return [];
  }, [data]);

  useEffect(() => {
    // Debug logs
    // console.log('MaterialTable received data:', data);
    // console.log('Processed table data:', tableData);
    // if (tableData.length > 0) {
    //   console.log('First row:', tableData[0]);
    // }
  }, [data, tableData]);

  // Use custom columns if provided, otherwise auto-generate
  const columns = useMemo(() => {
    if (customColumns && customColumns.length > 0) return customColumns;
    if (!tableData.length) return [];
    return Object.keys(tableData[0]).map((key) => ({
      accessorKey: key,
      header: key
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '),
      minSize: 200,
      size: 220,
      maxSize: 1000,
      enableResizing: true,
    }));
  }, [customColumns, tableData]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      pagination,
      columnSizing,
      globalFilter,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnSizingChange: setColumnSizing,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
  });

  // Handler to auto-fit column width on double-click
  const handleAutoFit = (header) => {
    const colId = header.column.id;
    console.log('Double-clicked resizer for column:', colId);
    const cells = document.querySelectorAll(`[data-col-id='${colId}']`);
    console.log('Found cells:', cells);
    let maxWidth = 0;
    cells.forEach(cell => {
      console.log('Cell scrollWidth:', cell.scrollWidth, 'text:', cell.textContent);
      maxWidth = Math.max(maxWidth, cell.scrollWidth);
    });
    maxWidth += 24;
    console.log('Setting column size to:', maxWidth);
    setColumnSizing((old) => ({
      ...old,
      [colId]: maxWidth,
    }));
  };

  // Handler to toggle filter for a specific column
  const handleColumnFilterToggle = (colId) => {
    setOpenFilters((prev) => ({ ...prev, [colId]: !prev[colId] }));
  };

  // Download CSV handler
  const handleDownloadCSV = () => {
    const rows = table.getFilteredRowModel().rows;
    if (!rows.length) return;
    const columns = table.getAllLeafColumns();
    const csvHeader = columns.map(col => col.columnDef.header).join(',');
    const csvRows = rows.map(row =>
      columns.map(col => {
        const val = row.getValue(col.id);
        // Escape quotes and commas
        if (typeof val === 'string') {
          return '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      }).join(',')
    );
    const csvContent = [csvHeader, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (title ? title.replace(/\s+/g, '_').toLowerCase() : 'table_data') + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {title && (
        <Typography variant="h6" sx={{ p: 2 }}>
          {title}
        </Typography>
      )}
      {/* Global Filter only and Download Button */}
      <Box sx={{ p: 2, pb: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          label="Search all columns"
          variant="outlined"
          size="small"
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          fullWidth
        />
        <Button variant="outlined" onClick={handleDownloadCSV} sx={{ whiteSpace: 'nowrap' }}>
          Download CSV
        </Button>
      </Box>
      <TableContainer
        sx={{
          maxHeight: 'calc(100vh - 180px)', // Table never exceeds main screen area
          minHeight: 300,
          minWidth: 900,
          maxWidth: '100%',
          overflowY: 'auto',
          overflowX: 'auto',
          background: 'white',
        }}
      >
        <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup, i) => (
              <TableRow key={headerGroup.id} sx={{ m: 0, p: 0 }}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    sortDirection={header.column.getIsSorted()}
                    sx={{
                      m: 2,
                      p: 2,
                      borderBottom: '1px solid #e0e0e0',
                      background: 'white',
                      zIndex: 2,
                    }}
                    style={{
                      position: 'sticky',
                      top: i === 0 ? 0 : 48, // 0 for first header row, 48px for filter row (adjust if row height changes)
                      width: header.getSize(),
                      minWidth: header.column.columnDef.minSize,
                      maxWidth: header.column.columnDef.maxSize,
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={0.5} pr={4}>
                      {header.isPlaceholder ? null : (
                        <TableSortLabel
                          active={!!header.column.getIsSorted()}
                          direction={header.column.getIsSorted() || undefined}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </TableSortLabel>
                      )}
                      {header.column.getCanFilter() && (
                        <IconButton
                          size="small"
                          onClick={e => {
                            e.stopPropagation();
                            handleColumnFilterToggle(header.column.id);
                          }}
                          aria-label={`Toggle filter for ${header.column.id}`}
                          sx={{ mr: 2 }}
                        >
                          <FilterListIcon color={openFilters[header.column.id] ? 'primary' : 'inherit'} fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        onDoubleClick={() => handleAutoFit(header)}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          height: '100%',
                          width: '16px',
                          cursor: 'col-resize',
                          zIndex: 1,
                          userSelect: 'none',
                          touchAction: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          margin: 0,
                          background: 'none',
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        <div
                          style={{
                            width: '2px',
                            height: '30%',
                            background: '#888',
                            borderRadius: '1px',
                            margin: 0,
                            pointerEvents: 'none',
                          }}
                        />
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {/* Column Filters Row */}
            <TableRow sx={{ m: 0, p: 0 }}>
              {table.getHeaderGroups()[0].headers.map((header) => (
                <TableCell
                  key={header.id}
                  sx={{
                    p: 0,
                    m: 0,
                    borderBottom: '1px solid #e0e0e0',
                    background: 'white',
                    zIndex: 1,
                  }}
                  style={{
                    position: 'sticky',
                    top: 48, // below the main header row
                  }}
                >
                  {header.column.getCanFilter() && openFilters[header.column.id] && (
                    <TextField
                      variant="standard"
                      size="small"
                      value={header.column.getFilterValue() ?? ''}
                      onChange={e => header.column.setFilterValue(e.target.value)}
                      placeholder={`Filter...`}
                      fullWidth
                      sx={{ m: 0, p: 1 }}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} sx={{ height: 48 }}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    data-col-id={cell.column.id}
                    sx={{ height: 48, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {!tableData.length && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 3, height: 48 }}
                >
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={table.getFilteredRowModel().rows.length}
        page={pagination.pageIndex}
        onPageChange={(_, page) => table.setPageIndex(page)}
        rowsPerPage={pagination.pageSize}
        onRowsPerPageChange={(e) => {
          const size = Number(e.target.value);
          table.setPageSize(size);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
};

export default MaterialTable; 
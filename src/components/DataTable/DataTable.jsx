import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";

/**
 * A small, dependency-free replacement for the paginated/searchable data
 * table used throughout the original app (there it came from a third-party
 * template; here it's a from-scratch generic component with the same
 * search + column shape).
 */
export default function DataTable({ columns, rows, searchable }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((row) =>
      columns.some((col) => String(row[col.accessor] ?? "").toLowerCase().includes(q))
    );
  }, [rows, columns, query]);

  return (
    <Box>
      {searchable && (
        <Box sx={{ p: 2 }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Box>
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.accessor} width={col.width} align={col.align || "left"}>
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((row, i) => (
              <TableRow key={row.id ?? i}>
                {columns.map((col) => (
                  <TableCell key={col.accessor} align={col.align || "left"}>
                    {row[col.accessor]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No records.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      accessor: PropTypes.string.isRequired,
      width: PropTypes.string,
      align: PropTypes.string,
    })
  ).isRequired,
  rows: PropTypes.array.isRequired,
  searchable: PropTypes.bool,
};

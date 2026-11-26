import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";

/**
 * The one table used across the console. Search looks at the plain-text
 * fields of each row (`search` if given, otherwise every string value).
 */
export default function DataTable({ columns, rows, searchable, empty, toolbar }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    if (!needle) return rows;
    return rows.filter((r) => {
      const hay =
        r.search ??
        Object.values(r)
          .filter((v) => typeof v === "string")
          .join(" ");
      return hay.toLocaleLowerCase("tr").includes(needle);
    });
  }, [rows, q]);

  return (
    <Box>
      {(searchable || toolbar) && (
        <Box
          display="flex"
          flexWrap="wrap"
          gap={1.5}
          alignItems="center"
          justifyContent="space-between"
          mb={1.5}
        >
          {searchable ? (
            <TextField
              size="small"
              placeholder="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{ width: { xs: "100%", sm: 280 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              inputProps={{ "aria-label": "Search" }}
            />
          ) : (
            <span />
          )}
          {toolbar}
        </Box>
      )}
      <Box sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((c) => (
                <TableCell
                  key={c.accessor}
                  align={c.align || "left"}
                  sx={{ width: c.width, whiteSpace: "nowrap" }}
                >
                  {c.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {shown.map((row) => (
              <TableRow key={row.id} hover>
                {columns.map((c) => (
                  <TableCell key={c.accessor} align={c.align || "left"}>
                    {row[c.accessor] ?? "–"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      {!shown.length && (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          {q ? `Nothing matches "${q}".` : empty || "Nothing here yet."}
        </Typography>
      )}
    </Box>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.node,
      accessor: PropTypes.string.isRequired,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  searchable: PropTypes.bool,
  empty: PropTypes.node,
  toolbar: PropTypes.node,
};

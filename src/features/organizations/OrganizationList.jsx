import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import { apiService, API_CONFIG, ENDPOINTS } from "../../api/client";
import { usePersona } from "../../persona";
import useLoad from "../../hooks/useLoad";
import PageHeader from "../../components/PageHeader";
import Monogram from "../../components/Monogram";
import ErrorNote from "../../components/ErrorNote";
import { categoryColor } from "../../theme";
import OrganizationDialog from "./OrganizationDialog";

function ClubCard({ org }) {
  const t = useTheme().tokens;
  return (
    <Paper
      component={RouterLink}
      to={`/organizations/${org.id}`}
      sx={{
        p: 2.25,
        borderRadius: "14px",
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        transition: "border-color 120ms, box-shadow 120ms",
        opacity: org.isActive ? 1 : 0.6,
        "&:hover, &:focus-visible": {
          borderColor: categoryColor(org.category),
          boxShadow: `0 8px 24px -18px ${t.ink}`,
          outline: "none",
        },
      }}
    >
      <Box display="flex" gap={1.5} alignItems="center">
        <Monogram org={org} />
        <Box minWidth={0}>
          <Typography variant="h3" noWrap>
            {org.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {org.category || "No category"}
            {org.isActive ? "" : ", closed"}
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: "2.6em",
        }}
      >
        {org.description}
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns="auto 1fr"
        columnGap={1.5}
        rowGap={0.25}
        sx={{ fontSize: "0.82rem" }}
      >
        <Typography variant="caption" color="text.secondary">
          President
        </Typography>
        <Typography variant="caption" fontWeight={650} noWrap>
          {org.president?.name || "–"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Advisor
        </Typography>
        <Typography variant="caption" fontWeight={650} noWrap>
          {org.advisor?.name || "none"}
        </Typography>
      </Box>
      <Box display="flex" alignItems="baseline" gap={0.5} mt="auto">
        <Typography sx={{ fontSize: "1.4rem", fontWeight: 800 }}>{org.memberCount}</Typography>
        <Typography variant="caption" color="text.secondary">
          members
        </Typography>
      </Box>
    </Paper>
  );
}

export default function OrganizationList() {
  const { data, error, reload } = useLoad(() => apiService.get(ENDPOINTS.ORGANIZATIONS.LIST));
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(null);
  const [creating, setCreating] = useState(false);
  const { email } = usePersona();
  // in the demo only the admin persona gets the button; against a real gateway the service decides
  const mayCreate = !(API_CONFIG.DEMO || API_CONFIG.DEMO_HEADER) || email === "admin@example.org";

  const categories = useMemo(
    () => [...new Set((data || []).map((o) => o.category).filter(Boolean))].sort(),
    [data]
  );
  const shown = (data || []).filter(
    (o) =>
      (!category || o.category === category) &&
      (!q.trim() ||
        `${o.name} ${o.shortName} ${o.president?.name || ""}`
          .toLocaleLowerCase("tr")
          .includes(q.trim().toLocaleLowerCase("tr")))
  );

  return (
    <>
      <PageHeader
        title="Clubs"
        subtitle="Every student club, who runs it and who signs off its requests."
        action={
          mayCreate && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
              New club
            </Button>
          )
        }
      />
      <Box display="flex" flexWrap="wrap" gap={1} alignItems="center" mb={2.5}>
        <TextField
          size="small"
          placeholder="Search clubs or presidents"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          sx={{ width: { xs: "100%", sm: 280 }, mr: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          inputProps={{ "aria-label": "Search clubs" }}
        />
        <Chip
          label="All"
          onClick={() => setCategory(null)}
          color={category ? "default" : "primary"}
          variant={category ? "outlined" : "filled"}
        />
        {categories.map((c) => (
          <Chip
            key={c}
            label={c}
            onClick={() => setCategory(c === category ? null : c)}
            variant={c === category ? "filled" : "outlined"}
            sx={
              c === category
                ? { bgcolor: categoryColor(c), color: "#fff" }
                : { borderColor: categoryColor(c) }
            }
          />
        ))}
      </Box>
      {error ? (
        <ErrorNote error={error} what="the clubs" />
      ) : (
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "1fr 1fr",
            lg: "repeat(3, 1fr)",
          }}
          gap={2}
        >
          {data
            ? shown.map((o) => <ClubCard key={o.id} org={o} />)
            : Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} variant="rounded" height={220} />
              ))}
        </Box>
      )}
      {data && !shown.length && (
        <Typography color="text.secondary" textAlign="center" py={6}>
          No club matches that.
        </Typography>
      )}
      <OrganizationDialog open={creating} onClose={() => setCreating(false)} onSaved={reload} />
    </>
  );
}

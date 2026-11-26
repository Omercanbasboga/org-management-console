import { useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import { apiService, API_CONFIG, ENDPOINTS } from "../../api/client";
import useLoad from "../../hooks/useLoad";
import { usePersona } from "../../persona";
import Monogram from "../../components/Monogram";
import ErrorNote from "../../components/ErrorNote";
import { roleLabel } from "./roles";
import GeneralInfoTab from "./tabs/GeneralInfoTab";
import MembersTab from "./tabs/MembersTab";
import MeetingsTab from "./tabs/MeetingsTab";
import BudgetTab from "./tabs/BudgetTab";
import BylawsTab from "./tabs/BylawsTab";
import OrganizationDialog from "./OrganizationDialog";

const TABS = ["Overview", "Members", "Meetings", "Budget", "Bylaws"];

/**
 * One parameterised screen for a club and its sub-resources. The caller's
 * roles here decide which buttons show; the service enforces the same rules
 * and the toast explains any refusal.
 */
export default function OrganizationDetail() {
  const { id } = useParams();
  const { email } = usePersona();
  const [tab, setTab] = useState(0);
  const [editing, setEditing] = useState(false);
  const org = useLoad(() => apiService.get(ENDPOINTS.ORGANIZATIONS.DETAIL(id)), [id]);
  const members = useLoad(() => apiService.get(ENDPOINTS.MEMBERS.LIST_BY_ORG(id)), [id]);

  const myRoles = useMemo(
    () =>
      (members.data || [])
        .filter((m) => m.email?.toLowerCase() === email.toLowerCase())
        .map((m) => m.role),
    [members.data, email]
  );
  // only the demo knows who the admin is; against a real gateway, show every action and let the service decide
  const demo = API_CONFIG.DEMO || API_CONFIG.DEMO_HEADER;
  const admin = demo ? email === "admin@example.org" : true;
  const ctx = {
    orgId: id,
    org: org.data,
    myRoles,
    admin,
    reloadOrg: org.reload,
    members,
  };

  if (org.error) return <ErrorNote error={org.error} what="this club" />;
  const o = org.data;

  return (
    <>
      <Link
        component={RouterLink}
        to="/organizations"
        underline="hover"
        variant="body2"
        color="text.secondary"
      >
        All clubs
      </Link>
      <Paper
        sx={{
          mt: 1,
          mb: 2.5,
          p: { xs: 2, md: 3 },
          borderRadius: "16px",
          display: "flex",
          flexWrap: "wrap",
          gap: 2.5,
          alignItems: "center",
        }}
      >
        {o ? <Monogram org={o} size={72} /> : <Skeleton variant="rounded" width={72} height={72} />}
        <Box flex={1} minWidth={220}>
          <Typography variant="caption" color="text.secondary">
            {o
              ? `${o.category || "No category"}${o.foundingDate ? `, since ${o.foundingDate.slice(0, 4)}` : ""}`
              : " "}
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: "1.6rem", md: "2.1rem" } }}>
            {o ? o.name : <Skeleton width={260} />}
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
            {o && !o.isActive && (
              <Box
                component="span"
                sx={{
                  px: 1,
                  borderRadius: 99,
                  bgcolor: "action.selected",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                Closed
              </Box>
            )}
            {myRoles.length ? (
              myRoles.map((r) => (
                <Box
                  key={r}
                  component="span"
                  sx={{
                    px: 1,
                    borderRadius: 99,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  You: {roleLabel(r)}
                </Box>
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">
                {!demo
                  ? ""
                  : admin
                    ? "You are an admin here."
                    : "You are not a member of this club."}
              </Typography>
            )}
          </Box>
        </Box>
        {o &&
          (admin ||
            myRoles.some((r) =>
              ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "TREASURER"].includes(r)
            )) && (
            <Button variant="outlined" onClick={() => setEditing(true)}>
              Edit details
            </Button>
          )}
      </Paper>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 2.5, borderBottom: 1, borderColor: "divider" }}
      >
        {TABS.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>
      {tab === 0 && <GeneralInfoTab {...ctx} />}
      {tab === 1 && <MembersTab {...ctx} />}
      {tab === 2 && <MeetingsTab {...ctx} />}
      {tab === 3 && <BudgetTab {...ctx} />}
      {tab === 4 && <BylawsTab {...ctx} />}
      <OrganizationDialog
        open={editing}
        onClose={() => setEditing(false)}
        onSaved={org.reload}
        org={o}
      />
    </>
  );
}

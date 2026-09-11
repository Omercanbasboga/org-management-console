import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import { apiService, ENDPOINTS } from "../../api/client";
import GeneralInfoTab from "./tabs/GeneralInfoTab";
import MembersTab from "./tabs/MembersTab";
import MeetingsTab from "./tabs/MeetingsTab";
import BudgetTab from "./tabs/BudgetTab";
import BylawsTab from "./tabs/BylawsTab";

const TABS = ["General Info", "Members", "Meetings", "Budget", "Bylaws"];

/**
 * Tabbed detail view for a single organization. This is the same shape as
 * the AssignmentTab pattern used in the companion iam-admin-console repo:
 * one parameterized detail screen instead of a page per sub-resource.
 */
export default function OrganizationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiService
      .get(ENDPOINTS.ORGANIZATIONS.DETAIL(id))
      .then(setOrg)
      .catch((e) => console.error("Failed to load organization", e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {org && (
        <Card sx={{ mb: 3 }}>
          <Box p={3} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="caption" color="text.secondary">
                {org.category || "Uncategorized"}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h5" fontWeight="bold">
                  {org.name}
                </Typography>
                <Chip label={org.isActive ? "Active" : "Inactive"} color={org.isActive ? "success" : "default"} size="small" />
              </Box>
            </Box>
            <Box>
              <Button variant="outlined" onClick={() => navigate(`/organizations/${id}/edit`)}>
                Edit
              </Button>
              <Button sx={{ ml: 1 }} onClick={() => navigate("/organizations")}>
                Back
              </Button>
            </Box>
          </Box>
        </Card>
      )}

      <Card>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable">
          {TABS.map((label) => (
            <Tab key={label} label={label} />
          ))}
        </Tabs>
        <Box p={3}>
          {activeTab === 0 && <GeneralInfoTab org={org} />}
          {activeTab === 1 && <MembersTab orgId={id} />}
          {activeTab === 2 && <MeetingsTab orgId={id} />}
          {activeTab === 3 && <BudgetTab orgId={id} />}
          {activeTab === 4 && <BylawsTab orgId={id} />}
        </Box>
      </Card>
    </>
  );
}

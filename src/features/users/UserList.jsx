import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { apiService, ENDPOINTS } from "../../api/client";
import useLoad from "../../hooks/useLoad";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import ErrorNote from "../../components/ErrorNote";

const ROLE = { STUDENT: "Student", STAFF: "Staff", ADMIN: "Admin" };

export default function UserList() {
  const { data, error } = useLoad(() => apiService.get(ENDPOINTS.USERS.LIST));
  return (
    <>
      <PageHeader
        title="People"
        subtitle="Students and staff. Visible to admins, club officers and advisors, who need it to add members."
      />
      {error ? (
        <ErrorNote error={error} what="the directory" />
      ) : (
        <Paper sx={{ p: 2.5, borderRadius: "14px" }}>
          <DataTable
            searchable
            columns={[
              { header: "Name", accessor: "name" },
              { header: "Number", accessor: "memberId" },
              { header: "Department", accessor: "department" },
              { header: "Role", accessor: "role" },
            ]}
            rows={(data || []).map((u) => ({
              id: u.id,
              search: `${u.firstName} ${u.lastName} ${u.email} ${u.memberId} ${u.department}`,
              name: (
                <Box>
                  <Typography variant="body2" fontWeight={650}>
                    {u.firstName} {u.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {u.email}
                  </Typography>
                </Box>
              ),
              memberId: u.memberId,
              department: u.department,
              role: ROLE[u.role] || u.role,
            }))}
          />
        </Paper>
      )}
    </>
  );
}

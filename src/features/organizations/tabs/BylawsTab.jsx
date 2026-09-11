import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { apiService, ENDPOINTS } from "../../../api/client";

/**
 * Bylaws (statute) document upload + approval-status display. In the
 * original app an uploaded bylaws document enters the same pending-approval
 * queue as meetings and membership applications (see the approvals feature).
 */
export default function BylawsTab({ orgId }) {
  const [bylaws, setBylaws] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService
      .get(ENDPOINTS.BYLAWS.GET(orgId))
      .then(setBylaws)
      .catch(() => setBylaws(null))
      .finally(() => setLoading(false));
  }, [orgId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    await apiService.post(ENDPOINTS.BYLAWS.UPLOAD(orgId), form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {bylaws ? (
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography>{bylaws.fileName}</Typography>
          <Chip
            size="small"
            label={bylaws.approved ? "Approved" : "Pending approval"}
            color={bylaws.approved ? "success" : "warning"}
          />
        </Box>
      ) : (
        <Typography color="text.secondary" mb={2}>
          No bylaws document on file yet.
        </Typography>
      )}
      <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>
        Upload bylaws
        <input type="file" hidden onChange={handleUpload} />
      </Button>
    </Box>
  );
}

BylawsTab.propTypes = { orgId: PropTypes.string.isRequired };

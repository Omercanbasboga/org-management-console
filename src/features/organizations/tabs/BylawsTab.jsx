import { useRef } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import { useTheme } from "@mui/material/styles";
import { apiService, API_CONFIG, ENDPOINTS } from "../../../api/client";
import useLoad from "../../../hooks/useLoad";
import { useNotify } from "../../../components/Notify";
import StatusChip from "../../../components/StatusChip";
import StepTrack from "../../../components/StepTrack";
import ErrorNote from "../../../components/ErrorNote";
import { can } from "../roles";
import { queueChanged } from "../../../components/queueEvents";

const kb = (n) => `${Math.max(1, Math.round(n / 1024))} KB`;

export default function BylawsTab({ orgId, org, myRoles, admin }) {
  const t = useTheme().tokens;
  const notify = useNotify();
  const input = useRef(null);
  const { data, error, reload } = useLoad(
    () => apiService.get(ENDPOINTS.BYLAWS.HISTORY(orgId)),
    [orgId]
  );
  if (error) return <ErrorNote error={error} what="the bylaws" />;

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    try {
      await apiService.post(ENDPOINTS.BYLAWS.UPLOAD(orgId), form);
      notify(`${file.name} uploaded and sent for approval.`);
      reload();
      queueChanged();
    } catch (err) {
      notify(err.message, "error");
    }
  };

  const latest = data?.[0];
  const approved = data?.find((b) => b.approved);
  const live = !API_CONFIG.DEMO || API_CONFIG.DEMO_HEADER;

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: "1fr", md: "3fr 2fr" }}
      gap={2}
      alignItems="start"
    >
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: "14px" }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
          flexWrap="wrap"
        >
          <Box>
            <Typography variant="h3">In force</Typography>
            <Typography variant="body2" color="text.secondary">
              The last version an admin approved.
            </Typography>
          </Box>
          {can.uploadBylaws(myRoles, admin) && org?.isActive && (
            <>
              <input ref={input} type="file" hidden accept=".pdf,.docx,.odt" onChange={upload} />
              <Button
                variant="contained"
                startIcon={<UploadFileIcon />}
                onClick={() => input.current?.click()}
              >
                Upload new version
              </Button>
            </>
          )}
        </Box>
        {!data ? (
          <Skeleton height={90} />
        ) : approved ? (
          <Box
            display="flex"
            gap={2}
            alignItems="center"
            mt={2.5}
            p={2}
            sx={{ borderRadius: "12px", bgcolor: t.goodBg }}
          >
            <DescriptionIcon sx={{ color: t.good, fontSize: 36 }} />
            <Box flex={1} minWidth={0}>
              <Typography fontWeight={700} noWrap>
                {approved.fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {kb(approved.sizeBytes)}, uploaded {approved.uploadedAt.slice(0, 10)}
              </Typography>
            </Box>
            {live && <Button href={ENDPOINTS.BYLAWS.FILE(orgId, approved.id)}>Download</Button>}
          </Box>
        ) : (
          <Typography color="text.secondary" mt={2}>
            No approved bylaws yet.
          </Typography>
        )}
        {latest && !latest.approved && latest.status !== "REJECTED" && (
          <Box mt={2} p={2} sx={{ borderRadius: "12px", border: `1px dashed ${t.pending}` }}>
            <Typography variant="body2" fontWeight={700}>
              {latest.fileName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
              New version waiting for sign-off. It replaces the one above once both signatures are
              in.
            </Typography>
            <StepTrack status={latest.status} />
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
          PDF, DOCX or ODT, up to 5 MB.
        </Typography>
      </Paper>
      <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: "14px" }}>
        <Typography variant="h3" mb={1}>
          Versions
        </Typography>
        {(data || []).map((b) => (
          <Box
            key={b.id}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            gap={1}
            py={1.25}
            sx={{ borderTop: `1px solid ${t.line}` }}
          >
            <Box minWidth={0}>
              <Typography variant="body2" fontWeight={650} noWrap>
                {b.fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {b.uploadedAt.slice(0, 10)}
              </Typography>
            </Box>
            <StatusChip status={b.status} />
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

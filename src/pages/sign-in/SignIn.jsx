import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { API_CONFIG } from "../../api/client";
import { usePersona } from "../../persona";

/**
 * With a gateway, sign-in is a redirect to its OAuth2 endpoint (see
 * sso-gateway-bff): this app never handles a password or a token. In the
 * demo there is nothing to sign in to, so it offers the three seats instead.
 */
export default function SignIn() {
  const navigate = useNavigate();
  const { setEmail } = usePersona();
  const demo = API_CONFIG.DEMO || API_CONFIG.DEMO_HEADER;

  const gateway = () => {
    window.location.href = `${API_CONFIG.BASE_URL}${process.env.REACT_APP_OAUTH_PATH || "/oauth2/authorization/org-console"}`;
  };
  const as = (email, to) => {
    setEmail(email);
    navigate(to);
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      px={2}
      bgcolor="background.default"
    >
      <Paper sx={{ p: { xs: 3, sm: 4 }, width: 420, borderRadius: "16px" }}>
        <Typography variant="h2" mb={0.5}>
          Club Office
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          {demo
            ? "Pick a seat. You can switch at any time from the top bar."
            : "Sign in with your university account."}
        </Typography>
        {demo ? (
          <Box display="grid" gap={1}>
            <Button variant="contained" onClick={() => as("advisor3@example.org", "/approvals")}>
              Chess Society advisor
            </Button>
            <Button variant="outlined" onClick={() => as("admin@example.org", "/approvals")}>
              Student affairs admin
            </Button>
            <Button onClick={() => as("admin@example.org", "/organizations")}>
              Just look around
            </Button>
          </Box>
        ) : (
          <Button variant="contained" fullWidth onClick={gateway}>
            Sign in
          </Button>
        )}
      </Paper>
    </Box>
  );
}

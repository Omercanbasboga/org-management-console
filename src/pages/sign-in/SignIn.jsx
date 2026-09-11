import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { API_CONFIG } from "../../api/client";

/**
 * Login just redirects to the BFF gateway's OAuth2 authorization endpoint
 * (see the companion sso-gateway-bff repo) — this app never handles a
 * password or a token directly.
 */
export default function SignIn() {
  const handleSignIn = () => {
    window.location.href = `${API_CONFIG.BASE_URL}${process.env.REACT_APP_OAUTH_PATH || "/oauth2/authorization/org-console"}`;
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh" bgcolor="grey.100">
      <Card sx={{ p: 4, width: 360, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Org Console
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Sign in with your organization account to continue.
        </Typography>
        <Button variant="contained" fullWidth onClick={handleSignIn}>
          Sign in
        </Button>
      </Card>
    </Box>
  );
}

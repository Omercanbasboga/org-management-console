import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { apiService } from "../api/client";

export default function Navbar() {
  const handleSignOut = async () => {
    await apiService.post("/api/v1/auth/logout").catch(() => {});
    window.location.href = "/sign-in";
  };

  return (
    <AppBar position="fixed" color="default" elevation={0} sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: "flex-end" }}>
        <Typography variant="body2" sx={{ mr: 2 }} color="text.secondary">
          Signed in via SSO
        </Typography>
        <Button size="small" onClick={handleSignOut}>
          Sign out
        </Button>
      </Toolbar>
    </AppBar>
  );
}

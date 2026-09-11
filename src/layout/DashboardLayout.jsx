import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Navbar from "./Navbar";
import Sidenav from "./Sidenav";

export default function DashboardLayout({ children }) {
  return (
    <Box sx={{ display: "flex" }}>
      <Navbar />
      <Sidenav />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

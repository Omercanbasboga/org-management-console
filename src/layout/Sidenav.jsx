import { NavLink } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import CategoryIcon from "@mui/icons-material/Category";
import PlaceIcon from "@mui/icons-material/Place";
import GroupIcon from "@mui/icons-material/Group";

const DRAWER_WIDTH = 260;

const links = [
  { to: "/organizations", label: "Organizations", icon: <CorporateFareIcon /> },
  { to: "/approvals", label: "Pending Approvals", icon: <NotificationsActiveIcon /> },
  { to: "/categories", label: "Categories", icon: <CategoryIcon /> },
  { to: "/locations", label: "Locations", icon: <PlaceIcon /> },
  { to: "/users", label: "Users", icon: <GroupIcon /> },
];

export default function Sidenav() {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: "border-box" },
      }}
    >
      <Toolbar>
        <Typography variant="h6" noWrap fontWeight="bold">
          Org Console
        </Typography>
      </Toolbar>
      <List>
        {links.map((link) => (
          <ListItemButton
            key={link.to}
            component={NavLink}
            to={link.to}
            sx={{ "&.active": { bgcolor: "action.selected" } }}
          >
            <ListItemIcon>{link.icon}</ListItemIcon>
            <ListItemText primary={link.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

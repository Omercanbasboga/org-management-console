import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import GroupsIcon from "@mui/icons-material/Groups";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BadgeIcon from "@mui/icons-material/Badge";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { apiService, API_CONFIG, ENDPOINTS } from "../api/client";
import { personasFrom, usePersona } from "../persona";
import { QUEUE_CHANGED } from "../components/queueEvents";

const RAIL = 236;
const REPO = "https://github.com/Omercanbasboga/org-management-console";

const LINKS = [
  {
    to: "/organizations",
    label: "Clubs",
    icon: <GroupsIcon fontSize="small" />,
  },
  {
    to: "/approvals",
    label: "Approvals",
    icon: <TaskAltIcon fontSize="small" />,
    badge: true,
  },
  {
    to: "/categories",
    label: "Categories",
    icon: <LocalOfferIcon fontSize="small" />,
  },
  {
    to: "/locations",
    label: "Rooms",
    icon: <MeetingRoomIcon fontSize="small" />,
  },
  { to: "/users", label: "People", icon: <BadgeIcon fontSize="small" /> },
];

function Rail({ waiting, onNavigate }) {
  const t = useTheme().tokens;
  return (
    <Box
      sx={{
        height: "100%",
        bgcolor: t.rail,
        color: t.railInk,
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      <Box display="flex" alignItems="center" gap={1.25} px={1} pt={0.5} pb={3}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3px",
            width: 22,
            height: 22,
          }}
          aria-hidden
        >
          {["#6250D6", "#14946A", "#2A6FC9", "#D2572A"].map((c) => (
            <Box key={c} sx={{ bgcolor: c, borderRadius: "3px" }} />
          ))}
        </Box>
        <Typography sx={{ color: "#fff", fontWeight: 800, letterSpacing: "-0.01em" }}>
          Club Office
        </Typography>
      </Box>
      <Box component="nav" display="grid" gap={0.5}>
        {LINKS.map((l) => (
          <Box
            key={l.to}
            component={NavLink}
            to={l.to}
            onClick={onNavigate}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 1.5,
              py: 1,
              borderRadius: "8px",
              color: "inherit",
              textDecoration: "none",
              fontWeight: 600,
              fontSize: "0.92rem",
              "&:hover": { bgcolor: "rgba(255,255,255,0.06)", color: "#fff" },
              "&.active": { bgcolor: "rgba(255,255,255,0.10)", color: "#fff" },
              "&:focus-visible": {
                outline: "2px solid #8C97F2",
                outlineOffset: 1,
              },
            }}
          >
            {l.icon}
            <Box flex={1}>{l.label}</Box>
            {l.badge && waiting > 0 && (
              <Box
                sx={{
                  minWidth: 22,
                  px: 0.75,
                  borderRadius: 99,
                  bgcolor: "#F2B84B",
                  color: "#1B2340",
                  fontSize: "0.74rem",
                  fontWeight: 800,
                  textAlign: "center",
                }}
              >
                {waiting}
              </Box>
            )}
          </Box>
        ))}
      </Box>
      <Box flex={1} />
      <Typography variant="caption" sx={{ px: 1, lineHeight: 1.5, opacity: 0.8 }}>
        {API_CONFIG.DEMO && !API_CONFIG.DEMO_HEADER
          ? "Demo: data lives in your browser and resets on reload. "
          : ""}
        <Box component="a" href={REPO} sx={{ color: "#fff" }}>
          Source
        </Box>
      </Typography>
    </Box>
  );
}

function PersonaSwitcher({ personas }) {
  const { email, setEmail } = usePersona();
  const [anchor, setAnchor] = useState(null);
  const me = personas.find((p) => p.email === email) || {
    name: email,
    label: "",
  };
  const groups = [
    ["Admin", personas.filter((p) => p.label === "Admin")],
    ["Advisors", personas.filter((p) => p.label.startsWith("Advisor"))],
    ["Presidents", personas.filter((p) => p.label.startsWith("President"))],
  ];
  return (
    <>
      <Button
        onClick={(e) => setAnchor(e.currentTarget)}
        endIcon={<ExpandMoreIcon />}
        aria-haspopup="menu"
        sx={{
          color: "text.primary",
          textAlign: "left",
          lineHeight: 1.2,
          px: 1.5,
          borderRadius: "10px",
          border: 1,
          borderColor: "divider",
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Viewing as
          </Typography>
          <Typography
            variant="body2"
            fontWeight={700}
            noWrap
            sx={{ maxWidth: { xs: 150, sm: 260 } }}
          >
            {me.name}
            {me.label && me.label !== "Admin" ? `, ${me.label.split(",")[0].toLowerCase()}` : ""}
          </Typography>
        </Box>
      </Button>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        PaperProps={{ sx: { maxHeight: 440, width: 320 } }}
      >
        {groups.map(([title, list]) => [
          <ListSubheader key={title} sx={{ lineHeight: "32px", fontWeight: 700 }}>
            {title}
          </ListSubheader>,
          ...list.map((p) => (
            <MenuItem
              key={p.email}
              selected={p.email === email}
              onClick={() => {
                setEmail(p.email);
                setAnchor(null);
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={650}>
                  {p.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {p.label === "Admin" ? "Signs the second step" : p.label.split(", ")[1]}
                </Typography>
              </Box>
            </MenuItem>
          )),
        ])}
      </Menu>
    </>
  );
}

export default function Shell({ children, mode, toggleMode }) {
  const theme = useTheme();
  const t = theme.tokens;
  const wide = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useState(false);
  const [personas, setPersonas] = useState([]);
  const [waiting, setWaiting] = useState(0);
  const { email } = usePersona();
  const location = useLocation();
  const demo = API_CONFIG.DEMO || API_CONFIG.DEMO_HEADER;

  useEffect(() => {
    if (demo)
      apiService
        .get(ENDPOINTS.ORGANIZATIONS.LIST)
        .then((o) => setPersonas(personasFrom(o)))
        .catch(() => {});
  }, [demo]);

  // the badge on Approvals: what the current persona can sign right now
  useEffect(() => {
    const count = () =>
      apiService
        .get(ENDPOINTS.APPROVALS.QUEUE)
        .then((q) =>
          setWaiting(q.membershipRequests.length + q.meetings.length + q.bylawsUploads.length)
        )
        .catch(() => setWaiting(0));
    count();
    window.addEventListener(QUEUE_CHANGED, count);
    return () => window.removeEventListener(QUEUE_CHANGED, count);
  }, [email, location.pathname]);

  const signOut = async () => {
    await apiService.post("/api/v1/auth/logout").catch(() => {});
    window.location.href = `${process.env.PUBLIC_URL}/sign-in`;
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: t.page }}>
      {wide ? (
        <Box sx={{ width: RAIL, flexShrink: 0, bgcolor: t.rail }}>
          <Box sx={{ position: "sticky", top: 0, height: "100vh" }}>
            <Rail waiting={waiting} />
          </Box>
        </Box>
      ) : (
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          PaperProps={{ sx: { width: RAIL, border: "none" } }}
        >
          <Rail waiting={waiting} onNavigate={() => setOpen(false)} />
        </Drawer>
      )}
      <Box flex={1} minWidth={0}>
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            bgcolor: t.page + "E6",
            backdropFilter: "blur(8px)",
            borderBottom: `1px solid ${t.line}`,
            height: 68,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: { xs: 1.5, md: 4 },
          }}
        >
          {!wide && (
            <IconButton onClick={() => setOpen(true)} aria-label="Open menu">
              <MenuIcon />
            </IconButton>
          )}
          <Box flex={1} />
          {demo && personas.length > 0 && <PersonaSwitcher personas={personas} />}
          <Tooltip title={mode === "dark" ? "Light theme" : "Dark theme"}>
            <IconButton onClick={toggleMode} aria-label="Switch theme">
              {mode === "dark" ? (
                <LightModeIcon fontSize="small" />
              ) : (
                <DarkModeIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          {!demo && (
            <Button size="small" onClick={signOut}>
              Sign out
            </Button>
          )}
        </Box>
        <Box component="main" sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 }, maxWidth: 1280 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}

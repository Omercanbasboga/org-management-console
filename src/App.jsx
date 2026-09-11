import { Routes, Route, Navigate } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import DashboardLayout from "./layout/DashboardLayout";
import SignIn from "./pages/sign-in/SignIn";
import routes from "./routes";

export default function App() {
  return (
    <>
      <CssBaseline />
      <Routes>
        <Route path="/sign-in" element={<SignIn />} />
        <Route
          path="/*"
          element={
            <DashboardLayout>
              <Routes>
                {routes.map(({ path, component: Component }) => (
                  <Route key={path} path={path} element={<Component />} />
                ))}
                <Route path="/" element={<Navigate to="/organizations" replace />} />
              </Routes>
            </DashboardLayout>
          }
        />
      </Routes>
    </>
  );
}

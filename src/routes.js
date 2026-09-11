import OrganizationList from "./features/organizations/OrganizationList";
import OrganizationDetail from "./features/organizations/OrganizationDetail";
import PendingApprovalsPage from "./features/approvals/PendingApprovalsPage";
import CategoryList from "./features/categories/CategoryList";
import LocationList from "./features/locations/LocationList";
import UserList from "./features/users/UserList";

const routes = [
  { path: "/organizations", component: OrganizationList },
  { path: "/organizations/:id", component: OrganizationDetail },
  { path: "/approvals", component: PendingApprovalsPage },
  { path: "/categories", component: CategoryList },
  { path: "/locations", component: LocationList },
  { path: "/users", component: UserList },
];

export default routes;

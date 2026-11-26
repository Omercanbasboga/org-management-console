export const ROLE_LABEL = {
  PRESIDENT: "President",
  VICE_PRESIDENT: "Vice president",
  SECRETARY: "Secretary",
  TREASURER: "Treasurer",
  MEMBER: "Member",
  ADVISOR: "Advisor",
};
export const roleLabel = (r) => ROLE_LABEL[r] || r;

export const OFFICERS = ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "TREASURER"];
export const can = {
  manageMembers: (roles, admin) =>
    admin || roles.some((r) => ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY"].includes(r)),
  scheduleMeetings: (roles, admin) => admin || roles.some((r) => OFFICERS.includes(r)),
  seeLedger: (roles, admin) => admin || roles.some((r) => OFFICERS.includes(r) || r === "ADVISOR"),
  recordMoney: (roles, admin) =>
    admin || roles.some((r) => ["PRESIDENT", "VICE_PRESIDENT", "TREASURER"].includes(r)),
  uploadBylaws: (roles, admin) =>
    admin || roles.some((r) => r === "PRESIDENT" || r === "SECRETARY"),
};

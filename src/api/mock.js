// In-browser stand-in for org-management-service, used by the GitHub Pages demo.
// The rules follow the service: two signatures (advisor, then admin), roles
// inside each club, no overdrawn books, bylaws as PDF/DOCX/ODT only. Errors
// carry the same status codes, so the UI behaves as it would against the API.

const FIRST = [
  "Ada",
  "Bora",
  "Cem",
  "Defne",
  "Ece",
  "Emir",
  "Deniz",
  "Ilgaz",
  "Kerem",
  "Lale",
  "Mert",
  "Nil",
  "Onur",
  "Pelin",
  "Rüzgar",
  "Selin",
  "Tuna",
  "Umut",
  "Yağmur",
  "Zeynep",
  "Arda",
  "Beren",
  "Can",
  "Duru",
  "Eren",
  "Gizem",
  "Hakan",
  "İpek",
  "Kaan",
  "Mina",
];
const LAST = [
  "Aksoy",
  "Balcı",
  "Çetin",
  "Demir",
  "Erdem",
  "Gök",
  "Kaya",
  "Kılıç",
  "Korkmaz",
  "Öztürk",
  "Polat",
  "Sarı",
  "Şahin",
  "Tekin",
  "Uslu",
  "Yalçın",
  "Yıldız",
  "Zengin",
];
const DEPTS = [
  "Computer Engineering",
  "Physics",
  "History",
  "Economics",
  "Molecular Biology",
  "Civil Engineering",
  "Philosophy",
  "Mathematics",
  "Psychology",
  "Architecture",
];
const CLUBS = [
  [
    "Photography Club",
    "PHOTO",
    "Arts",
    "Weekly photo walks, a darkroom on the third floor and a show every spring.",
    18,
    6200,
  ],
  [
    "Mountaineering Club",
    "MOUNT",
    "Sports",
    "Day hikes most weekends, two winter climbs a year and a gear library.",
    22,
    14800,
  ],
  [
    "Chess Society",
    "CHESS",
    "Games",
    "Open play on Tuesdays, a rated league and the inter-university cup.",
    12,
    2100,
  ],
  [
    "Robotics Team",
    "ROBO",
    "Science and technology",
    "Builds one competition robot a year and runs workshops for first-years.",
    16,
    23500,
  ],
  [
    "Film Society",
    "FILM",
    "Arts",
    "Screens a film every Thursday and makes one short of its own each term.",
    14,
    4300,
  ],
  [
    "Debate Union",
    "DEBATE",
    "Academic",
    "British Parliamentary debate practice twice a week and two tournaments a term.",
    10,
    3000,
  ],
];
const MEETINGS = [
  ["Term planning", "Budget review", "Spring show selection", "Darkroom induction"],
  ["Winter climb briefing", "Gear check", "First aid refresher", "Route planning"],
  ["League round 4", "Cup team selection", "Openings workshop", "Simul night"],
  ["Design review", "Motor driver test", "Sponsor call", "Workshop for first-years"],
  ["Screening schedule", "Short film pitch night", "Editing workshop", "Festival trip planning"],
  ["Motion practice", "Tournament prep", "Judging workshop", "Novice night"],
];
const OFFICERS = ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "TREASURER"];
const DAY = 86_400_000;

let seq = 0;
const id = () => `d-${(++seq).toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
let seed = 11;
const rnd = (n) => {
  seed = (seed * 16807) % 2147483647;
  return seed % n;
};
const ascii = (s) =>
  s
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/i̇/g, "i");
const isoDate = (t) => new Date(t).toISOString().slice(0, 10);
// local wall-clock time without a zone, like the service's LocalDateTime
const isoLocal = (t) => {
  const d = new Date(t);
  const p2 = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}:00`;
};

const db = {
  people: [],
  categories: [],
  locations: [],
  orgs: [],
  members: [],
  meetings: [],
  txs: [],
  bylaws: [],
  approvals: [],
};

function build() {
  const now = Date.now();
  db.people.push({
    id: id(),
    firstName: "Demo",
    lastName: "Admin",
    email: "admin@example.org",
    memberId: "S-0001",
    department: "Student Affairs",
    role: "ADMIN",
  });
  [
    ["Hall A, Main Building", 120],
    ["Seminar Room 2", 40],
    ["Student Centre, Room 3", 25],
    ["Sports Hall", 200],
    ["Library Group Room", 12],
  ].forEach(([name, capacity]) => db.locations.push({ id: id(), name, capacity }));
  const students = [];
  for (let i = 0; i < 90; i++) {
    const first = FIRST[i % FIRST.length];
    const last = LAST[(i * 7 + Math.floor(i / FIRST.length)) % LAST.length];
    const p = {
      id: id(),
      firstName: first,
      lastName: last,
      email: `${ascii(first)}.${ascii(last)}${i >= FIRST.length ? Math.floor(i / FIRST.length) : ""}@students.example.org`,
      memberId: `2024${String(1000 + i)}`,
      department: DEPTS[i % DEPTS.length],
      role: "STUDENT",
    };
    db.people.push(p);
    students.push(p);
  }
  let s = 0;
  CLUBS.forEach(([name, shortName, category, description, size, opening], c) => {
    let cat = db.categories.find((x) => x.name === category);
    if (!cat) db.categories.push((cat = { id: id(), name: category }));
    const org = {
      id: id(),
      name,
      shortName,
      description,
      email: `${shortName.toLowerCase()}@clubs.example.org`,
      website: null,
      foundingDate: `${1985 + c * 6}-${String(1 + c).padStart(2, "0")}-${10 + c}`,
      categoryId: cat.id,
      locationId: db.locations[c % 5].id,
      isActive: true,
    };
    db.orgs.push(org);
    const advisor = {
      id: id(),
      firstName: FIRST[(c * 5 + 3) % 30],
      lastName: LAST[(c * 3 + 5) % 18],
      email: `advisor${c + 1}@example.org`,
      memberId: `P-${300 + c}`,
      department: DEPTS[(c + 4) % 10],
      role: "STAFF",
    };
    db.people.push(advisor);
    member(org, advisor, "ADVISOR", "APPROVED", now - 900 * DAY);
    for (let k = 0; k < size; k++) {
      const p = students[s++ % students.length];
      member(
        org,
        p,
        k < 4 ? OFFICERS[k] : "MEMBER",
        "APPROVED",
        now - (30 + rnd(700)) * DAY,
        k % 9 === 8 ? "RESERVE" : "FULL"
      );
    }
    const ask = (p, status) => {
      const m = member(org, p, "MEMBER", status, null);
      approval("MEMBERSHIP", m.id, org, status, p.email, now - (1 + rnd(5)) * DAY);
    };
    ask(students[(s + 3) % students.length], "PENDING_ADVISOR");
    if (c % 2 === 0) ask(students[(s + 7) % students.length], "PENDING_ADMIN");

    const base = new Date(now);
    base.setHours(18, 0, 0, 0);
    MEETINGS[c].forEach((title, i) =>
      db.meetings.push({
        id: id(),
        orgId: org.id,
        title,
        description: `Regular ${name.toLowerCase()} meeting.`,
        date: isoLocal(base.getTime() - (70 - i * 21) * DAY),
        locationId: db.locations[(c + i) % 5].id,
        attendeeCount: 8 + rnd(10),
        status: "APPROVED",
      })
    );
    const st = c % 3 === 0 ? "PENDING_ADMIN" : "PENDING_ADVISOR";
    const next = {
      id: id(),
      orgId: org.id,
      title: c % 2 === 0 ? "End of term meeting" : "Election of officers",
      description: "Needs a room booking once approved.",
      date: isoLocal(base.getTime() + (9 + c) * DAY),
      locationId: db.locations[c % 5].id,
      attendeeCount: 12 + c,
      status: st,
    };
    db.meetings.push(next);
    approval("MEETING", next.id, org, st, org.email, now - 2 * DAY);

    const start = now - 150 * DAY;
    tx(org, "INCOME", opening, "Grant", "Faculty grant for the year", start);
    const inc = ["Membership fees", "Sponsor", "Event tickets"];
    const exp = ["Equipment", "Travel", "Printing", "Venue", "Food"];
    for (let i = 0; i < 14; i++) {
      const t = start + (8 + i * 10) * DAY;
      const income = i % 3 === 0;
      const cat2 = income ? inc[i % 3] : exp[(i + c) % 5];
      tx(
        org,
        income ? "INCOME" : "EXPENSE",
        income ? 300 + rnd(1500) : 120 + rnd(Math.max(200, Math.floor(opening / 14))),
        cat2,
        `${cat2}, ${new Date(t).toLocaleString("en", { month: "long" }).toLowerCase()}`,
        t
      );
    }
    db.bylaws.push({
      id: id(),
      orgId: org.id,
      fileName: `${shortName.toLowerCase()}-bylaws-2023.pdf`,
      sizeBytes: 48211,
      uploadedAt: new Date(now - 700 * DAY).toISOString(),
      status: "APPROVED",
    });
    if (c === 1 || c === 3) {
      const draft = {
        id: id(),
        orgId: org.id,
        fileName: `${shortName.toLowerCase()}-bylaws-2026-draft.pdf`,
        sizeBytes: 51377,
        uploadedAt: new Date(now - 3 * DAY).toISOString(),
        status: "PENDING_ADMIN",
      };
      db.bylaws.push(draft);
      approval("BYLAWS", draft.id, org, "PENDING_ADMIN", org.email, now - 3 * DAY);
    }
  });

  function member(org, person, role, status, joinedAt, type = "FULL") {
    const m = {
      id: id(),
      orgId: org.id,
      personId: person.id,
      role,
      type,
      status,
      joinedAt: joinedAt ? new Date(joinedAt).toISOString() : null,
      leftAt: null,
    };
    db.members.push(m);
    return m;
  }
  function tx(org, type, amount, category, description, t) {
    db.txs.push({
      id: id(),
      orgId: org.id,
      type,
      amount: Math.round(amount * 100) / 100,
      currency: "TRY",
      category,
      description,
      date: isoDate(t),
      recordedBy: "demo",
      createdAt: t,
    });
  }
}

function approval(kind, subjectId, org, status, requestedBy, at = Date.now()) {
  const a = {
    id: id(),
    kind,
    subjectId,
    orgId: org.id,
    status,
    requestedBy,
    requestedAt: new Date(at).toISOString(),
  };
  db.approvals.push(a);
  return a;
}

build();

// ---- helpers ------------------------------------------------------------

const fail = (status, message) => {
  const e = new Error(message);
  e.status = status;
  throw e;
};
const person = (pid) => db.people.find((p) => p.id === pid);
const byEmail = (email) =>
  db.people.find((p) => p.email.toLowerCase() === String(email).toLowerCase());
const orgOf = (oid) =>
  db.orgs.find((o) => o.id === oid) || fail(404, `Organization not found: ${oid}`);
const current = (oid) =>
  db.members.filter((m) => m.orgId === oid && m.status === "APPROVED" && !m.leftAt);
const hasAdvisor = (oid) => current(oid).some((m) => m.role === "ADVISOR");
const isAdmin = (email) => byEmail(email)?.role === "ADMIN";
const rolesIn = (oid, email) =>
  current(oid)
    .filter((m) => person(m.personId).email === email)
    .map((m) => m.role);
const isOfficer = (r) => OFFICERS.includes(r);
const fullName = (p) => `${p.firstName} ${p.lastName}`;

function requireRole(oid, email, allowed, action) {
  if (isAdmin(email) || rolesIn(oid, email).some(allowed)) return;
  fail(403, `You can't ${action} in this organization.`);
}
const requireAdmin = (email, action) => isAdmin(email) || fail(403, `Only an admin can ${action}.`);
const firstStep = (oid) => (hasAdvisor(oid) ? "PENDING_ADVISOR" : "PENDING_ADMIN");

function orgDto(o) {
  const cur = current(o.id);
  const officer = (role) => {
    const m = cur.find((x) => x.role === role);
    if (!m) return null;
    const p = person(m.personId);
    return {
      personId: p.id,
      name: fullName(p),
      memberId: p.memberId,
      email: p.email,
      department: p.department,
    };
  };
  const cat = db.categories.find((c) => c.id === o.categoryId);
  const loc = db.locations.find((l) => l.id === o.locationId);
  return {
    ...o,
    category: cat?.name ?? null,
    location: loc?.name ?? null,
    president: officer("PRESIDENT"),
    advisor: officer("ADVISOR"),
    memberCount: cur.filter((m) => m.role !== "ADVISOR").length,
  };
}
function memberDto(m) {
  const p = person(m.personId);
  return {
    id: m.id,
    personId: p.id,
    name: fullName(p),
    memberId: p.memberId,
    email: p.email,
    department: p.department,
    role: m.role,
    type: m.type,
    status: m.status,
    joinedAt: m.joinedAt,
  };
}
function meetingDto(m) {
  const l = db.locations.find((x) => x.id === m.locationId);
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    date: m.date,
    locationId: m.locationId,
    location: l?.name ?? null,
    attendeeCount: m.attendeeCount,
    status: m.status,
    approved: m.status === "APPROVED",
  };
}
const bylawsDto = (b) => ({
  id: b.id,
  fileName: b.fileName,
  sizeBytes: b.sizeBytes,
  uploadedAt: b.uploadedAt,
  status: b.status,
  approved: b.status === "APPROVED",
});
const totals = (oid) => {
  const sum = (type) =>
    db.txs.filter((t) => t.orgId === oid && t.type === type).reduce((n, t) => n + t.amount, 0);
  const income = sum("INCOME");
  const expenses = sum("EXPENSE");
  return {
    currency: "TRY",
    income: +income.toFixed(2),
    expenses: +expenses.toFixed(2),
    balance: +(income - expenses).toFixed(2),
  };
};

function subject(a) {
  if (a.kind === "MEMBERSHIP") return db.members.find((m) => m.id === a.subjectId);
  if (a.kind === "MEETING") return db.meetings.find((m) => m.id === a.subjectId);
  return db.bylaws.find((b) => b.id === a.subjectId);
}
function describe(a) {
  const s = subject(a);
  if (!s) return "(removed)";
  if (a.kind === "MEMBERSHIP") {
    const p = person(s.personId);
    return (
      fullName(p) + (s.role === "MEMBER" ? "" : ` as ${s.role.toLowerCase().replace("_", " ")}`)
    );
  }
  return a.kind === "MEETING" ? s.title : s.fileName;
}
function withdraw(kind, subjectId) {
  db.approvals
    .filter((a) => a.kind === kind && a.subjectId === subjectId && a.status.startsWith("PENDING"))
    .forEach((a) => {
      a.status = "REJECTED";
      a.rejectReason = "Withdrawn.";
    });
}
function decide(aid, approve, email, reason) {
  const a = db.approvals.find((x) => x.id === aid) || fail(404, `Approval not found: ${aid}`);
  if (!a.status.startsWith("PENDING"))
    fail(409, `This request was already ${a.status.toLowerCase()}.`);
  const org = orgOf(a.orgId);
  if (!org.isActive && approve)
    fail(409, `${org.name} is closed; its requests can only be rejected.`);
  const advisor = rolesIn(a.orgId, email).includes("ADVISOR");
  const who =
    a.status === "PENDING_ADVISOR" && advisor
      ? "ADVISOR"
      : isAdmin(email)
        ? "ADMIN"
        : advisor
          ? "ADVISOR"
          : "NOBODY";
  const turn =
    (a.status === "PENDING_ADVISOR" && who === "ADVISOR") ||
    (a.status === "PENDING_ADMIN" && who === "ADMIN");
  if (!turn)
    fail(
      403,
      a.status === "PENDING_ADVISOR"
        ? "This request is waiting for the organization's advisor."
        : "This request is waiting for an admin."
    );
  const next = !approve
    ? "REJECTED"
    : a.status === "PENDING_ADVISOR"
      ? "PENDING_ADMIN"
      : "APPROVED";
  a.status = next;
  a.decidedBy = email;
  if (!approve) a.rejectReason = reason || null;
  const s = subject(a);
  if (s) {
    s.status = next;
    if (a.kind === "MEMBERSHIP" && next === "APPROVED") s.joinedAt = new Date().toISOString();
  }
  return { status: next };
}

const wait = (v) =>
  new Promise((r) =>
    setTimeout(
      () => r(v === undefined ? null : JSON.parse(JSON.stringify(v))),
      90 + Math.random() * 140
    )
  );

// ---- routing ------------------------------------------------------------

const routes = [];
const on = (method, pattern, fn) =>
  routes.push({
    method,
    re: new RegExp(`^${pattern.replace(/:\w+/g, "([^/?]+)")}(?:\\?(.*))?$`),
    fn,
  });
const P = "/api/v1";

on("get", `${P}/organizations`, () =>
  [...db.orgs].sort((a, b) => a.name.localeCompare(b.name)).map(orgDto)
);
on("get", `${P}/organizations/:id`, (_, me, oid) => orgDto(orgOf(oid)));
on("post", `${P}/organizations`, (body, me) => {
  requireAdmin(me, "create an organization");
  if (!body?.name?.trim()) fail(400, "name must not be blank");
  const o = { id: id(), isActive: true, ...body, name: body.name.trim() };
  db.orgs.push(o);
  return orgDto(o);
});
on("put", `${P}/organizations/:id`, (body, me, oid) => {
  const o = orgOf(oid);
  requireRole(oid, me, isOfficer, "edit the details");
  if (
    !isAdmin(me) &&
    ((body.categoryId ?? null) !== (o.categoryId ?? null) ||
      (body.locationId ?? null) !== (o.locationId ?? null))
  ) {
    fail(403, "Only an admin can change the category or the usual location.");
  }
  Object.assign(o, body, { name: body.name.trim() });
  return orgDto(o);
});
on("delete", `${P}/organizations/:id`, (_, me, oid) => {
  requireAdmin(me, "close an organization");
  orgOf(oid).isActive = false;
});

on("get", `${P}/organizations/:id/members`, (_, me, oid) => {
  orgOf(oid);
  const order = ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY", "TREASURER", "MEMBER", "ADVISOR"];
  return current(oid)
    .map(memberDto)
    .sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role) || a.name.localeCompare(b.name));
});
on("post", `${P}/organizations/:id/members`, (body, me, oid) => {
  const org = orgOf(oid);
  if (!org.isActive) fail(409, "This organization is closed.");
  const p = person(body.personId) || fail(404, `Person not found: ${body.personId}`);
  const role = body.role || "MEMBER";
  const self = p.email === me;
  if (role === "ADVISOR") {
    requireAdmin(me, "appoint an advisor");
    if (p.role !== "STAFF") fail(400, "An advisor has to be a member of staff.");
  } else if (!(self && role === "MEMBER")) {
    requireRole(
      oid,
      me,
      (r) => ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY"].includes(r),
      "add members or give out roles"
    );
  }
  if (
    db.members.some(
      (m) => m.orgId === oid && m.personId === p.id && !m.leftAt && m.status !== "REJECTED"
    )
  ) {
    fail(409, `${fullName(p)} is already a member or has a request open.`);
  }
  const m = {
    id: id(),
    orgId: oid,
    personId: p.id,
    role,
    type: body.type || "FULL",
    status: "APPROVED",
    joinedAt: null,
    leftAt: null,
  };
  db.members.push(m);
  if (role === "ADVISOR") m.joinedAt = new Date().toISOString();
  else {
    m.status = firstStep(oid);
    approval("MEMBERSHIP", m.id, org, m.status, me);
  }
  return memberDto(m);
});
on("delete", `${P}/organizations/:id/members/:mid`, (_, me, oid, mid) => {
  const m =
    db.members.find((x) => x.id === mid && x.orgId === oid) ||
    fail(404, `Membership not found: ${mid}`);
  const self = person(m.personId).email === me;
  if (m.role === "ADVISOR") requireAdmin(me, "remove an advisor");
  else if (!self)
    requireRole(
      oid,
      me,
      (r) => ["PRESIDENT", "VICE_PRESIDENT", "SECRETARY"].includes(r),
      "remove members"
    );
  if (m.status.startsWith("PENDING")) {
    withdraw("MEMBERSHIP", m.id);
    m.status = "REJECTED";
    return;
  }
  if (m.status !== "APPROVED" || m.leftAt) fail(409, "That membership isn't active.");
  m.leftAt = new Date().toISOString();
  if (m.role === "ADVISOR" && !hasAdvisor(oid)) {
    db.approvals
      .filter((a) => a.orgId === oid && a.status === "PENDING_ADVISOR")
      .forEach((a) => {
        a.status = "PENDING_ADMIN";
        const s = subject(a);
        if (s) s.status = "PENDING_ADMIN";
      });
  }
});

const canMeet = isOfficer;
function applyMeeting(m, body) {
  if (!body?.title?.trim()) fail(400, "title must not be blank");
  if (!body.date) fail(400, "date must not be null");
  const loc = body.locationId ? db.locations.find((l) => l.id === body.locationId) : null;
  if (loc && body.attendeeCount && Number(body.attendeeCount) > loc.capacity)
    fail(400, `${loc.name} holds ${loc.capacity} people.`);
  Object.assign(m, {
    title: body.title.trim(),
    description: body.description || null,
    date: body.date,
    locationId: body.locationId || null,
    attendeeCount: body.attendeeCount ? Number(body.attendeeCount) : null,
  });
}
on("get", `${P}/organizations/:id/meetings`, (_, me, oid) => {
  orgOf(oid);
  return db.meetings
    .filter((m) => m.orgId === oid)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(meetingDto);
});
on("post", `${P}/organizations/:id/meetings`, (body, me, oid) => {
  const org = orgOf(oid);
  if (!org.isActive) fail(409, "This organization is closed.");
  requireRole(oid, me, canMeet, "schedule meetings");
  const m = { id: id(), orgId: oid };
  applyMeeting(m, body);
  m.status = firstStep(oid);
  db.meetings.push(m);
  approval("MEETING", m.id, org, m.status, me);
  return meetingDto(m);
});
on("put", `${P}/organizations/:id/meetings/:mid`, (body, me, oid, mid) => {
  const m =
    db.meetings.find((x) => x.id === mid && x.orgId === oid) ||
    fail(404, `Meeting not found: ${mid}`);
  requireRole(oid, me, canMeet, "edit meetings");
  if (!m.status.startsWith("PENDING"))
    fail(409, "Only meetings still waiting for approval can be edited.");
  applyMeeting(m, body);
  if (m.status === "PENDING_ADMIN") {
    withdraw("MEETING", m.id);
    m.status = firstStep(oid);
    approval("MEETING", m.id, orgOf(oid), m.status, me);
  }
  return meetingDto(m);
});
on("delete", `${P}/organizations/:id/meetings/:mid`, (_, me, oid, mid) => {
  const i = db.meetings.findIndex((x) => x.id === mid && x.orgId === oid);
  if (i < 0) fail(404, `Meeting not found: ${mid}`);
  requireRole(oid, me, canMeet, "cancel meetings");
  withdraw("MEETING", mid);
  db.meetings.splice(i, 1);
});

on("get", `${P}/organizations/:id/finance/summary`, (_, me, oid) => {
  orgOf(oid);
  requireRole(oid, me, () => true, "see this organization's budget");
  return totals(oid);
});
on("get", `${P}/organizations/:id/finance/transactions`, (_, me, oid) => {
  orgOf(oid);
  requireRole(oid, me, (r) => isOfficer(r) || r === "ADVISOR", "see the transactions");
  return db.txs
    .filter((t) => t.orgId === oid)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
});
on("post", `${P}/organizations/:id/finance/transactions`, (body, me, oid) => {
  const org = orgOf(oid);
  if (!org.isActive) fail(409, "This organization is closed.");
  requireRole(
    oid,
    me,
    (r) => ["PRESIDENT", "VICE_PRESIDENT", "TREASURER"].includes(r),
    "record transactions"
  );
  const amount = Math.round(Number(body.amount) * 100) / 100;
  if (!(amount >= 0.01)) fail(400, "amount must be at least 0.01");
  if (!body.description?.trim()) fail(400, "description must not be blank");
  const date = body.date || isoDate(Date.now());
  if (date > isoDate(Date.now())) fail(400, "Transactions can't be dated in the future.");
  if (body.type === "EXPENSE" && totals(oid).balance < amount) {
    fail(409, `Not enough money: balance is ${totals(oid).balance.toFixed(2)} TRY.`);
  }
  const t = {
    id: id(),
    orgId: oid,
    type: body.type,
    amount,
    currency: "TRY",
    category: body.category || null,
    description: body.description.trim(),
    date,
    recordedBy: me,
    createdAt: Date.now(),
  };
  db.txs.push(t);
  return t;
});

on("get", `${P}/organizations/:id/bylaws`, (_, me, oid) => {
  orgOf(oid);
  requireRole(oid, me, () => true, "see the bylaws");
  const list = db.bylaws
    .filter((b) => b.orgId === oid)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  return list.length ? bylawsDto(list[0]) : null;
});
on("get", `${P}/organizations/:id/bylaws/history`, (_, me, oid) => {
  orgOf(oid);
  requireRole(oid, me, () => true, "see the bylaws");
  return db.bylaws
    .filter((b) => b.orgId === oid)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
    .map(bylawsDto);
});
on("post", `${P}/organizations/:id/bylaws`, (form, me, oid) => {
  const org = orgOf(oid);
  if (!org.isActive) fail(409, "This organization is closed.");
  requireRole(oid, me, (r) => r === "PRESIDENT" || r === "SECRETARY", "upload bylaws");
  const file = form?.get?.("file");
  if (!file || !file.size) fail(400, "The file is empty.");
  if (file.size > 5 * 1024 * 1024) fail(413, "File is too large.");
  const name = file.name.replace(/\\/g, "/").split("/").pop();
  const ext = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
  if (!["pdf", "docx", "odt"].includes(ext)) fail(400, "Bylaws must be a PDF, DOCX or ODT file.");
  const b = {
    id: id(),
    orgId: oid,
    fileName: name,
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
    status: firstStep(oid),
  };
  db.bylaws.push(b);
  approval("BYLAWS", b.id, org, b.status, me);
  return bylawsDto(b);
});

on("get", `${P}/approvals`, (_, me) => {
  const admin = isAdmin(me);
  const advised = new Set(
    db.members
      .filter(
        (m) =>
          m.role === "ADVISOR" &&
          m.status === "APPROVED" &&
          !m.leftAt &&
          person(m.personId).email === me
      )
      .map((m) => m.orgId)
  );
  const mine = db.approvals
    .filter(
      (a) =>
        (admin && a.status === "PENDING_ADMIN") ||
        (a.status === "PENDING_ADVISOR" && advised.has(a.orgId))
    )
    .sort((a, b) => a.requestedAt.localeCompare(b.requestedAt));
  const item = (a) => ({
    id: a.id,
    kind: a.kind,
    title: describe(a),
    organizationId: a.orgId,
    organizationName: orgOf(a.orgId).name,
    status: a.status,
    requestedBy: a.requestedBy,
    requestedAt: a.requestedAt,
  });
  const of = (k) => mine.filter((a) => a.kind === k).map(item);
  return {
    membershipRequests: of("MEMBERSHIP"),
    meetings: of("MEETING"),
    bylawsUploads: of("BYLAWS"),
  };
});
on("put", `${P}/approvals/:id`, (_, me, aid) => decide(aid, true, me));
on("delete", `${P}/approvals/:id`, (_, me, aid, query) =>
  decide(aid, false, me, new URLSearchParams(query || "").get("reason"))
);

on("get", `${P}/users`, (_, me) => {
  const allowed =
    isAdmin(me) ||
    db.members.some(
      (m) =>
        m.status === "APPROVED" &&
        !m.leftAt &&
        person(m.personId).email === me &&
        (isOfficer(m.role) || m.role === "ADVISOR")
    );
  if (!allowed) fail(403, "You can't browse the directory.");
  return [...db.people].sort(
    (a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
  );
});
on("get", `${P}/categories`, () => [...db.categories].sort((a, b) => a.name.localeCompare(b.name)));
on("post", `${P}/categories`, (body, me) => {
  requireAdmin(me, "change this list");
  if (!body?.name?.trim()) fail(400, "name must not be blank");
  if (db.categories.some((c) => c.name.toLowerCase() === body.name.trim().toLowerCase()))
    fail(400, "A category with that name already exists.");
  const c = { id: id(), name: body.name.trim() };
  db.categories.push(c);
  return c;
});
on("delete", `${P}/categories/:id`, (_, me, cid) => {
  requireAdmin(me, "change this list");
  if (db.orgs.some((o) => o.categoryId === cid))
    fail(409, "Category is still used by an organization.");
  db.categories = db.categories.filter((c) => c.id !== cid);
});
on("get", `${P}/locations`, () => [...db.locations].sort((a, b) => a.name.localeCompare(b.name)));
on("post", `${P}/locations`, (body, me) => {
  requireAdmin(me, "change this list");
  if (!body?.name?.trim()) fail(400, "name must not be blank");
  const l = {
    id: id(),
    name: body.name.trim(),
    capacity: body.capacity ? Number(body.capacity) : null,
  };
  db.locations.push(l);
  return l;
});
on("delete", `${P}/locations/:id`, (_, me, lid) => {
  requireAdmin(me, "change this list");
  if (db.orgs.some((o) => o.locationId === lid) || db.meetings.some((m) => m.locationId === lid)) {
    fail(409, "Location is still used by an organization or meeting.");
  }
  db.locations = db.locations.filter((l) => l.id !== lid);
});

export async function mockRequest(method, url, data, persona) {
  for (const r of routes) {
    if (r.method !== method) continue;
    const match = url.match(r.re);
    if (match) {
      const result = r.fn(data, persona, ...match.slice(1));
      return wait(result);
    }
  }
  fail(404, `No route for ${method.toUpperCase()} ${url}`);
}

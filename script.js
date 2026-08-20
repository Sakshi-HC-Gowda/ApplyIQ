(() => {
  "use strict";

  const CONFIG = {
    storageKey: "applyiq-state-v1",
    jobsApiUrl: "https://www.arbeitnow.com/api/job-board-api",
    dueSoonDays: 7,
    statuses: [
      "Wishlist",
      "Applied",
      "Online Assessment",
      "Interview",
      "Selected",
      "Rejected",
    ],
    priorities: ["High", "Medium", "Low"],
    jobTypes: ["Internship", "Full Time", "Part Time", "Contract"],
  };

  const now = new Date();
  const isoDate = (days) =>
    new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10);
  const sampleApplications = [
    {
      id: "sample-microsoft",
      company: "Microsoft",
      role: "Software Engineering Intern",
      location: "Redmond / Hybrid",
      jobType: "Internship",
      applicationDate: isoDate(-9),
      status: "Applied",
      priority: "High",
      deadline: isoDate(4),
      applicationUrl: "https://careers.microsoft.com",
      requiredSkills: ["JavaScript", "HTML", "CSS", "Git"],
      notes: "Focus on developer tools and inclusive product experiences.",
      createdAt: Date.now() - 777600000,
      updatedAt: Date.now() - 172800000,
    },
    {
      id: "sample-google",
      company: "Google",
      role: "Software Engineering Intern",
      location: "Bengaluru / Hybrid",
      jobType: "Internship",
      applicationDate: isoDate(-18),
      status: "Online Assessment",
      priority: "High",
      deadline: isoDate(2),
      applicationUrl: "https://careers.google.com",
      requiredSkills: ["Java", "Data Structures", "Algorithms", "SQL"],
      notes: "Prepare concise examples for collaboration and problem solving.",
      createdAt: Date.now() - 1555200000,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: "sample-razorpay",
      company: "Razorpay",
      role: "Frontend Developer Intern",
      location: "Bengaluru",
      jobType: "Internship",
      applicationDate: isoDate(-28),
      status: "Interview",
      priority: "Medium",
      deadline: isoDate(10),
      applicationUrl: "https://razorpay.com/jobs",
      requiredSkills: ["JavaScript", "HTML", "CSS", "React", "Git"],
      notes: "Ask about design systems and frontend performance.",
      createdAt: Date.now() - 2419200000,
      updatedAt: Date.now() - 259200000,
    },
  ];
  const defaultSkills = ["JavaScript", "HTML", "CSS", "SQL", "Git"];
  const profileRoles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Data Analyst",
    "Product Manager",
    "UI/UX Designer",
    "Other",
  ];
  const experienceLevels = [
    "Student / Fresher",
    "Intern",
    "0-2 years",
    "3-5 years",
    "5+ years",
  ];
  let state = {
    applications: [],
    personalSkills: defaultSkills,
    profile: null,
    theme: "light",
    samplesShown: false,
  };
  let currentView = "dashboard";
  let discoveredJobs = [];
  let jobsLoading = false;
  let jobsLoaded = false;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [
    ...root.querySelectorAll(selector),
  ];
  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  const normalizeSkill = (value) => normalize(value).replace(/[.#]/g, "");
  const uniqueSkills = (skills) => [
    ...new Map(
      skills
        .map((skill) => [normalizeSkill(skill), String(skill).trim()])
        .filter(([key, value]) => key && value),
    ).values(),
  ];
  const formatDate = (
    value,
    options = { month: "short", day: "numeric", year: "numeric" },
  ) => {
    if (!value) return "No deadline";
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime())
      ? "Invalid date"
      : date.toLocaleDateString("en-US", options);
  };
  const escapeHtml = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        })[char],
    );
  const slug = (value) => normalize(value).replace(/\s+/g, "-");
  const getState = () => state;
  const setState = (nextState) => {
    state = nextState;
    saveState();
    renderApp();
  };

  function validApplication(application) {
    return (
      application &&
      typeof application === "object" &&
      application.id &&
      application.company &&
      application.role &&
      application.location &&
      CONFIG.statuses.includes(application.status) &&
      CONFIG.priorities.includes(application.priority) &&
      CONFIG.jobTypes.includes(application.jobType) &&
      /^\d{4}-\d{2}-\d{2}$/.test(application.applicationDate) &&
      Array.isArray(application.requiredSkills)
    );
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(CONFIG.storageKey);
      if (!raw) {
        state = {
          ...state,
          applications: sampleApplications,
          profile: null,
          samplesShown: true,
        };
        saveState();
        return;
      }
      const stored = JSON.parse(raw);
      const applications = Array.isArray(stored.applications)
        ? stored.applications.filter(validApplication)
        : [];
      const profile =
        stored.profile && typeof stored.profile === "object"
          ? stored.profile
          : null;
      state = {
        applications,
        personalSkills: uniqueSkills(
          Array.isArray(stored.personalSkills)
            ? stored.personalSkills
            : profile?.skills || defaultSkills,
        ),
        profile,
        theme: stored.theme === "dark" ? "dark" : "light",
        samplesShown: Boolean(stored.samplesShown),
      };
    } catch (error) {
      state = {
        applications: [],
        personalSkills: defaultSkills,
        profile: null,
        theme: "light",
        samplesShown: false,
      };
      notify(
        "Saved data could not be read. A fresh workspace is ready.",
        "error",
      );
    }
  }
  function saveState() {
    try {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(state));
    } catch (error) {
      notify("Your browser could not save this change.", "error");
    }
  }
  function clearState() {
    try {
      localStorage.removeItem(CONFIG.storageKey);
    } catch (error) {
      /* Storage may be blocked; state still resets in memory. */
    }
    state = {
      applications: [],
      personalSkills: defaultSkills,
      profile: null,
      theme: "light",
      samplesShown: false,
    };
    renderApp();
  }
  function ensureProfileUi() {
    if (!$("#profile-settings-panel"))
      $("#view-settings .settings-grid").insertAdjacentHTML(
        "beforebegin",
        `<section class="panel settings-panel profile-settings" id="profile-settings-panel"><div class="panel-heading"><div><p class="eyebrow">Your profile</p><h2>Workspace profile</h2></div></div><form id="profile-form"><div class="profile-form-grid"><div class="field"><label for="profile-name">Name</label><input id="profile-name" maxlength="80" required><small class="field-error" data-profile-error="name"></small></div><div class="field"><label for="profile-role">Target role</label><select id="profile-role" required><option value="">Choose a target role</option>${profileRoles.map((role) => `<option>${role}</option>`).join("")}</select><small class="field-error" data-profile-error="targetRole"></small></div><div class="field"><label for="profile-experience">Experience level</label><select id="profile-experience" required><option value="">Choose experience level</option>${experienceLevels.map((level) => `<option>${level}</option>`).join("")}</select><small class="field-error" data-profile-error="experience"></small></div><div class="field"><label for="profile-locations">Preferred locations <span class="label-hint">comma separated</span></label><input id="profile-locations" placeholder="Bengaluru, Remote" required><small class="field-error" data-profile-error="locations"></small></div></div><label for="profile-skills">Personal skills <span class="label-hint">comma separated</span></label><textarea id="profile-skills" rows="3" placeholder="JavaScript, SQL, Git"></textarea><small class="field-error" data-profile-error="skills"></small><button class="button button-primary" type="submit">Save profile</button></form><div id="profile-readiness" class="profile-readiness"></div></section>`,
      );
    if (!$("#onboarding-backdrop"))
      document.body.insertAdjacentHTML(
        "beforeend",
        `<div class="modal-backdrop" id="onboarding-backdrop" hidden><section class="modal onboarding-modal" role="dialog" aria-modal="true" aria-labelledby="onboarding-title"><div class="modal-header"><div><p class="eyebrow">Create workspace</p><h2 id="onboarding-title">Welcome to ApplyIQ</h2><p class="panel-copy">Set up your workspace and make your job search more intentional.</p></div></div><form id="onboarding-form"><div class="form-grid"><div class="field"><label for="onboarding-name">Name</label><input id="onboarding-name" required maxlength="80" autocomplete="name"><small class="field-error" data-onboarding-error="name"></small></div><div class="field"><label for="onboarding-role">Target role</label><select id="onboarding-role" required><option value="">Choose a target role</option>${profileRoles.map((role) => `<option>${role}</option>`).join("")}</select><small class="field-error" data-onboarding-error="targetRole"></small></div><div class="field"><label for="onboarding-experience">Experience level</label><select id="onboarding-experience" required><option value="">Choose experience level</option>${experienceLevels.map((level) => `<option>${level}</option>`).join("")}</select><small class="field-error" data-onboarding-error="experience"></small></div><div class="field"><label for="onboarding-locations">Preferred locations</label><input id="onboarding-locations" placeholder="Bengaluru, Remote" required><small class="field-error" data-onboarding-error="locations"></small></div><div class="field field-wide"><label for="onboarding-skills">Personal skills</label><textarea id="onboarding-skills" rows="3" placeholder="JavaScript, SQL, Git"></textarea><small class="field-error" data-onboarding-error="skills"></small></div></div><div class="modal-footer"><button class="button button-primary" type="submit">Create my workspace</button></div></form></section></div>`,
      );
  }
  function profileFromFields(prefix) {
    return {
      name: $(`#${prefix}-name`).value.trim(),
      targetRole: $(`#${prefix}-role`).value,
      experience: $(`#${prefix}-experience`).value,
      locations: $(`#${prefix}-locations`)
        .value.split(",")
        .map((location) => location.trim())
        .filter(Boolean),
      skills: uniqueSkills($(`#${prefix}-skills`).value.split(",")),
    };
  }
  function validateProfile(profile) {
    const errors = {};
    if (!profile.name) errors.name = "Name is required.";
    if (!profileRoles.includes(profile.targetRole))
      errors.targetRole = "Choose a target role.";
    if (!experienceLevels.includes(profile.experience))
      errors.experience = "Choose an experience level.";
    if (!profile.locations.length)
      errors.locations = "Add at least one location.";
    if (!profile.skills.length)
      errors.skills = "Add at least one skill for matching.";
    return errors;
  }
  function calculateProfileReadiness(profile = state.profile) {
    if (!profile)
      return {
        score: 0,
        items: [
          ["Name added", false],
          ["Target role selected", false],
          ["Experience added", false],
          ["Preferred location added", false],
          ["Skills added", false],
        ],
      };
    const items = [
      ["Name added", Boolean(profile.name)],
      ["Target role selected", profileRoles.includes(profile.targetRole)],
      ["Experience added", experienceLevels.includes(profile.experience)],
      [
        "Preferred location added",
        Array.isArray(profile.locations) && profile.locations.length > 0,
      ],
      [
        "Skills added",
        Array.isArray(profile.skills) && profile.skills.length > 0,
      ],
    ];
    return {
      score: Math.round(
        (items.filter(([, complete]) => complete).length / items.length) * 100,
      ),
      items,
    };
  }
  function showProfileErrors(errors, prefix) {
    $$(`[data-${prefix}-error]`).forEach((element) => {
      element.textContent = errors[element.dataset[`${prefix}Error`]] || "";
    });
  }
  function saveProfile(profile, source = "profile") {
    const errors = validateProfile(profile);
    showProfileErrors(
      errors,
      source === "onboarding" ? "onboarding" : "profile",
    );
    if (Object.keys(errors).length) {
      notify("Please complete the required profile fields.", "error");
      return false;
    }
    state.profile = profile;
    state.personalSkills = profile.skills;
    saveState();
    renderApp();
    notify(source === "onboarding" ? "Workspace created." : "Profile saved.");
    return true;
  }
  function renderProfile() {
    ensureProfileUi();
    const profile = state.profile;
    ["profile", "onboarding"].forEach((prefix) => {
      const fields = [
        ["name", profile?.name || ""],
        ["role", profile?.targetRole || ""],
        ["experience", profile?.experience || ""],
        ["locations", profile?.locations?.join(", ") || ""],
        ["skills", profile?.skills?.join(", ") || ""],
      ];
      fields.forEach(([key, value]) => {
        const element = $(`#${prefix}-${key}`);
        if (element) element.value = value;
      });
    });
    const readiness = calculateProfileReadiness();
    $("#profile-readiness").innerHTML =
      `<strong>Profile readiness</strong><b>${readiness.score}%</b>${readiness.items.map(([label, complete]) => `<span class="readiness-item ${complete ? "complete" : "incomplete"}">${complete ? "✓" : "○"} ${label}</span>`).join("")}`;
    $("#onboarding-backdrop").hidden = Boolean(state.profile);
  }
  function updatePersonalizedDashboard() {
    $("#greeting-name").textContent = state.profile?.name
      ? `${state.profile.name}.`
      : "builder.";
    $("#dashboard-subheading").textContent = state.profile?.targetRole
      ? `Your next opportunity starts with a clear focus on ${state.profile.targetRole}.`
      : "A clear view of where your next opportunity stands.";
  }
  const getApplicationById = (id) =>
    state.applications.find((application) => application.id === id);
  const calculateSkillMatch = (
    requiredSkills = [],
    personalSkills = state.personalSkills,
  ) => {
    const required = uniqueSkills(requiredSkills);
    const owned = new Set(uniqueSkills(personalSkills).map(normalizeSkill));
    const matchedSkills = required.filter((skill) =>
      owned.has(normalizeSkill(skill)),
    );
    const missingSkills = required.filter(
      (skill) => !owned.has(normalizeSkill(skill)),
    );
    return {
      requiredSkills: required,
      matchedSkills,
      missingSkills,
      score: required.length
        ? Math.round((matchedSkills.length / required.length) * 100)
        : 0,
    };
  };
  const readiness = (score, missing) => {
    let label = "Prepare Before Applying";
    if (score >= 90) label = "Excellent Match";
    else if (score >= 75) label = "Good Match";
    else if (score >= 60) label = "Consider Applying";
    const recommendation = missing.length
      ? `Improve ${missing.slice(0, 2).join(" and ")} ${missing.length === 1 ? "fundamentals" : "before applying"}.`
      : "Your current skill profile covers this opportunity.";
    return { label, recommendation };
  };
  function deadlineInfo(deadline) {
    if (!deadline) return { label: "No deadline", className: "deadline-none" };
    const target = new Date(`${deadline}T23:59:59`);
    const diff = Math.ceil((target - new Date()) / 86400000);
    if (diff < 0) return { label: "Overdue", className: "deadline-overdue" };
    if (diff <= CONFIG.dueSoonDays)
      return { label: "Due soon", className: "deadline-due-soon" };
    return { label: "Upcoming", className: "deadline-upcoming" };
  }
  const scoreFor = (application) =>
    calculateSkillMatch(application.requiredSkills).score;
  function searchApplications(applications) {
    const query = normalize($("#search-input")?.value);
    if (!query) return applications;
    return applications.filter((application) =>
      [
        application.company,
        application.role,
        application.location,
        application.notes,
        ...application.requiredSkills,
      ].some((value) => normalize(value).includes(query)),
    );
  }
  function filterApplications(applications) {
    const filters = {
      status: normalize($("#status-filter")?.value),
      priority: normalize($("#priority-filter")?.value),
      jobType: normalize($("#type-filter")?.value),
      location: normalize($("#location-filter")?.value),
    };
    return applications.filter(
      (application) =>
        (!filters.status || normalize(application.status) === filters.status) &&
        (!filters.priority ||
          normalize(application.priority) === filters.priority) &&
        (!filters.jobType ||
          normalize(application.jobType) === filters.jobType) &&
        (!filters.location ||
          normalize(application.location) === filters.location),
    );
  }
  function sortApplications(applications) {
    const sort = $("#sort-select")?.value || "newest";
    return [...applications].sort((a, b) => {
      if (sort === "company-asc" || sort === "company-desc")
        return (
          a.company.localeCompare(b.company) * (sort === "company-asc" ? 1 : -1)
        );
      if (sort === "match-desc" || sort === "match-asc")
        return (scoreFor(b) - scoreFor(a)) * (sort === "match-desc" ? 1 : -1);
      if (sort === "deadline")
        return (a.deadline || "9999").localeCompare(b.deadline || "9999");
      return (
        (new Date(b.applicationDate) - new Date(a.applicationDate)) *
        (sort === "newest" ? 1 : -1)
      );
    });
  }
  const derivedApplications = () =>
    sortApplications(
      filterApplications(searchApplications(state.applications)),
    );
  const stripHtml = (value) =>
    new DOMParser()
      .parseFromString(String(value || ""), "text/html")
      .body.textContent.replace(/\s+/g, " ")
      .trim();
  const getPlainTextDescription = (value, maxLength = 320) => {
    const description = stripHtml(value);
    if (!description) return "No description available.";
    return description.length > maxLength
      ? `${description.slice(0, maxLength).trimEnd()}...`
      : description;
  };
  function safeExternalUrl(value) {
    try {
      const url = new URL(String(value || ""));
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (error) {
      return "";
    }
  }
  function jobTypeFor(jobTypes = []) {
    const typeText = normalize(jobTypes.join(" "));
    switch (true) {
      case typeText.includes("intern"):
      case typeText.includes("student"):
        return "Internship";
      case typeText.includes("part"):
        return "Part Time";
      case typeText.includes("freelance"):
      case typeText.includes("contract"):
        return "Contract";
      case typeText.includes("full"):
      case typeText.includes("permanent"):
        return "Full Time";
      default:
        return "Full Time";
    }
  }
  function normalizeJob(job) {
    if (!job || !job.slug || !job.title || !job.company_name) return null;
    const url = safeExternalUrl(job.url);
    if (!url) return null;
    return {
      id: String(job.slug),
      title: String(job.title).trim(),
      company: String(job.company_name).trim(),
      location:
        String(job.location || "Not specified").trim() || "Not specified",
      remote: Boolean(job.remote),
      description: stripHtml(job.description),
      url,
      tags: Array.isArray(job.tags) ? uniqueSkills(job.tags) : [],
      jobType: jobTypeFor(Array.isArray(job.job_types) ? job.job_types : []),
    };
  }
  function fallbackJobs() {
    return sampleApplications.map((application) => ({
      id: application.id,
      title: application.role,
      company: application.company,
      location: application.location,
      remote: application.location.toLowerCase().includes("remote"),
      description: application.notes,
      url: safeExternalUrl(application.applicationUrl),
      tags: application.requiredSkills,
      jobType: application.jobType,
    }));
  }
  function searchJobs(jobs) {
    const query = normalize($("#job-search-input")?.value);
    if (!query) return jobs;
    return jobs.filter((job) =>
      [job.title, job.company, job.location, job.description].some((value) =>
        normalize(value).includes(query),
      ),
    );
  }
  function showLoading() {
    $("#jobs-status").className = "jobs-status";
    $("#jobs-status").textContent = "Loading opportunities...";
    $("#jobs-list").replaceChildren();
    $("#jobs-count").textContent = "";
  }
  function showJobError(message) {
    const status = $("#jobs-status");
    status.className = "jobs-status error";
    status.replaceChildren();
    const messageNode = document.createElement("span");
    messageNode.textContent = message;
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "clear-filters";
    retry.dataset.action = "refresh-jobs";
    retry.textContent = "Retry";
    status.append(messageNode, document.createTextNode(" "), retry);
  }
  function renderJobs() {
    const jobs = searchJobs(discoveredJobs);
    $("#jobs-count").textContent = `${jobs.length} opportunities`;
    const list = $("#jobs-list");
    list.replaceChildren();
    if (!jobs.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "No matching opportunities.";
      list.append(empty);
      return;
    }
    jobs.forEach((job) => list.append(createJobCard(job)));
  }
  function createJobCard(job) {
    const card = document.createElement("article");
    card.className = "panel job-card";
    const heading = document.createElement("h3");
    heading.textContent = job.title;
    const company = document.createElement("p");
    company.textContent = `${job.company} · ${job.location}${job.remote ? " · Remote" : ""}`;
    card.append(heading, company);
    const description = document.createElement("p");
    description.className = "job-description";
    description.textContent = getPlainTextDescription(job.description);
    card.append(description);
    if (job.tags.length) {
      const tags = document.createElement("div");
      tags.className = "job-tags";
      job.tags.forEach((tag) => {
        const tagNode = document.createElement("span");
        tagNode.className = "job-tag";
        tagNode.textContent = tag;
        tags.append(tagNode);
      });
      card.append(tags);
    }
    const actions = document.createElement("div");
    actions.className = "job-actions";
    const view = document.createElement("a");
    view.className = "button button-secondary";
    view.href = job.url;
    view.target = "_blank";
    view.rel = "noopener noreferrer";
    view.textContent = "View Job";
    const save = document.createElement("button");
    save.type = "button";
    save.className = "button button-primary";
    save.dataset.action = "save-job";
    save.dataset.id = job.id;
    save.textContent = hasSavedJob(job) ? "Already saved" : "Save to ApplyIQ";
    save.disabled = hasSavedJob(job);
    actions.append(view, save);
    card.append(actions);
    return card;
  }
  async function loadJobs() {
    if (jobsLoading) return;
    jobsLoading = true;
    showLoading();
    try {
      const response = await fetch(CONFIG.jobsApiUrl);
      if (!response.ok) throw new Error(`Jobs API returned ${response.status}`);
      const payload = await response.json();
      if (!payload || !Array.isArray(payload.data))
        throw new Error("Jobs API returned an unexpected response");
      discoveredJobs = payload.data.map(normalizeJob).filter(Boolean);
      jobsLoaded = true;
      $("#jobs-status").className = "jobs-status";
      $("#jobs-status").textContent = "Live opportunities from Arbeitnow.";
      renderJobs();
    } catch (error) {
      console.error("ApplyIQ job discovery failed:", error);
      discoveredJobs = fallbackJobs();
      jobsLoaded = true;
      showJobError(
        "Live jobs are temporarily unavailable. Showing sample opportunities instead.",
      );
      renderJobs();
    } finally {
      jobsLoading = false;
    }
  }
  function hasSavedJob(job) {
    const jobUrl = normalize(job.url);
    return state.applications.some(
      (application) =>
        jobUrl && normalize(application.applicationUrl) === jobUrl,
    );
  }
  function saveJobToApplications(job) {
    if (hasSavedJob(job)) {
      notify("Already saved.");
      return;
    }
    createApplication(
      {
        company: job.company,
        role: job.title,
        location: job.location,
        jobType: job.jobType,
        applicationDate: new Date().toISOString().slice(0, 10),
        deadline: "",
        status: "Wishlist",
        priority: "Medium",
        applicationUrl: job.url,
        requiredSkills: job.tags,
        notes: job.description,
      },
      "Job saved to your ApplyIQ tracker.",
    );
    renderJobs();
  }
  function calculateStatistics(applications = state.applications) {
    const total = applications.length;
    const count = (status) =>
      applications.filter((application) => application.status === status)
        .length;
    const scored = applications.filter(
      (application) => application.requiredSkills.length,
    );
    const interviewCount = count("Interview") + count("Selected");
    return {
      total,
      applied: count("Applied"),
      assessments: count("Online Assessment"),
      interviews: count("Interview"),
      selected: count("Selected"),
      rejected: count("Rejected"),
      averageMatch: scored.length
        ? Math.round(
            scored.reduce(
              (sum, application) => sum + scoreFor(application),
              0,
            ) / scored.length,
          )
        : 0,
      interviewRate: total ? Math.round((interviewCount / total) * 100) : 0,
      selectionRate: total ? Math.round((count("Selected") / total) * 100) : 0,
    };
  }
  function validateApplication(data) {
    const errors = {};
    ["company", "role", "location"].forEach((key) => {
      if (!data[key]?.trim()) errors[key] = "This field is required.";
    });
    if (!CONFIG.jobTypes.includes(data.jobType))
      errors.jobType = "Choose a valid job type.";
    if (!CONFIG.statuses.includes(data.status))
      errors.status = "Choose a valid status.";
    if (!CONFIG.priorities.includes(data.priority))
      errors.priority = "Choose a valid priority.";
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(data.applicationDate) ||
      Number.isNaN(new Date(`${data.applicationDate}T00:00:00`).getTime())
    )
      errors.applicationDate = "Enter a valid application date.";
    if (
      data.deadline &&
      Number.isNaN(new Date(`${data.deadline}T00:00:00`).getTime())
    )
      errors.deadline = "Enter a valid deadline.";
    if (data.applicationUrl) {
      try {
        const url = new URL(data.applicationUrl);
        if (!["http:", "https:"].includes(url.protocol))
          errors.applicationUrl = "Use an http or https URL.";
      } catch (error) {
        errors.applicationUrl = "Enter a valid URL.";
      }
    }
    return errors;
  }
  function createApplication(
    data,
    message = "Application added to your pipeline.",
  ) {
    const timestamp = Date.now();
    state.applications.push({
      ...data,
      id: `app-${timestamp}`,
      requiredSkills: uniqueSkills(data.requiredSkills),
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    saveState();
    renderApp();
    notify(message);
  }
  function updateApplication(id, data) {
    const index = state.applications.findIndex(
      (application) => application.id === id,
    );
    if (index < 0) return;
    state.applications[index] = {
      ...state.applications[index],
      ...data,
      requiredSkills: uniqueSkills(data.requiredSkills),
      updatedAt: Date.now(),
    };
    saveState();
    renderApp();
    notify("Application updated.");
  }
  function deleteApplication(id) {
    state.applications = state.applications.filter(
      (application) => application.id !== id,
    );
    saveState();
    renderApp();
    notify("Application removed from your pipeline.");
  }
  function renderStats() {
    const stats = calculateStatistics();
    const items = [
      ["Total applications", stats.total, "Across your workspace", ""],
      ["Applied", stats.applied, "Actively in motion", ""],
      [
        "Interviews",
        stats.interviews,
        `${stats.interviewRate}% conversion`,
        "stat-accent",
      ],
      [
        "Selected",
        stats.selected,
        `${stats.selectionRate}% selection rate`,
        "stat-accent",
      ],
      ["Assessments", stats.assessments, "Next steps ahead", ""],
      ["Rejected", stats.rejected, "Learn and iterate", ""],
      [
        "Average match",
        `${stats.averageMatch}%`,
        "Across skilled roles",
        "stat-accent",
      ],
      [
        "Open focus",
        state.applications.filter((a) =>
          ["Wishlist", "Applied", "Online Assessment", "Interview"].includes(
            a.status,
          ),
        ).length,
        "Not yet closed",
        "",
      ],
    ];
    $("#stats-grid").innerHTML = items
      .map(
        ([label, value, detail, accent]) =>
          `<article class="stat-card"><span class="stat-label">${label}</span><div class="stat-value ${accent}">${value}</div><span class="stat-detail">${detail}</span></article>`,
      )
      .join("");
  }
  function applicationRow(application) {
    const deadline = deadlineInfo(application.deadline);
    return `<div class="application-row"><span class="company-icon">${escapeHtml(application.company.charAt(0).toUpperCase())}</span><div class="app-main"><strong>${escapeHtml(application.company)}</strong><small>${escapeHtml(application.role)} · ${escapeHtml(application.location)}</small></div><div class="app-side"><span class="status-badge status-${slug(application.status)}">${escapeHtml(application.status)}</span><small class="${deadline.className}">${deadline.label}</small></div></div>`;
  }
  function renderDashboard() {
    const recent = [...state.applications]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 4);
    $("#dashboard-applications").innerHTML = recent.length
      ? recent.map(applicationRow).join("")
      : emptyState(
          "No applications yet.",
          "Add your first opportunity to start seeing momentum.",
          "open-add",
        );
    const top = state.applications.length
      ? state.applications.reduce(
          (best, application) =>
            scoreFor(application) > scoreFor(best) ? application : best,
          state.applications[0],
        )
      : null;
    const match = top
      ? calculateSkillMatch(top.requiredSkills)
      : { score: 0, missingSkills: [] };
    const info = readiness(match.score, match.missingSkills);
    $("#focus-content").innerHTML = top
      ? `<div class="focus-score"><div class="score-ring" style="--score:${match.score * 3.6}deg"><strong>${match.score}%</strong></div><p><b>${info.label}</b>${escapeHtml(top.company)} needs your attention.</p></div><div class="focus-list"><p><strong>Next useful step</strong></p><p>${escapeHtml(info.recommendation)}</p>${match.missingSkills
          .slice(0, 3)
          .map(
            (skill) => `<span class="mini-skill">${escapeHtml(skill)}</span>`,
          )
          .join("")}</div>`
      : `<div class="focus-score"><div class="score-ring" style="--score:0deg"><strong>--</strong></div><p><b>Build your profile</b>Add an application to unlock skill intelligence.</p></div>`;
  }
  function emptyState(title, message, action) {
    return `<div class="empty-state"><div class="brand-mark" style="margin:auto">A</div><h3>${title}</h3><p>${message}</p>${action ? `<button class="button button-primary" type="button" data-action="${action}">Add application</button>` : ""}</div>`;
  }
  function renderApplications() {
    const applications = derivedApplications();
    $("#results-count").textContent =
      `${applications.length} of ${state.applications.length} opportunities`;
    $("#applications-list").innerHTML = applications.length
      ? applications.map(applicationCard).join("")
      : emptyState(
          state.applications.length
            ? "No matching applications."
            : "No applications yet.",
          state.applications.length
            ? "Try adjusting your search or filters."
            : "Add an opportunity and make your next move visible.",
          state.applications.length ? "" : "open-add",
        );
  }
  function applicationCard(application) {
    const match = calculateSkillMatch(application.requiredSkills);
    const info = readiness(match.score, match.missingSkills);
    const deadline = deadlineInfo(application.deadline);
    return `<article class="panel application-card"><div class="card-top"><div class="card-company"><span class="company-icon">${escapeHtml(application.company.charAt(0).toUpperCase())}</span><div><h3>${escapeHtml(application.company)}</h3><p>${escapeHtml(application.role)}</p></div></div><span class="card-score">${match.score}%</span></div><div class="card-meta"><span class="status-badge status-${slug(application.status)}">${escapeHtml(application.status)}</span><span class="priority-badge priority-${slug(application.priority)}">${escapeHtml(application.priority)} priority</span><span class="deadline-label ${deadline.className}">${deadline.label}${application.deadline ? ` · ${formatDate(application.deadline, { month: "short", day: "numeric" })}` : ""}</span></div><div class="match-line"><strong>${escapeHtml(info.label)}</strong> · ${match.matchedSkills.length}/${match.requiredSkills.length || 0} required skills matched</div><div class="card-footer"><span class="card-date">${escapeHtml(application.location)} · ${formatDate(application.applicationDate, { month: "short", day: "numeric" })}</span><div class="card-actions"><button class="small-button" type="button" data-action="edit" data-id="${application.id}">Edit</button><button class="small-button delete" type="button" data-action="delete" data-id="${application.id}">Delete</button></div></div></article>`;
  }
  function renderAnalytics() {
    const stats = calculateStatistics();
    const chart = CONFIG.statuses
      .map((status) => {
        const value = state.applications.filter(
          (a) => a.status === status,
        ).length;
        const width = stats.total ? (value / stats.total) * 100 : 0;
        return `<div class="bar-row"><span class="bar-label">${status}</span><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div><span class="bar-number">${value}</span></div>`;
      })
      .join("");
    $("#status-chart").innerHTML = stats.total
      ? chart
      : emptyState(
          "No pipeline data.",
          "Your status breakdown will appear here.",
          "open-add",
        );
    const missing = {};
    state.applications.forEach((application) =>
      calculateSkillMatch(application.requiredSkills).missingSkills.forEach(
        (skill) => {
          const key = normalizeSkill(skill);
          missing[key] = missing[key]
            ? { label: missing[key].label, count: missing[key].count + 1 }
            : { label: skill, count: 1 };
        },
      ),
    );
    const gaps = Object.values(missing)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    $("#missing-skills").innerHTML = gaps.length
      ? gaps
          .map(
            (gap) =>
              `<div class="missing-item"><span>${escapeHtml(gap.label)}</span><b>${gap.count} ${gap.count === 1 ? "role" : "roles"}</b></div>`,
          )
          .join("")
      : emptyState(
          "No missing skills found.",
          "Add required skills to your applications for useful gap signals.",
          "open-add",
        );
    $("#insight-grid").innerHTML =
      `<div class="insight"><strong>${stats.averageMatch}%</strong><span>Average skill match</span></div><div class="insight"><strong>${stats.interviewRate}%</strong><span>Interview rate</span></div><div class="insight"><strong>${stats.selectionRate}%</strong><span>Selection rate</span></div>`;
  }
  function renderSettings() {
    $("#skills-input").value = state.personalSkills.join(", ");
    $("#personal-skills").innerHTML = state.personalSkills.length
      ? state.personalSkills
          .map(
            (skill) => `<span class="skill-pill">${escapeHtml(skill)}</span>`,
          )
          .join("")
      : `<span class="label-hint">No skills added yet.</span>`;
    $("#storage-status").textContent =
      `${state.applications.length} saved record${state.applications.length === 1 ? "" : "s"}`;
  }
  function populateOptions() {
    const options = (values) =>
      values
        .map(
          (value) =>
            `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`,
        )
        .join("");
    $("#status").innerHTML = options(CONFIG.statuses);
    $("#priority").innerHTML = options(CONFIG.priorities);
    $("#jobType").innerHTML = options(CONFIG.jobTypes);
    $("#status-filter").insertAdjacentHTML(
      "beforeend",
      options(CONFIG.statuses),
    );
    $("#priority-filter").insertAdjacentHTML(
      "beforeend",
      options(CONFIG.priorities),
    );
    $("#type-filter").insertAdjacentHTML("beforeend", options(CONFIG.jobTypes));
  }
  function renderLocationFilter() {
    const select = $("#location-filter");
    const selected = select.value;
    const locations = [
      ...new Set(
        state.applications
          .map((application) => application.location)
          .filter(Boolean),
      ),
    ].sort((a, b) => a.localeCompare(b));
    select.innerHTML = `<option value="">All locations</option>${locations.map((location) => `<option value="${escapeHtml(location)}">${escapeHtml(location)}</option>`).join("")}`;
    if (locations.includes(selected)) select.value = selected;
  }
  function renderApp() {
    document.documentElement.dataset.theme = state.theme;
    $("#theme-icon").textContent = state.theme === "dark" ? "Light" : "Dark";
    $("#today-label").textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    renderLocationFilter();
    renderStats();
    renderDashboard();
    updatePersonalizedDashboard();
    renderApplications();
    renderJobs();
    renderAnalytics();
    renderSettings();
    renderProfile();
  }
  function showView(view) {
    currentView = view;
    $$("[data-view-panel]").forEach((panel) =>
      panel.classList.toggle("is-visible", panel.dataset.viewPanel === view),
    );
    $$(".nav-link").forEach((link) =>
      link.classList.toggle("is-active", link.dataset.view === view),
    );
    $("#page-label").textContent =
      view === "discover"
        ? "Discover Jobs"
        : view[0].toUpperCase() + view.slice(1);
    $("#sidebar").classList.remove("is-open");
    window.location.hash = view;
    if (view === "discover" && !jobsLoaded && !jobsLoading) loadJobs();
  }
  function notify(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type === "error" ? "error" : ""}`;
    toast.textContent = message;
    $("#toast-region").append(toast);
    setTimeout(() => toast.remove(), 3400);
  }
  function openModal(application) {
    const form = $("#application-form");
    form.reset();
    $$(".field-error").forEach((error) => (error.textContent = ""));
    $("#application-id").value = application?.id || "";
    $("#modal-title").textContent = application
      ? "Edit application"
      : "Add application";
    $("#applicationDate").value =
      application?.applicationDate || new Date().toISOString().slice(0, 10);
    if (application)
      [
        "company",
        "role",
        "location",
        "jobType",
        "deadline",
        "status",
        "priority",
        "applicationUrl",
        "notes",
      ].forEach((key) => {
        $("#" + key).value = application[key] || "";
      });
    $("#requiredSkills").value = application?.requiredSkills.join(", ") || "";
    $("#modal-backdrop").hidden = false;
    $("#company").focus();
  }
  function closeModal() {
    $("#modal-backdrop").hidden = true;
  }
  function handleApplicationSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    data.requiredSkills = uniqueSkills(data.requiredSkills.split(","));
    const errors = validateApplication(data);
    $$(".field-error").forEach((element) => (element.textContent = ""));
    Object.entries(errors).forEach(([key, message]) => {
      const error = $(`[data-error-for="${key}"]`);
      if (error) error.textContent = message;
    });
    if (Object.keys(errors).length) {
      notify("Please review the highlighted fields.", "error");
      return;
    }
    const id = data.id || $("#application-id").value;
    delete data.id;
    id ? updateApplication(id, data) : createApplication(data);
    closeModal();
  }
  function exportCsv() {
    if (!state.applications.length) {
      notify("Add an application before exporting.", "error");
      return;
    }
    const headers = [
      "Company",
      "Role",
      "Location",
      "Status",
      "Priority",
      "Job Type",
      "Application Date",
      "Deadline",
      "Match Score",
    ];
    const rows = state.applications.map((application) => [
      application.company,
      application.role,
      application.location,
      application.status,
      application.priority,
      application.jobType,
      application.applicationDate,
      application.deadline || "",
      `${scoreFor(application)}%`,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applyiq-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify("CSV export downloaded.");
  }
  function handleAction(event) {
    const actionTarget = event.target.closest("[data-action]");
    const viewTarget = event.target.closest("[data-view]");
    if (viewTarget) {
      event.preventDefault();
      showView(viewTarget.dataset.view);
      return;
    }
    if (!actionTarget) return;
    const { action, id } = actionTarget.dataset;
    if (action === "open-add") openModal();
    if (action === "close-modal") closeModal();
    if (action === "toggle-theme") {
      state.theme = state.theme === "dark" ? "light" : "dark";
      saveState();
      renderApp();
    }
    if (action === "toggle-menu") $("#sidebar").classList.toggle("is-open");
    if (action === "edit") openModal(getApplicationById(id));
    if (
      action === "delete" &&
      getApplicationById(id) &&
      window.confirm("Delete this application? This cannot be undone.")
    )
      deleteApplication(id);
    if (action === "export-csv") exportCsv();
    if (action === "refresh-jobs") loadJobs();
    if (action === "save-job") {
      const job = discoveredJobs.find((item) => item.id === id);
      if (job) saveJobToApplications(job);
    }
    if (action === "clear-filters") {
      [
        "search-input",
        "status-filter",
        "priority-filter",
        "type-filter",
        "location-filter",
      ].forEach((key) => {
        $("#" + key).value = "";
      });
      renderApplications();
    }
    if (action === "clear-samples") {
      const sampleIds = new Set(
        sampleApplications.map((application) => application.id),
      );
      const before = state.applications.length;
      state.applications = state.applications.filter(
        (application) => !sampleIds.has(application.id),
      );
      saveState();
      renderApp();
      notify(
        before === state.applications.length
          ? "No sample applications were found."
          : "Sample applications removed.",
      );
    }
    if (
      action === "reset-data" &&
      window.confirm("Reset all applications and settings?")
    ) {
      clearState();
      notify("Workspace reset.");
    }
  }
  ensureProfileUi();
  $("#application-form").addEventListener("submit", handleApplicationSubmit);
  $("#skills-form").addEventListener("submit", (event) => {
    event.preventDefault();
    state.personalSkills = uniqueSkills($("#skills-input").value.split(","));
    if (state.profile) state.profile.skills = state.personalSkills;
    saveState();
    renderApp();
    notify("Personal skills saved.");
  });
  $("#profile-form").addEventListener("submit", (event) => {
    event.preventDefault();
    saveProfile(profileFromFields("profile"));
  });
  $("#onboarding-form").addEventListener("submit", (event) => {
    event.preventDefault();
    saveProfile(profileFromFields("onboarding"), "onboarding");
  });
  document.addEventListener("click", handleAction);
  $("#search-input").addEventListener("input", renderApplications);
  $("#job-search-input").addEventListener("input", renderJobs);
  [
    "status-filter",
    "priority-filter",
    "type-filter",
    "location-filter",
    "sort-select",
  ].forEach((id) => $("#" + id).addEventListener("change", renderApplications));
  $("#modal-backdrop").addEventListener("click", (event) => {
    if (event.target.id === "modal-backdrop") closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
  const validViews = [
    "dashboard",
    "applications",
    "discover",
    "analytics",
    "settings",
  ];
  window.addEventListener("hashchange", () => {
    const view = window.location.hash.slice(1);
    if (validViews.includes(view) && view !== currentView) showView(view);
  });
  populateOptions();
  loadState();
  renderApp();
  const initialView = window.location.hash.slice(1);
  if (validViews.includes(initialView)) showView(initialView);
})();

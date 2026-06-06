import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
  "https://johavlaywmsjelumhirv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaGF2bGF5d21zamVsdW1oaXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODMwNDQsImV4cCI6MjA5Mzc1OTA0NH0.rEtIZ-Pzk0paEb2wom6wG1jJ6Dej_u5FO_TIoNRygEg"
);

document.addEventListener("DOMContentLoaded", () => {
  const widget = document.getElementById("checkinWidget");
  const previewWidget = document.getElementById("previewWidget");

  const textarea = document.getElementById("checkinText");
  const saveBtn = document.getElementById("saveCheckinBtn");
  const saveMessage = document.getElementById("saveMessage");
  const checkinPrompt = document.getElementById("checkinPrompt");

  const themeToggle = document.getElementById("themeToggle");
  const themeOptions = document.getElementById("themeOptions");
  const themeCircles = document.querySelectorAll(".theme-circle");

  const appearanceToggle = document.getElementById("appearanceToggle");
  const appearanceOptions = document.getElementById("appearanceOptions");
  const appearanceChoices = document.querySelectorAll(".appearance-option");

  const fontToggle = document.getElementById("fontToggle");
  const fontOptions = document.getElementById("fontOptions");
  const fontChoices = document.querySelectorAll(".font-option");

  const viewEntriesBtn = document.getElementById("viewEntriesBtn");
  const entriesPopup = document.getElementById("entriesPopup");
  const entriesContainer = document.getElementById("entriesContainer");
  const closeEntriesBtn = document.getElementById("closeEntriesBtn");
  const journalDate = document.getElementById("journalDate");
const privacyToggle = document.getElementById("privacyToggle");
const pageNumber = document.getElementById("pageNumber");
  const copyBtn = document.getElementById("copyLinkBtn");
  const copyMsg = document.getElementById("copyMessage");

  const params = new URLSearchParams(window.location.search);
  const isEmbed = params.get("embed") === "true";

  if (isEmbed) {
    document.documentElement.classList.add("embed-mode");
  }

  const prompts = [
    "what’s on your mind?",
    "what does your dream life look like?",
    "what is your ideal day this week?",
    "what are 3 things you're grateful for?",
    "what energy are you bringing into today?",
    "how have you changed in the last 5 years?",
    "what are you avoiding lately?",
    "what are you grateful for today?",
    "what’s been on repeat in your head?",
    "describe today in one sentence...",
    "if failing wasn't possible, what would you do?",
    "if someone else described you what would they say?",
    "write a letter to your future self...",
    "what is your biggest fear?",
    "what is going well in your life and why?",
    "what are 5 things that make you happy?",
    "my favorite memory is...",
    "discussing my opinion on social media...",
    "when is the last time you cried? why?",
    "describe your childhood and how it shaped you :)",
    "what is one thing you wish you could tell yourself 5 years ago?",
    "my love language and why...",
    "how did you sleep?",
    "something i am proud of myself for...",
    "how do i want to feel at the end of the day today?",
    "last night i dreamt about...",
    "what would make today great?",
    "one thing i learned yesterday...",
    "one positive thing to focus on today:"
  ];

  const todaysPrompt = prompts[new Date().getDate() % prompts.length];

  if (checkinPrompt) {
    checkinPrompt.textContent = todaysPrompt;
  }

  const state = {
    theme: params.get("theme") || localStorage.getItem("journalTheme") || "pink",
    font: params.get("font") || localStorage.getItem("journalFont") || "default",
    appearance:
      params.get("appearance") ||
      localStorage.getItem("journalAppearance") ||
      "system"
  };

  const today = new Date();

if (journalDate) {
  journalDate.textContent = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).toLowerCase();
}

if (pageNumber) {
  pageNumber.textContent = `page ${today.getFullYear().toString().slice(-2)}${today.getMonth() + 1}${today.getDate()}`;
}
  
  const widgetId =
    params.get("id") ||
    (crypto.randomUUID ? crypto.randomUUID() : `checkin-${Date.now()}`);

  const themeColors = {
    pink: "#f4dfeb",
    beige: "#faebdd",
    blue: "#ddebf1",
    green: "#ddedea",
    black: "#17171a",
    white: "#f8f6f3"
  };

  function saveState() {
    localStorage.setItem("journalTheme", state.theme);
    localStorage.setItem("journalFont", state.font);
    localStorage.setItem("journalAppearance", state.appearance);
  }

  function updateBothWidgets(callback) {
    [widget, previewWidget].forEach((item) => {
      if (item) callback(item);
    });
  }

  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }

  function applyTheme(theme) {
    state.theme = theme || "pink";

    updateBothWidgets((item) => {
      item.classList.remove("pink", "green", "beige", "blue", "black", "white");
      item.classList.add(state.theme);
    });

    if (themeToggle) {
      themeToggle.style.setProperty(
        "--theme-color",
        themeColors[state.theme] || themeColors.pink
      );

      themeToggle.style.backgroundColor =
        themeColors[state.theme] || themeColors.pink;
    }

    saveState();
  }

  function applyFont(font) {
    state.font = font || "default";

    const fontFamily =
      state.font === "serif"
        ? "Georgia, serif"
        : state.font === "mono"
        ? "ui-monospace, SFMono-Regular, Menlo, monospace"
        : "'Satoshi', ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

    updateBothWidgets((item) => {
      item.classList.remove("font-default", "font-serif", "font-mono");
      item.classList.add(`font-${state.font}`);
      item.style.fontFamily = fontFamily;
    });

    saveState();
  }

  function applyAppearance(appearance) {
    state.appearance = appearance || "system";

    document.body.classList.remove(
      "appearance-light",
      "appearance-dark",
      "appearance-system"
    );

    document.body.classList.add(`appearance-${state.appearance}`);

    saveState();
  }

  async function loadCheckin() {
    const { data, error } = await supabase
      .from("mood_logs")
      .select("data")
      .eq("id", widgetId)
      .maybeSingle();

    if (error) {
      console.error("Supabase load error:", error);
      return;
    }

    const saved = data?.data?.[todayKey()]?.text || "";

    if (textarea) {
      textarea.value = saved;
    }
  }

  async function saveCheckin() {
    if (!textarea) return;

    const text = textarea.value.trim();

    const { data } = await supabase
      .from("mood_logs")
      .select("data")
      .eq("id", widgetId)
      .maybeSingle();

    const currentData = data?.data || {};

    currentData[todayKey()] = {
      prompt: todaysPrompt,
      text
    };

    const { error } = await supabase.from("mood_logs").upsert({
      id: widgetId,
      data: currentData,
      updated_at: new Date().toISOString()
    });

    if (error) {
      console.error("Supabase save error:", error);
      return;
    }

    saveMessage?.classList.remove("hidden");
    saveMessage?.classList.add("show");

    clearTimeout(window.__saveTimer);
    window.__saveTimer = setTimeout(() => {
      saveMessage?.classList.add("hidden");
      saveMessage?.classList.remove("show");
    }, 1400);
  }

  themeToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    themeOptions?.classList.toggle("hidden");
    fontOptions?.classList.add("hidden");
    appearanceOptions?.classList.add("hidden");
  });

  themeCircles.forEach((circle) => {
    circle.addEventListener("click", (e) => {
      e.stopPropagation();
      applyTheme(circle.dataset.theme);
      themeOptions?.classList.add("hidden");
    });
  });

  appearanceToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    appearanceOptions?.classList.toggle("hidden");
    themeOptions?.classList.add("hidden");
    fontOptions?.classList.add("hidden");
  });

  appearanceChoices.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      applyAppearance(option.dataset.appearance);
      appearanceOptions?.classList.add("hidden");
    });
  });

  fontToggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    fontOptions?.classList.toggle("hidden");
    themeOptions?.classList.add("hidden");
    appearanceOptions?.classList.add("hidden");
  });

  fontChoices.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      applyFont(option.dataset.font);
      fontOptions?.classList.add("hidden");
    });
  });

  viewEntriesBtn?.addEventListener("click", async (e) => {
    e.stopPropagation();

    const { data } = await supabase
      .from("mood_logs")
      .select("data")
      .eq("id", widgetId)
      .maybeSingle();

    const entries = data?.data || {};

    if (!entriesContainer || !entriesPopup) return;

    entriesContainer.innerHTML = "";

    Object.entries(entries)
      .reverse()
      .forEach(([date, entry]) => {
        if (!entry?.text) return;

        const card = document.createElement("div");
        card.className = "entry-card";

        card.innerHTML = "";

        const dateEl = document.createElement("div");
        dateEl.className = "entry-date";
        dateEl.textContent = date;

        const promptEl = document.createElement("div");
        promptEl.className = "entry-prompt";
        promptEl.textContent = entry.prompt || "";

        const textEl = document.createElement("div");
        textEl.className = "entry-text";
        textEl.textContent = entry.text;

        card.appendChild(dateEl);
        card.appendChild(promptEl);
        card.appendChild(textEl);

        entriesContainer.appendChild(card);
      });

    entriesPopup.classList.remove("hidden");
  });

  entriesPopup?.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  closeEntriesBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    entriesPopup?.classList.add("hidden");
  });

  saveBtn?.addEventListener("click", saveCheckin);

  copyBtn?.addEventListener("click", async (e) => {
    e.stopPropagation();

    const url =
      `${location.origin}${location.pathname}` +
      `?id=${encodeURIComponent(widgetId)}` +
      `&theme=${encodeURIComponent(state.theme)}` +
      `&font=${encodeURIComponent(state.font)}` +
      `&appearance=${encodeURIComponent(state.appearance)}` +
      `&embed=true`;

    await navigator.clipboard.writeText(url);

    copyMsg?.classList.remove("hidden");
    copyMsg?.classList.add("show");

    clearTimeout(window.__copyTimer);
    window.__copyTimer = setTimeout(() => {
      copyMsg?.classList.add("hidden");
      copyMsg?.classList.remove("show");
    }, 1500);
  });

  privacyToggle?.addEventListener("click", (e) => {
  e.stopPropagation();

  textarea.classList.toggle("is-private");

  privacyToggle.textContent = textarea.classList.contains("is-private")
    ? "✦"
    : "👁";
});

  document.addEventListener("click", () => {
    themeOptions?.classList.add("hidden");
    fontOptions?.classList.add("hidden");
    appearanceOptions?.classList.add("hidden");
  });

  applyTheme(state.theme);
  applyFont(state.font);
  applyAppearance(state.appearance);
  loadCheckin();
});

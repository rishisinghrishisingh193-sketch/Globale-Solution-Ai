const form = document.getElementById("chatForm");
const promptBox = document.getElementById("prompt");
const messagesEl = document.getElementById("messages");
const welcome = document.getElementById("welcome");
const sendBtn = document.getElementById("sendBtn");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
let history = [];
let busy = false;

function addMessage(role, text) {
  welcome.style.display = "none";
  const row = document.createElement("div");
  row.className = `message ${role}`;
  if (role === "assistant") {
    const icon = document.createElement("div");
    icon.className = "message-icon";
    icon.textContent = "G";
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    row.append(icon, bubble);
  } else {
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    row.append(bubble);
  }
  messagesEl.appendChild(row);
  row.scrollIntoView({ behavior: "smooth", block: "nearest" });
  return row;
}
function setBusy(value) {
  busy = value;
  sendBtn.disabled = value;
  sendBtn.textContent = value ? "…" : "↑";
}
async function sendMessage(text) {
  text = String(text || "").trim();
  if (!text || busy) return;
  promptBox.value = "";
  promptBox.style.height = "auto";
  addMessage("user", text);
  history.push({ role: "user", content: text });
  const typing = addMessage("assistant", "Thinking…");
  typing.querySelector(".bubble").classList.add("typing");
  setBusy(true);
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-20) })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Something went wrong.");
    typing.querySelector(".bubble").textContent = data.reply;
    typing.querySelector(".bubble").classList.remove("typing");
    history.push({ role: "assistant", content: data.reply });
  } catch (error) {
    typing.querySelector(".bubble").textContent = error.message || "Could not connect to the AI. Please try again.";
    typing.querySelector(".bubble").classList.remove("typing");
    // Do not preserve failed turns in conversation history.
    history.pop();
  } finally {
    setBusy(false);
    promptBox.focus();
  }
}
form.addEventListener("submit", e => { e.preventDefault(); sendMessage(promptBox.value); });
promptBox.addEventListener("input", () => {
  promptBox.style.height = "auto";
  promptBox.style.height = Math.min(promptBox.scrollHeight, 170) + "px";
});
document.querySelectorAll("[data-prompt]").forEach(btn => btn.addEventListener("click", () => {
  const prompt = btn.getAttribute("data-prompt");
  if (prompt) sendMessage(prompt);
  sidebar.classList.remove("open"); overlay.classList.remove("show");
}));
document.getElementById("newChat").addEventListener("click", () => {
  history = []; messagesEl.innerHTML = ""; welcome.style.display = "";
  sidebar.classList.remove("open"); overlay.classList.remove("show"); promptBox.focus();
});
document.getElementById("menuBtn").addEventListener("click", () => {
  sidebar.classList.toggle("open"); overlay.classList.toggle("show");
});
overlay.addEventListener("click", () => {
  sidebar.classList.remove("open"); overlay.classList.remove("show");
});

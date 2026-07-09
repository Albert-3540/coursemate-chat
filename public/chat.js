const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const onlineUsersList = document.getElementById("onlineUsersList");
const profileName = document.getElementById("profileName");
const profileUsername = document.getElementById("profileUsername");
const logoutBtn = document.getElementById("logoutBtn");

const currentUser = JSON.parse(localStorage.getItem("courseMateUser"));

if (!currentUser) {
  window.location.href = "login.html";
}

if (profileName) profileName.textContent = currentUser.fullName;
if (profileUsername) profileUsername.textContent = `@${currentUser.username}`;

async function loadUsers() {
  try {
    const res = await fetch("/api/users");
    const users = await res.json();

    onlineUsersList.innerHTML = "";
    users.forEach((user) => {
      const li = document.createElement("li");
      li.textContent = `${user.fullName} (@${user.username})`;
      onlineUsersList.appendChild(li);
    });
  } catch (error) {
    console.error("LOAD USERS ERROR:", error);
  }
}

function createMessageElement(message) {
  const isSelf = message.username === currentUser.username;

  const wrapper = document.createElement("div");
  wrapper.className = `message ${isSelf ? "self" : ""}`;

  const content = document.createElement("div");
  content.className = "message-content";

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = `${message.fullName} (@${message.username})`;

  const text = document.createElement("div");
  text.textContent = message.text;

  content.appendChild(meta);
  content.appendChild(text);
  wrapper.appendChild(content);

  return wrapper;
}

async function loadMessages() {
  try {
    const res = await fetch("/api/messages");
    const messages = await res.json();

    chatMessages.innerHTML = "";

    messages.forEach((message) => {
      chatMessages.appendChild(createMessageElement(message));
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (error) {
    console.error("LOAD MESSAGES ERROR:", error);
  }
}

if (chatForm) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = messageInput.value.trim();
    if (!text) return;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: currentUser.fullName,
          username: currentUser.username,
          text
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Could not send message.");
        return;
      }

      messageInput.value = "";
      loadMessages();
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("courseMateUser");
    window.location.href = "login.html";
  });
}

loadUsers();
loadMessages();
setInterval(loadMessages, 3000);
setInterval(loadUsers, 5000);
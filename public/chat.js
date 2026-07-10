const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const imageInput = document.getElementById("imageInput");
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

  content.appendChild(meta);

  if (message.text) {
    const text = document.createElement("div");
    text.className = "message-text";
    text.textContent = message.text;
    content.appendChild(text);
  }

  if (message.image) {
    const img = document.createElement("img");
    img.src = message.image;
    img.alt = "Chat image";
    img.className = "chat-image";
    content.appendChild(img);
  }

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
    const imageFile = imageInput.files[0];

    if (!text && !imageFile) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fullName", currentUser.fullName);
      formData.append("username", currentUser.username);
      formData.append("text", text);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/messages", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Could not send message.");
        return;
      }

      messageInput.value = "";
      imageInput.value = "";
      loadMessages();
    } catch (error) {
      console.error("SEND MESSAGE ERROR:", error);
      alert("Could not send message.");
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
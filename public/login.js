const loginForm = document.getElementById("loginForm");
const emailOrUsername = document.getElementById("emailOrUsername");
const password = document.getElementById("password");
const messageBox = document.getElementById("messageBox");
const toggleLoginPassword = document.getElementById("toggleLoginPassword");

if (toggleLoginPassword && password) {
  toggleLoginPassword.addEventListener("click", () => {
    if (password.type === "password") {
      password.type = "text";
      toggleLoginPassword.textContent = "🙈";
    } else {
      password.type = "password";
      toggleLoginPassword.textContent = "👁";
    }
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const loginData = {
      emailOrUsername: emailOrUsername.value.trim(),
      password: password.value.trim()
    };

    if (!loginData.emailOrUsername || !loginData.password) {
      messageBox.textContent = "Please fill in all fields.";
      messageBox.style.color = "red";
      return;
    }

    messageBox.textContent = "Logging in...";
    messageBox.style.color = "#2563eb";

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData)
      });

      const data = await res.json();

      if (!res.ok) {
        messageBox.textContent = data.message || "Login failed.";
        messageBox.style.color = "red";
        return;
      }

      // Save logged in user
      localStorage.setItem("courseMateUser", JSON.stringify(data.user));

      messageBox.textContent = "Login successful. Redirecting...";
      messageBox.style.color = "green";

      setTimeout(() => {
        window.location.href = "chat.html";
      }, 1200);

    } catch (error) {
      console.error("LOGIN ERROR:", error);
      messageBox.textContent = "Could not connect to the server.";
      messageBox.style.color = "red";
    }
  });
}
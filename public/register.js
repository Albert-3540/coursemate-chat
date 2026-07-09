const registerForm = document.getElementById("registerForm");
const fullName = document.getElementById("fullName");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const messageBox = document.getElementById("messageBox");
const toggleRegisterPassword = document.getElementById("toggleRegisterPassword");

// SHOW / HIDE PASSWORD
if (toggleRegisterPassword && password) {
  toggleRegisterPassword.addEventListener("click", () => {
    if (password.type === "password") {
      password.type = "text";
      toggleRegisterPassword.textContent = "🙈";
    } else {
      password.type = "password";
      toggleRegisterPassword.textContent = "👁";
    }
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userData = {
      fullName: fullName.value.trim(),
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value.trim()
    };

    if (!userData.fullName || !userData.username || !userData.email || !userData.password) {
      messageBox.textContent = "Please fill in all fields.";
      messageBox.style.color = "red";
      return;
    }

    messageBox.textContent = "Creating account...";
    messageBox.style.color = "#2563eb";

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      });

      let data = {};
      try {
        data = await res.json();
      } catch (err) {
        data = { message: "Server returned an invalid response." };
      }

      if (!res.ok) {
        messageBox.textContent = data.message || "Registration failed.";
        messageBox.style.color = "red";
        return;
      }

      messageBox.textContent = "Account created successfully. Redirecting to login...";
      messageBox.style.color = "green";

      registerForm.reset();

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      messageBox.textContent = "Could not connect to the server.";
      messageBox.style.color = "red";
    }
  });
}
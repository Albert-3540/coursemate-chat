const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files from public/
app.use(express.static(path.join(__dirname, "public")));

// File paths
const dataFolder = path.join(__dirname, "data");
const usersFilePath = path.join(dataFolder, "users.json");
const messagesFilePath = path.join(dataFolder, "messages.json");

// Ensure data files exist
function ensureDataFiles() {
  if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder, { recursive: true });
  if (!fs.existsSync(usersFilePath)) fs.writeFileSync(usersFilePath, "[]", "utf8");
  if (!fs.existsSync(messagesFilePath)) fs.writeFileSync(messagesFilePath, "[]", "utf8");
}

function readJson(filePath) {
  ensureDataFiles();
  try {
    const data = fs.readFileSync(filePath, "utf8").trim();
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

function writeJson(filePath, data) {
  ensureDataFiles();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// Homepage route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Register
app.post("/api/auth/register", (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const users = readJson(usersFilePath);

    const emailExists = users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists." });
    }

    const usernameExists = users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    if (usernameExists) {
      return res.status(400).json({ message: "Username already exists." });
    }

    const newUser = {
      id: Date.now().toString(),
      fullName,
      username,
      email,
      password
    };

    users.push(newUser);
    writeJson(usersFilePath, users);

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Server error during registration." });
  }
});

// Login
app.post("/api/auth/login", (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        message: "Email/Username and password are required."
      });
    }

    const users = readJson(usersFilePath);

    const user = users.find(
      (u) =>
        (
          u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
          u.username.toLowerCase() === emailOrUsername.toLowerCase()
        ) &&
        u.password === password
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid login details." });
    }

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Server error during login." });
  }
});

// Users
app.get("/api/users", (req, res) => {
  try {
    const users = readJson(usersFilePath);
    const safeUsers = users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      username: user.username,
      email: user.email
    }));
    return res.status(200).json(safeUsers);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch users." });
  }
});

// Messages
app.get("/api/messages", (req, res) => {
  try {
    const messages = readJson(messagesFilePath);
    return res.status(200).json(messages);
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    return res.status(500).json({ message: "Failed to fetch messages." });
  }
});

app.post("/api/messages", (req, res) => {
  try {
    const { fullName, username, text } = req.body;

    if (!fullName || !username || !text) {
      return res.status(400).json({ message: "Missing message details." });
    }

    const messages = readJson(messagesFilePath);

    const newMessage = {
      id: Date.now().toString(),
      fullName,
      username,
      text,
      createdAt: new Date().toISOString()
    };

    messages.push(newMessage);
    writeJson(messagesFilePath, messages);

    return res.status(201).json({
      message: "Message sent successfully.",
      chat: newMessage
    });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return res.status(500).json({ message: "Failed to send message." });
  }
});

app.listen(PORT, () => {
  ensureDataFiles();
  console.log(`Server is running on port ${PORT}`);
});
// ===== CONFIGURATION =====
const API_URL = window.location.origin;
let currentUser = null;
let currentChat = 'general';

// ===== DOM ELEMENTS =====
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const chatForm = document.getElementById('chatForm');
const profileName = document.getElementById('profileName');
const profileUsername = document.getElementById('profileUsername');
const onlineUsersList = document.getElementById('onlineUsersList');
const onlineCount = document.getElementById('onlineCount');
const logoutBtn = document.getElementById('logoutBtn');
const emojiBtn = document.getElementById('emojiBtn');
const emojiPicker = document.getElementById('emojiPicker');
const fileInput = document.getElementById('fileInput');
const attachBtn = document.getElementById('attachBtn');
const searchInput = document.getElementById('searchInput');
const contextMenu = document.getElementById('contextMenu');
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadMessages();
    loadUsers();
    setupEventListeners();
    setupWebSocket();
});

// ===== LOAD USER PROFILE =====
function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.fullName) {
        profileName.textContent = user.fullName;
        profileUsername.textContent = `@${user.username || 'student'}`;
        document.getElementById('profilePic').src = 
            user.avatar || `https://i.pravatar.cc/100?img=${Math.floor(Math.random() * 70)}`;
    }
}

// ===== LOAD MESSAGES =====
async function loadMessages() {
    try {
        const response = await fetch('/api/messages');
        const messages = await response.json();
        renderMessages(messages);
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// ===== RENDER MESSAGES =====
function renderMessages(messages) {
    chatMessages.innerHTML = '';
    let lastDate = '';

    messages.forEach(msg => {
        const msgDate = new Date(msg.createdAt).toLocaleDateString();
        if (msgDate !== lastDate) {
            lastDate = msgDate;
            const divider = document.createElement('div');
            divider.className = 'date-divider';
            divider.textContent = msgDate;
            chatMessages.appendChild(divider);
        }

        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${msg.username === currentUser?.username ? 'sent' : 'received'}`;
        wrapper.dataset.id = msg.id;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';

        if (msg.username !== currentUser?.username) {
            const name = document.createElement('span');
            name.className = 'message-name';
            name.textContent = msg.fullName || msg.username;
            bubble.appendChild(name);
        }

        const text = document.createElement('div');
        text.className = 'message-text';

        // ===== VIDEO SUPPORT =====
        if (msg.video) {
            const video = document.createElement('video');
            video.src = msg.video;
            video.controls = true;
            video.preload = 'metadata';
            video.style.maxWidth = '300px';
            video.style.borderRadius = '8px';
            video.style.marginTop = '4px';
            video.addEventListener('click', function() {
                if (this.paused) {
                    this.play();
                } else {
                    this.pause();
                }
            });
            text.appendChild(video);
        }

        // ===== IMAGE SUPPORT =====
        if (msg.image) {
            const img = document.createElement('img');
            img.src = msg.image;
            img.alt = 'Image';
            img.style.maxWidth = '300px';
            img.style.borderRadius = '8px';
            img.style.marginTop = '4px';
            text.appendChild(img);
        }

        // ===== FILE ATTACHMENT SUPPORT =====
        if (msg.file) {
            const fileLink = document.createElement('a');
            fileLink.href = msg.file;
            fileLink.download = msg.fileName || 'download';
            fileLink.target = '_blank';
            fileLink.style.display = 'inline-block';
            fileLink.style.padding = '8px 14px';
            fileLink.style.background = '#f0f2f5';
            fileLink.style.borderRadius = '6px';
            fileLink.style.color = '#6c63ff';
            fileLink.style.textDecoration = 'none';
            fileLink.style.marginTop = '4px';
            fileLink.innerHTML = `📎 ${msg.fileName || 'Attachment'}`;
            text.appendChild(fileLink);
        }

        if (msg.text) {
            text.appendChild(document.createTextNode(msg.text));
        }

        bubble.appendChild(text);

        const meta = document.createElement('div');
        meta.className = 'message-meta';
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        meta.appendChild(time);

        if (msg.username === currentUser?.username) {
            const status = document.createElement('span');
            status.className = 'message-status';
            status.textContent = '✓✓';
            meta.appendChild(status);
        }

        bubble.appendChild(meta);
        wrapper.appendChild(bubble);
        chatMessages.appendChild(wrapper);
    });

    scrollToBottom();
}

// ===== SEND MESSAGE =====
async function sendMessage(text, mediaData = null, mediaType = null, fileName = null) {
    if (!text.trim() && !mediaData) return;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const messageData = {
        fullName: user.fullName || 'Student',
        username: user.username || 'student',
        text: text.trim()
    };

    // Add media based on type
    if (mediaType === 'image') {
        messageData.image = mediaData;
    } else if (mediaType === 'video') {
        messageData.video = mediaData;
    } else if (mediaType === 'file') {
        messageData.file = mediaData;
        messageData.fileName = fileName;
    }

    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(messageData)
        });

        if (response.ok) {
            const result = await response.json();
            renderMessage(result.chat);
            messageInput.value = '';
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
    }
}

// ===== RENDER SINGLE MESSAGE =====
function renderMessage(msg) {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${msg.username === currentUser?.username ? 'sent' : 'received'}`;
    wrapper.dataset.id = msg.id;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';

    if (msg.username !== currentUser?.username) {
        const name = document.createElement('span');
        name.className = 'message-name';
        name.textContent = msg.fullName || msg.username;
        bubble.appendChild(name);
    }

    const text = document.createElement('div');
    text.className = 'message-text';

    // ===== VIDEO SUPPORT =====
    if (msg.video) {
        const video = document.createElement('video');
        video.src = msg.video;
        video.controls = true;
        video.preload = 'metadata';
        video.style.maxWidth = '300px';
        video.style.borderRadius = '8px';
        video.style.marginTop = '4px';
        video.addEventListener('click', function() {
            if (this.paused) {
                this.play();
            } else {
                this.pause();
            }
        });
        text.appendChild(video);
    }

    // ===== IMAGE SUPPORT =====
    if (msg.image) {
        const img = document.createElement('img');
        img.src = msg.image;
        img.alt = 'Image';
        img.style.maxWidth = '300px';
        img.style.borderRadius = '8px';
        img.style.marginTop = '4px';
        text.appendChild(img);
    }

    // ===== FILE ATTACHMENT SUPPORT =====
    if (msg.file) {
        const fileLink = document.createElement('a');
        fileLink.href = msg.file;
        fileLink.download = msg.fileName || 'download';
        fileLink.target = '_blank';
        fileLink.style.display = 'inline-block';
        fileLink.style.padding = '8px 14px';
        fileLink.style.background = '#f0f2f5';
        fileLink.style.borderRadius = '6px';
        fileLink.style.color = '#6c63ff';
        fileLink.style.textDecoration = 'none';
        fileLink.style.marginTop = '4px';
        fileLink.innerHTML = `📎 ${msg.fileName || 'Attachment'}`;
        text.appendChild(fileLink);
    }

    if (msg.text) {
        text.appendChild(document.createTextNode(msg.text));
    }

    bubble.appendChild(text);

    const meta = document.createElement('div');
    meta.className = 'message-meta';
    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    meta.appendChild(time);

    if (msg.username === currentUser?.username) {
        const status = document.createElement('span');
        status.className = 'message-status';
        status.textContent = '✓✓';
        meta.appendChild(status);
    }

    bubble.appendChild(meta);
    wrapper.appendChild(bubble);
    chatMessages.appendChild(wrapper);
    scrollToBottom();
}

// ===== LOAD USERS =====
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// ===== RENDER USERS =====
function renderUsers(users) {
    onlineUsersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${user.fullName || user.username}</span>
            <small>@${user.username}</small>
        `;
        onlineUsersList.appendChild(li);
    });
    onlineCount.textContent = users.length;
}

// ===== SCROLL TO BOTTOM =====
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ===== SETUP EVENT LISTENERS =====
function setupEventListeners() {
    // Send message
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage(messageInput.value);
    });

    // Enter key to send
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    });

    // Emoji picker
    emojiBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        emojiPicker.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        emojiPicker.classList.remove('show');
    });

    // Emoji selection
    document.querySelectorAll('.emoji-grid span').forEach(emoji => {
        emoji.addEventListener('click', () => {
            messageInput.value += emoji.textContent;
            messageInput.focus();
            emojiPicker.classList.remove('show');
        });
    });

    // File attachment - SUPPORTS IMAGES, VIDEOS, AND DOCUMENTS
    attachBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        const fileType = file.type;

        // ===== VIDEO SUPPORT =====
        if (fileType.startsWith('video/')) {
            reader.onload = async (event) => {
                await sendMessage('', event.target.result, 'video');
            };
            reader.readAsDataURL(file);
        } 
        // ===== IMAGE SUPPORT =====
        else if (fileType.startsWith('image/')) {
            reader.onload = async (event) => {
                await sendMessage('', event.target.result, 'image');
            };
            reader.readAsDataURL(file);
        } 
        // ===== OTHER FILES (PDF, DOC, etc.) =====
        else {
            // For files, we'll store as base64 (small files only)
            // For production, use cloud storage like Cloudinary
            reader.onload = async (event) => {
                await sendMessage('', event.target.result, 'file', file.name);
            };
            reader.readAsDataURL(file);
        }

        fileInput.value = '';
    });

    // Search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.chat-item').forEach(item => {
            const name = item.querySelector('h4').textContent.toLowerCase();
            item.style.display = name.includes(query) ? 'flex' : 'none';
        });
    });

    // Context menu
    document.addEventListener('contextmenu', (e) => {
        const msg = e.target.closest('.message-wrapper');
        if (msg) {
            e.preventDefault();
            contextMenu.style.left = e.clientX + 'px';
            contextMenu.style.top = e.clientY + 'px';
            contextMenu.classList.add('show');
            contextMenu.dataset.msgId = msg.dataset.id;
        } else {
            contextMenu.classList.remove('show');
        }
    });

    document.addEventListener('click', () => {
        contextMenu.classList.remove('show');
    });

    // Context menu actions
    document.querySelectorAll('.context-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const msgId = contextMenu.dataset.msgId;
            console.log(`${action} message ${msgId}`);
            contextMenu.classList.remove('show');
        });
    });

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Click outside sidebar to close on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
}

// ===== WEBSOCKET SETUP =====
function setupWebSocket() {
    console.log('WebSocket ready for real-time updates');
}

// ===== TYPING INDICATOR =====
let typingTimeout;
messageInput.addEventListener('input', () => {
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        // Hide typing indicator
    }, 1000);
});

// ===== VOICE MESSAGE =====
document.getElementById('micBtn').addEventListener('click', () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        alert('🎤 Voice recording coming soon!');
    } else {
        alert('Your browser does not support voice recording.');
    }
});

console.log('✅ WhatsApp-style chat loaded successfully!');
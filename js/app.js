document.addEventListener('DOMContentLoaded', () => {
    // ---- DOM Elements ----

    // Auth & Navigation
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Auth Forms
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');

    const signupNameInput = document.getElementById('signup-name');
    const signupEmailInput = document.getElementById('signup-email');
    const signupPasswordInput = document.getElementById('signup-password');
    const signupConfirmInput = document.getElementById('signup-confirm');
    const signupError = document.getElementById('signup-error');
    const signupSuccess = document.getElementById('signup-success');

    // Dashboard Elements
    const userDisplayName = document.getElementById('user-display-name');
    const greetingName = document.getElementById('greeting-name');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    // Chat Elements
    const chatBox = document.getElementById('chat-box');
    const welcomeScreen = document.getElementById('welcome-screen');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const voiceBtn = document.getElementById('voice-btn');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const chips = document.querySelectorAll('.chip');

    // Mobile Sidebar
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');

    // State
    let currentUser = null;
    let chatHistory = [];

    // ---- Initialization ----

    const init = () => {
        // Check for logged in user
        const storedUser = localStorage.getItem('hm_user_session');
        if (storedUser) {
            currentUser = JSON.parse(storedUser);
            loadDashboard();
        } else {
            showAuth();
        }

        // Check Theme
        const storedTheme = localStorage.getItem('hm_theme') || 'light';
        document.body.setAttribute('data-theme', storedTheme);
        updateThemeIcon(storedTheme);
    };

    // ---- Authentication Logic ----

    // Form Switching
    document.getElementById('go-to-signup').addEventListener('click', () => {
        loginForm.classList.remove('active-form');
        loginForm.classList.add('hidden-form');
        signupForm.classList.remove('hidden-form');
        signupForm.classList.add('active-form');
        resetMessages();
    });

    document.getElementById('go-to-login').addEventListener('click', () => {
        signupForm.classList.remove('active-form');
        signupForm.classList.add('hidden-form');
        loginForm.classList.remove('hidden-form');
        loginForm.classList.add('active-form');
        resetMessages();
    });

    const resetMessages = () => {
        loginError.style.display = 'none';
        signupError.style.display = 'none';
        signupSuccess.style.display = 'none';
    };

    // Signup Submit
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = signupNameInput.value.trim();
        const email = signupEmailInput.value.trim();
        const pwd = signupPasswordInput.value;
        const confirm = signupConfirmInput.value;

        if (pwd !== confirm) {
            showError(signupError, "Passwords do not match!");
            return;
        }

        // Mock Database logic (storing user list in local storage)
        let users = JSON.parse(localStorage.getItem('hm_users') || "[]");
        if (users.find(u => u.email === email)) {
            showError(signupError, "Email is already registered.");
            return;
        }

        const newUser = { id: Date.now().toString(), name, email, password: pwd };
        users.push(newUser);
        localStorage.setItem('hm_users', JSON.stringify(users));

        // Create user specific chat storage
        localStorage.setItem(`hm_chat_${newUser.id}`, JSON.stringify([]));

        signupError.style.display = 'none';
        signupSuccess.textContent = "Account created successfully! Please log in.";
        signupSuccess.style.display = 'block';
        signupForm.reset();

        setTimeout(() => {
            document.getElementById('go-to-login').click();
        }, 1500);
    });

    // Login Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginEmailInput.value.trim();
        const pwd = loginPasswordInput.value;

        let users = JSON.parse(localStorage.getItem('hm_users') || "[]");
        const user = users.find(u => u.email === email && u.password === pwd);

        if (user) {
            // Success
            currentUser = { id: user.id, name: user.name, email: user.email };
            localStorage.setItem('hm_user_session', JSON.stringify(currentUser));
            loginForm.reset();
            loadDashboard();
        } else {
            showError(loginError, "Invalid email or password!");
        }
    });

    const showError = (element, message) => {
        element.textContent = message;
        element.style.display = 'block';
    };

    const showAuth = () => {
        appContainer.classList.remove('view-active');
        appContainer.classList.add('view-hidden');
        authContainer.classList.remove('view-hidden');
        authContainer.classList.add('view-active');
    };

    // ---- Dashboard Logic ----

    const loadDashboard = () => {
        authContainer.classList.remove('view-active');
        authContainer.classList.add('view-hidden');
        appContainer.classList.remove('view-hidden');
        appContainer.classList.add('view-active');

        userDisplayName.textContent = currentUser.name;
        greetingName.textContent = currentUser.name.split(' ')[0];

        // Load chat history
        const savedChat = localStorage.getItem(`hm_chat_${currentUser.id}`);
        chatHistory = savedChat ? JSON.parse(savedChat) : [];

        renderChatHistory();
    };

    const renderChatHistory = () => {
        // Clear chat box except welcome screen
        const messages = document.querySelectorAll('.chat-message');
        messages.forEach(m => m.remove());

        if (chatHistory.length === 0) {
            welcomeScreen.style.display = 'block';
        } else {
            welcomeScreen.style.display = 'none';
            chatHistory.forEach(msg => {
                appendMessageToUI(msg.sender, msg.text, msg.timestamp, false);
            });
            scrollToBottom();
        }
    };

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('hm_user_session');
        currentUser = null;
        chatHistory = [];
        showAuth();
    });

    // Theme Toggling
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('hm_theme', newTheme);
        updateThemeIcon(newTheme);
    });

    const updateThemeIcon = (theme) => {
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            themeToggle.querySelector('span').textContent = 'Light Mode';
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            themeToggle.querySelector('span').textContent = 'Dark Mode';
        }
    };

    // Mobile Sidebar
    openSidebarBtn.addEventListener('click', () => sidebar.classList.add('open'));
    closeSidebarBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    // ---- Chatbot Logic ----

    chatInput.addEventListener('input', () => {
        sendBtn.disabled = chatInput.value.trim().length === 0;
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        processUserMessage(text);
    });

    // Suggestion Chips
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            processUserMessage(`I want to know about ${chip.textContent.toLowerCase()}`);
        });
    });

    const processUserMessage = async (text) => {
        // Hide welcome screen
        welcomeScreen.style.display = 'none';

        // Add User message
        const timestamp = getFormattedTime();
        addMessageToState('user', text, timestamp);
        appendMessageToUI('user', text, timestamp, true);

        chatInput.value = '';
        sendBtn.disabled = true;

        // Show typing indicator
        showTypingIndicator();

        // Fetch AI Response
        const aiResponse = await generateAIResponse(text);

        removeTypingIndicator();
        const aiTime = getFormattedTime();
        addMessageToState('ai', aiResponse, aiTime);
        appendMessageToUI('ai', aiResponse, aiTime, true);
    };

    const addMessageToState = (sender, text, timestamp) => {
        chatHistory.push({ sender, text, timestamp });
        if (currentUser) {
            localStorage.setItem(`hm_chat_${currentUser.id}`, JSON.stringify(chatHistory));
        }
    };

    const appendMessageToUI = (sender, text, timestamp, animate) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${sender}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const textP = document.createElement('div');

        // Parse basic markdown to HTML for beautiful structure
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');

        textP.innerHTML = formattedText;
        textP.style.lineHeight = '1.6';
        textP.style.fontFamily = 'inherit';

        const timeSpan = document.createElement('span');
        timeSpan.className = 'timestamp';
        timeSpan.textContent = timestamp;

        contentDiv.appendChild(textP);
        contentDiv.appendChild(timeSpan);

        msgDiv.appendChild(avatarDiv);
        msgDiv.appendChild(contentDiv);

        chatBox.appendChild(msgDiv);
        scrollToBottom();
    };

    const showTypingIndicator = () => {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message ai';
        typingDiv.id = 'typing-indicator-msg';
        typingDiv.innerHTML = `
            <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="message-content" style="padding: 0.8rem 1rem;">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        chatBox.appendChild(typingDiv);
        scrollToBottom();
    };

    const removeTypingIndicator = () => {
        const typingMsg = document.getElementById('typing-indicator-msg');
        if (typingMsg) typingMsg.remove();
    };

    const scrollToBottom = () => {
        chatBox.scrollTop = chatBox.scrollHeight;
    };

    const getFormattedTime = () => {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
    };

    // Generative AI Request
    // Generative AI Request
    const generateAIResponse = async (userText) => {
        try {
            // Build the conversational prompt
            let prompt = "System: You are HealthMate AI, a smart and friendly healthcare assistant. Give concise, highly structured, and easy-to-read answers using bullet points. If the user asks for a multi-day plan or list (like an entire week), provide the FULL schedule they requested, but keep each point very brief. Do not provide medical diagnosis.\n\n";

            // Add last 5 messages for context
            const recentHistory = chatHistory.slice(-5);
            recentHistory.forEach(msg => {
                prompt += `${msg.sender === 'user' ? 'User' : 'HealthMate'}: ${msg.text}\n`;
            });
            prompt += "HealthMate:";

            // Use simple GET request endpoint to completely bypass CORS preflight restrictions on local files
            const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP Error ${response.status}`);
            }

            let textResponse = await response.text();

            if (textResponse) {
                // Strip Pollinations.AI ad watermarks
                textResponse = textResponse.replace(/\s*\-{2,}\s*Support Pollinations\.AI:[\s\S]*/i, '');
                textResponse = textResponse.replace(/\s*🌸 Ad 🌸[\s\S]*/i, '');
                textResponse = textResponse.replace(/\s*\-{2,}\s*Powered by Pollinations[\s\S]*/i, '');

                return textResponse.trim();
            } else {
                return "I'm having trouble processing that right now. Could you rephrase your question?";
            }
        } catch (error) {
            console.error(error);
            return `Oops, I couldn't reach the backend. The connection was blocked or you are offline. (Error: ${error.message})`;
        }
    };

    // Clear Chat
    clearChatBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear your chat history?")) {
            chatHistory = [];
            if (currentUser) {
                localStorage.setItem(`hm_chat_${currentUser.id}`, JSON.stringify(chatHistory));
            }
            renderChatHistory();
        }
    });

    document.getElementById('new-chat-btn').addEventListener('click', () => {
        if (chatHistory.length > 0 && confirm("Start a new chat? This will clear current screen.")) {
            // In a real app, we'd save it to a sidebar list. For now, clear it.
            chatHistory = [];
            if (currentUser) {
                localStorage.setItem(`hm_chat_${currentUser.id}`, JSON.stringify(chatHistory));
            }
            renderChatHistory();
        }
    });

    // ---- Voice Input Integration (Web Speech API) ----
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        let isRecording = false;

        voiceBtn.addEventListener('click', () => {
            if (isRecording) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });

        recognition.onstart = () => {
            isRecording = true;
            voiceBtn.classList.add('active');
            chatInput.placeholder = "Listening...";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            chatInput.value = transcript;
            sendBtn.disabled = false;
        };

        recognition.onend = () => {
            isRecording = false;
            voiceBtn.classList.remove('active');
            chatInput.placeholder = "Type your health-related query here...";
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            isRecording = false;
            voiceBtn.classList.remove('active');
            chatInput.placeholder = "Type your health-related query here...";
        };
    } else {
        voiceBtn.style.display = 'none'; // Hide if not supported
    }

    // Run Initialization
    init();

});

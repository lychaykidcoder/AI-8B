

// --- IMPORTANT: GET YOUR FREE API KEY ---
// 1. Go to Google AI Studio: https://aistudio.google.com/
// 2. Click "Get API key" and create a new key.
// 3. Copy the key and paste it here.
const API_KEY = 'AIzaSyA-hdZ5GMHLXMgLlqtVizXOCpzg62EJHC8';


const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const uploadBtn = document.getElementById('upload-btn');
const imageUpload = document.getElementById('image-upload');
const imagePreviewContainer = document.getElementById('image-preview-container');
const imagePreview = document.getElementById('image-preview');
const removeImageBtn = document.getElementById('remove-image-btn');
const darkModeToggle = document.getElementById('darkModeToggle');

let uploadedImageBase64 = null;



async function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === '' && !uploadedImageBase64) return;

    displayMessage(userText, 'user');
    const prompt = userText;
    userInput.value = '';
    userInput.style.height = 'auto'; 
    

    showTypingIndicator();
    
    try {
        
        const model = 'gemini-1.5-flash'; 
        
        // Prepare the content for the API request
        const contents = [];
        if (uploadedImageBase64) {
            contents.push({
                inlineData: {
                    mimeType: 'image/jpeg', // Assuming JPEG, adjust if needed
                    data: uploadedImageBase64
                }
            });
        }
        if (prompt) {
            contents.push({ text: prompt });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contents: [{ parts: contents }] })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || 'Failed to fetch response.');
        }

        const data = await response.json();
        const botText = data.candidates[0].content.parts[0].text;

        removeTypingIndicator();
        displayMessage(botText, 'bot');
        resetImageUpload();

    } catch (error) {
        removeTypingIndicator();
        console.error("Error:", error);
        displayMessage(`Sorry, something went wrong. Please check the console for details. (Error: ${error.message})`, 'bot');
        // A common error is a missing or invalid API key.
        if (API_KEY === 'PASTE_YOUR_GOOGLE_AI_API_KEY_HERE') {
             displayMessage('REMINDER: You need to add your free Google AI API Key to the script.js file!', 'bot');
        }
    }
}


/**
 * Displays a message in the chat container.
 * @param {string} text - The message text.
 * @param {string} sender - 'user' or 'bot'.
 */
function displayMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    
    // Use a library to parse Markdown if you want (e.g., marked.js), for now just paragraphs
    const paragraphs = text.split('\n').map(p => `<p>${p}</p>`).join('');
    messageDiv.innerHTML = paragraphs;
    
    // Add speak button for bot messages
    if (sender === 'bot') {
        const speakButton = document.createElement('button');
        speakButton.classList.add('speaker-btn');
        speakButton.innerHTML = `<span class="material-symbols-outlined">volume_up</span>`;
        speakButton.onclick = () => speakText(text);
        messageDiv.appendChild(speakButton);
    }
    
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Auto-scroll to bottom
}

function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
    typingDiv.innerHTML = `<span></span><span></span><span></span>`;
    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.querySelector('.typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}


/**
 * Converts text to speech using the browser's built-in synthesis.
 * It supports Khmer and other world languages automatically.
 * @param {string} text - The text to be spoken.
 */
function speakText(text) {
    // Stop any previously playing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    // The browser will automatically try to find a voice for the language of the text.
    // For Khmer, a Khmer-supporting voice must be installed on the user's OS (Windows, Android, etc.)
    utterance.lang = 'km-KH'; // Hint to use Khmer, will fall back if not available
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

/**
 * Handles image file selection and preview.
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreviewContainer.style.display = 'block';
            // Store the Base64 part of the string
            uploadedImageBase64 = e.target.result.split(',')[1];
        };
        reader.readAsDataURL(file);
    }
}

function resetImageUpload() {
    imageUpload.value = ''; // Reset file input
    imagePreviewContainer.style.display = 'none';
    uploadedImageBase64 = null;
}

// --- Event Listeners ---

sendBtn.addEventListener('click', sendMessage);

userInput.addEventListener('keydown', (e) => {
    // Send with Enter, but allow Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent new line
        sendMessage();
    }
});

// Auto-resize textarea
userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = (userInput.scrollHeight) + 'px';
});

// Image upload functionality
uploadBtn.addEventListener('click', () => imageUpload.click());
imageUpload.addEventListener('change', handleImageUpload);
removeImageBtn.addEventListener('click', resetImageUpload);

// Dark mode toggle
darkModeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
});
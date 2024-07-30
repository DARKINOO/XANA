// document.getElementById('chatbot-button').addEventListener('click', function() {
    document.getElementById('chat-container').classList.toggle('active');
// });

document.getElementById('send-btn').addEventListener('click', sendMessage);
document.getElementById('user-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// document.getElementById('close-btn').addEventListener('click', function() {
//     document.getElementById('chat-container').classList.remove('active');
//     document.getElementById('chatbot-button').style.display = 'flex';
// });

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();

    if (message === '') return;

    appendMessage('user', message);
    userInput.value = '';

    // Simulate bot response
    setTimeout(() => {
        fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        })
        .then(response => response.json())
        .then(data => {
            appendMessage('bot', data.response);
        })
        .catch(error => {
            console.error('Error:', error);
            appendMessage('bot', "Sorry, something went wrong.");
        });
    }, 1000);
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('chat-box');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);

    const imgElement = document.createElement('img');
    if (sender === 'user') {
        imgElement.src = 'user.jpeg'; // User icon
    } else {
        imgElement.src = 'avatar.jpeg'; // Bot icon
    }

    const textElement = document.createElement('p');
    textElement.textContent = message;

    messageElement.appendChild(imgElement);
    messageElement.appendChild(textElement);

    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById('clear-chat-btn').addEventListener('click', clearChat);

// Add this function to your existing JavaScript
function clearChat() {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = ''; // This clears all messages
    console.log('Chat cleared');
}
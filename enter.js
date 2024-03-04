"use strict";

let chatModalVisible = false;

(async () => {
    const chatModalUrl = "https://www.perplexity.ai/";

    const toggleChatButton = document.createElement('button');
    toggleChatButton.innerText = 'Open Chat';
    toggleChatButton.id = 'toggleChatButton';
    toggleChatButton.style.position = 'fixed';
    toggleChatButton.style.bottom = '10px';
    toggleChatButton.style.right = '70px';
    toggleChatButton.style.zIndex = '9999';
    document.body.appendChild(toggleChatButton);

    toggleChatButton.addEventListener('click', () => {
        if (chatModalVisible) {
            document.getElementById('chatModal').style.display = 'none';
            toggleChatButton.innerText = 'Open Chat';
        } else {
            createChatModal(chatModalUrl);
            toggleChatButton.innerText = 'Close Chat';
        }
        chatModalVisible = !chatModalVisible;
    });
})();

function createChatModal(chatUrl) {
    const chatModal = document.createElement('div');
    chatModal.id = 'chatModal';
    chatModal.style.position = 'fixed';
    chatModal.style.top = '50%';
    chatModal.style.left = '50%';
    chatModal.style.transform = 'translate(-50%, -50%)';
    chatModal.style.width = '400px';
    chatModal.style.height = '600px';
    chatModal.style.zIndex = '10000';
    chatModal.style.backgroundColor = '#fff';
    chatModal.style.border = '1px solid #ccc';

    const closeChatButton = document.createElement('button');
    closeChatButton.innerText = 'Close';
    closeChatButton.id = 'closeChatButton';
    closeChatButton.style.position = 'absolute';
    closeChatButton.style.top = '0';
    closeChatButton.style.right = '0';
    closeChatButton.style.padding = '5px 10px';
    closeChatButton.style.backgroundColor = '#f0f0f0';
    closeChatButton.style.border = 'none';
    closeChatButton.style.cursor = 'pointer';

    closeChatButton.addEventListener('click', () => {
        document.body.removeChild(chatModal); // Remove the chat modal element
        document.getElementById('toggleChatButton').innerText = 'Open Chat';
        chatModalVisible = false;
    });

    chatModal.appendChild(closeChatButton);

    const chatIframe = document.createElement('iframe');
    chatIframe.src = chatUrl;
    chatIframe.style.position = 'absolute';
    chatIframe.style.top = '0';
    chatIframe.style.left = '0';
    chatIframe.style.width = '100%';
    chatIframe.style.height = '100%';
    chatIframe.style.border = 'none';
    chatIframe.sandbox = 'allow-same-origin allow-scripts allow-forms';

    chatModal.appendChild(chatIframe);

    document.body.appendChild(chatModal);

    chatModal.style.display = 'block';
}

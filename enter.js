"use strict";

let chatModalVisible = false;
let chatModal;

(async () => {
    const chatModalUrl = "https://copilot.microsoft.com/";

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
            closeChatModal();
        } else {
            openChatModal(chatModalUrl);
        }
        chatModalVisible = !chatModalVisible;
    });
})();

function openChatModal(chatUrl) {
    if (!chatModal) {
        createChatModal(chatUrl);
    }
    chatModal.style.display = 'block';
    document.getElementById('toggleChatButton').innerText = 'Close Chat';
}

function closeChatModal() {
    if (chatModal) {
        chatModal.style.display = 'none';
        document.getElementById('toggleChatButton').innerText = 'Open Chat';
    }
}

function createChatModal(chatUrl) {
    chatModal = document.createElement('div');
    chatModal.id = 'chatModal';
    chatModal.style.position = 'fixed';
    chatModal.style.top = '50%';
    chatModal.style.left = '50%';
    chatModal.style.transform = 'translate(-50%, -50%)';
    chatModal.style.width = '768px';
    chatModal.style.height = '432px';
    chatModal.style.zIndex = '10000';
    chatModal.style.backgroundColor = '#fff';
    chatModal.style.borderRadius = '10px';
    chatModal.style.overflow = 'hidden';

    const draggableArea = document.createElement("div");
    draggableArea.style.width = "100%";
    draggableArea.style.height = "20px";
    draggableArea.style.cursor = "move";
    draggableArea.style.backgroundColor = "#ddd";
    draggableArea.style.position = "absolute";
    draggableArea.style.top = "0";
    draggableArea.style.left = "0";
    draggableArea.style.borderTopLeftRadius = "10px";
    draggableArea.style.borderTopRightRadius = "10px";
    draggableArea.style.userSelect = "none";

    let isDragging = false;
    let offsetX, offsetY;

    draggableArea.addEventListener("mousedown", (e) => {
        isDragging = true;
        offsetX = e.clientX - chatModal.getBoundingClientRect().left;
        offsetY = e.clientY - chatModal.getBoundingClientRect().top;
    });

    document.addEventListener("mousemove", (e) => {
        if (isDragging) {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            chatModal.style.left = `${x}px`;
            chatModal.style.top = `${y}px`;
        }
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
    });

    chatModal.appendChild(draggableArea);

    const minimizeButton = document.createElement('button');
    minimizeButton.innerText = 'Minimize';
    minimizeButton.style.position = 'absolute';
    minimizeButton.style.bottom = '10px';
    minimizeButton.style.right = '10px';
    minimizeButton.style.padding = '5px 10px';
    minimizeButton.style.backgroundColor = '#f0f0f0';
    minimizeButton.style.border = 'none';
    minimizeButton.style.cursor = 'pointer';
    minimizeButton.style.borderRadius = '5px';

    minimizeButton.addEventListener('click', () => {
        chatModal.style.bottom = '10px';
        chatModal.style.left = 'calc(100% - 80px)';
        chatModal.style.width = '80px';
        chatModal.style.height = '80px';
        minimizeButton.style.display = 'none';
    });

    chatModal.appendChild(minimizeButton);

    const closeChatButton = document.createElement('button');
    closeChatButton.innerText = 'Close';
    closeChatButton.style.position = 'absolute';
    closeChatButton.style.top = '0';
    closeChatButton.style.right = '0';
    closeChatButton.style.padding = '5px 10px';
    closeChatButton.style.backgroundColor = '#f0f0f0';
    closeChatButton.style.border = 'none';
    closeChatButton.style.cursor = 'pointer';
    closeChatButton.style.borderTopRightRadius = '10px';

    closeChatButton.addEventListener('click', closeChatModal);

    chatModal.appendChild(closeChatButton);

    const chatIframe = document.createElement('iframe');
    chatIframe.src = chatUrl;
    chatIframe.style.position = 'absolute';
    chatIframe.style.top = '20px';
    chatIframe.style.left = '0';
    chatIframe.style.width = '100%';
    chatIframe.style.height = 'calc(100% - 20px)';
    chatIframe.style.border = 'none';
    chatIframe.sandbox = 'allow-same-origin allow-scripts allow-forms';

    chatModal.appendChild(chatIframe);

    document.body.appendChild(chatModal);
}

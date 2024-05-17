"use strict";

let chatModalVisible = false;
let chatModal;
let chatModalUrl = "https://www.blackbox.ai/";

(async () => {
    const toggleChatButton = document.createElement('button');
    toggleChatButton.innerText = 'Open';
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
    document.getElementById('toggleChatButton').innerText = 'Close';
    enableDarkMode();
}

function closeChatModal() {
    if (chatModal) {
        chatModal.style.display = 'none';
        document.getElementById('toggleChatButton').innerText = 'Open';
        disableDarkMode();
    }
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    chatModal.classList.add('dark-mode');
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    chatModal.classList.remove('dark-mode');
}

function createChatModal(chatUrl) {
    chatModal = document.createElement('div');
    chatModal.id = 'chatModal';
    chatModal.style.position = 'fixed';
    chatModal.style.top = '50%';
    chatModal.style.left = '50%';
    chatModal.style.transform = 'translate(-50%, -50%)';
    chatModal.style.width = '1024px';
    chatModal.style.height = '576pxpx';
    chatModal.style.zIndex = '10000';
    chatModal.style.backgroundColor = '#2b2b2b';
    chatModal.style.borderRadius = '10px';
    chatModal.style.overflow = 'hidden';

    const draggableArea = document.createElement("div");
    draggableArea.className = 'dark-mode';
    draggableArea.style.width = "100%";
    draggableArea.style.height = "20px";
    draggableArea.style.cursor = "move";
    draggableArea.style.backgroundColor = "#4b4b4b";
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
            const x = Math.max(0, Math.min(e.clientX - offsetX, window.innerWidth - chatModal.clientWidth));
            const y = Math.max(0, Math.min(e.clientY - offsetY, window.innerHeight - chatModal.clientHeight));
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
    minimizeButton.style.top = '0';
    minimizeButton.style.right = '250px';
    minimizeButton.style.padding = '5px 10px';
    minimizeButton.style.backgroundColor = '#4b4b4b';
    minimizeButton.style.border = 'none';
    minimizeButton.style.cursor = 'pointer';
    minimizeButton.style.borderTopRightRadius = '10px';

    function minimizeChatModal() {
        chatModal.style.bottom = '0';
        chatModal.style.left = '50%';
        chatModal.style.transform = 'translateY(100%)';
        minimizeButton.innerText = 'Maximize';
    }
    
    minimizeButton.addEventListener('click', () => {
        if (!chatModal.classList.contains('minimized')) {
            minimizeChatModal();
            chatModal.classList.add('minimized');
        } else {
            chatModal.style.bottom = null;
            chatModal.style.left = null;
            chatModal.style.transform = null;
            minimizeButton.innerText = 'Minimize';
            minimizeButton.style.display = 'block';
            chatModal.classList.remove('minimized');
        }
    });

    chatModal.appendChild(minimizeButton);

    const inputBar = document.createElement('input');
    inputBar.type = 'text';
    inputBar.placeholder = 'Enter URL';
    inputBar.style.position = 'absolute';
    inputBar.style.top = '0';
    inputBar.style.right = '50px';
    inputBar.style.width = '200px';
    inputBar.style.padding = '5px';
    inputBar.style.border = 'none';
    inputBar.style.borderTopRightRadius = '10px';
    inputBar.style.borderTopLeftRadius = '10px';
    inputBar.style.backgroundColor = '#4b4b4b';
    inputBar.style.color = '#fff';
    inputBar.style.outline = 'none';

    inputBar.addEventListener('change', () => {
        let newUrl = inputBar.value.trim();
        if (newUrl && !newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
            newUrl = 'http://' + newUrl; // prepend 'http://' if missing
        }
        chatModalUrl = newUrl;
        const chatIframe = document.getElementById('chatIframe');
        chatIframe.src = chatModalUrl;
    });

    chatModal.appendChild(inputBar);

    const closeChatButton = document.createElement('button');
    closeChatButton.innerText = 'Close';
    closeChatButton.style.position = 'absolute';
    closeChatButton.style.top = '0';
    closeChatButton.style.right = '0';
    closeChatButton.style.padding = '5px 10px';
    closeChatButton.style.backgroundColor = '#4b4b4b';
    closeChatButton.style.border = 'none';
    closeChatButton.style.cursor = 'pointer';
    closeChatButton.style.borderTopRightRadius = '10px';

    closeChatButton.addEventListener('click', closeChatModal);

    chatModal.appendChild(closeChatButton);

    const chatIframe = document.createElement('iframe');
    chatIframe.src = chatUrl;
    chatIframe.id = 'chatIframe';
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

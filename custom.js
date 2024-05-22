"use strict";

let chatModalVisible = false;
let chatModal;
let chatModalUrl = "https://www.blackbox.ai/";

function getBackgroundColor() {
    const bodyStyles = window.getComputedStyle(document.body);
    return bodyStyles.backgroundColor || '#000';
}

(async () => {
    const toggleChatButton = document.createElement('button');
    toggleChatButton.innerText = '💬';
    toggleChatButton.id = 'toggleChatButton';
    toggleChatButton.style.position = 'fixed';
    toggleChatButton.style.bottom = '10px';
    toggleChatButton.style.right = '70px';
    toggleChatButton.style.zIndex = '9999';
    toggleChatButton.style.width = '60px';
    toggleChatButton.style.height = '60px';
    toggleChatButton.style.backgroundColor = getBackgroundColor();
    toggleChatButton.style.color = '#fff';
    toggleChatButton.style.border = 'none';
    toggleChatButton.style.borderRadius = '50%';
    toggleChatButton.style.cursor = 'pointer';
    toggleChatButton.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.3)';
    toggleChatButton.style.fontSize = '24px';
    toggleChatButton.style.display = 'flex';
    toggleChatButton.style.alignItems = 'center';
    toggleChatButton.style.justifyContent = 'center';
    toggleChatButton.style.transition = 'transform 0.3s ease';
    document.body.appendChild(toggleChatButton);

    toggleChatButton.addEventListener('mouseenter', () => {
        toggleChatButton.style.transform = 'scale(1.1)';
    });

    toggleChatButton.addEventListener('mouseleave', () => {
        toggleChatButton.style.transform = 'scale(1)';
    });

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
    chatModal.style.opacity = '1';
    chatModal.style.transform = 'translate(-50%, -50%) scale(1)';
    document.getElementById('toggleChatButton').innerText = '💬';
    enableDarkMode();
}

function closeChatModal() {
    if (chatModal) {
        chatModal.style.opacity = '0';
        chatModal.style.transform = 'translate(-50%, -50%) scale(0.9)';
        document.getElementById('toggleChatButton').innerText = '💬';
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
    chatModal.className = 'github-style'; // Add GitHub style class
    chatModal.style.position = 'fixed';
    chatModal.style.top = '50%';
    chatModal.style.left = '50%';
    chatModal.style.transform = 'translate(-50%, -50%) scale(0.9)';
    chatModal.style.opacity = '0';
    chatModal.style.width = '700px';
    chatModal.style.height = '500px'; // Reduce height for GitHub style
    chatModal.style.zIndex = '10000';
    chatModal.style.backgroundColor = '#fff'; // White background
    chatModal.style.borderRadius = '8px'; // Slightly rounded corners
    chatModal.style.overflow = 'hidden';
    chatModal.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.1)'; // Lighter shadow
    chatModal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    const draggableArea = document.createElement("div");
    draggableArea.style.width = "100%";
    draggableArea.style.height = "30px";
    draggableArea.style.cursor = "move";
    draggableArea.style.background = 'linear-gradient(90deg, #f6f8fa, #e1e4e8)'; // GitHub style gradient
    draggableArea.style.position = "absolute";
    draggableArea.style.top = "0";
    draggableArea.style.left = "0";
    draggableArea.style.borderTopLeftRadius = "8px"; // Slightly rounded top corners
    draggableArea.style.borderTopRightRadius = "8px";
    draggableArea.style.userSelect = "none";
    draggableArea.style.display = 'flex';
    draggableArea.style.alignItems = 'center';
    draggableArea.style.padding = '0 10px';
    draggableArea.style.color = '#24292e'; // GitHub text color
    draggableArea.innerText = 'Chat';

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
    minimizeButton.innerText = '➖';
    minimizeButton.style.position = 'absolute';
    minimizeButton.style.top = '5px';
    minimizeButton.style.right = '10px'; // Adjusted position for GitHub style
    minimizeButton.style.padding = '5px 10px';
    minimizeButton.style.backgroundColor = '#f6f8fa'; // Light background
    minimizeButton.style.color = '#24292e'; // GitHub text color
    minimizeButton.style.border = 'none';
    minimizeButton.style.cursor = 'pointer';
    minimizeButton.style.borderRadius = '5px';
    minimizeButton.style.transition = 'background-color 0.3s ease, transform 0.3s ease';

    minimizeButton.addEventListener('mouseenter', () => {
        minimizeButton.style.backgroundColor = '#e1e4e8'; // Lighter background on hover
        minimizeButton.style.transform = 'scale(1.1)';
    });

    minimizeButton.addEventListener('mouseleave', () => {
        minimizeButton.style.backgroundColor = '#f6f8fa'; // Restore original background
        minimizeButton.style.transform = 'scale(1)';
    });

    function minimizeChatModal() {
        chatModal.style.bottom = '0';
        chatModal.style.left = '50%';
        chatModal.style.transform = 'translateY(100%)';
        minimizeButton.innerText = '➕';
    }

    minimizeButton.addEventListener('click', () => {
        if (!chatModal.classList.contains('minimized')) {
            minimizeChatModal();
            chatModal.classList.add('minimized');
        } else {
            chatModal.style.bottom = null;
            chatModal.style.left = null;
            chatModal.style.transform = null;
            minimizeButton.innerText = '➖';
            minimizeButton.style.display = 'block';
            chatModal.classList.remove('minimized');
        }
    });

    chatModal.appendChild(minimizeButton);

    const inputBar = document.createElement('input');
    inputBar.type = 'text';
    inputBar.placeholder = 'Enter URL';
    inputBar.style.position = 'absolute';
    inputBar.style.top = '5px';
    inputBar.style.right = '100px';
    inputBar.style.width = '200px';
    inputBar.style.padding = '5px';
    inputBar.style.border = 'none';
    inputBar.style.borderRadius = '5px';
    inputBar.style.backgroundColor = '#f6f8fa'; // Light background
    inputBar.style.color = '#24292e'; // GitHub text color
    inputBar.style.outline = 'none';
    inputBar.style.transition = 'background-color 0.3s ease, transform 0.3s ease';

    inputBar.addEventListener('mouseenter', () => {
        inputBar.style.backgroundColor = '#e1e4e8'; // Lighter background on hover
        inputBar.style.transform = 'scale(1.1)';
    });

    inputBar.addEventListener('mouseleave', () => {
        inputBar.style.backgroundColor = '#f6f8fa'; // Restore original background
        inputBar.style.transform = 'scale(1)';
    });

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

    const chatIframe = document.createElement('iframe');
    chatIframe.src = chatUrl;
    chatIframe.id = 'chatIframe';
    chatIframe.style.position = 'absolute';
    chatIframe.style.top = '30px';
    chatIframe.style.left = '0';
    chatIframe.style.width = '100%';
    chatIframe.style.height = 'calc(100% - 30px)';
    chatIframe.style.border = 'none';

    chatModal.appendChild(chatIframe);

    document.body.appendChild(chatModal);
}

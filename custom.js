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
    toggleChatButton.style.transition = 'transform 0.3s ease, background-color 0.3s ease';
    document.body.appendChild(toggleChatButton);
    
    toggleChatButton.addEventListener('mouseenter', (event) => {
        const buttonRect = toggleChatButton.getBoundingClientRect();
        const angle = Math.atan2(event.clientY - (buttonRect.top + buttonRect.height / 2), event.clientX - (buttonRect.left + buttonRect.width / 2));
        toggleChatButton.style.transform = `scale(1.1) rotate(${angle}rad)`;
        toggleChatButton.style.backgroundColor = lightenColor(getBackgroundColor(), 90);
        toggleChatButton.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.3)';
        toggleChatButton.classList.add('pulse');
    });
    
    toggleChatButton.addEventListener('mouseleave', () => {
        toggleChatButton.style.transform = 'scale(1) rotate(0rad)';
        toggleChatButton.style.backgroundColor = getBackgroundColor();
        toggleChatButton.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.3)';
        toggleChatButton.classList.remove('pulse');
    });
    
    toggleChatButton.addEventListener('click', () => {
        if (chatModalVisible) {
            closeChatModal();
        } else {
            openChatModal(chatModalUrl);
        }
        chatModalVisible = !chatModalVisible;
    });
    
    function lightenColor(color, percent) {
        var num = parseInt(color.replace('#',''),16),
            amt = Math.round(2.55 * percent),
            R = (num >> 16) + amt,
            B = (num >> 8 & 0x00FF) + amt,
            G = (num & 0x0000FF) + amt;
    
        return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
    }
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
  const bodyBackgroundColor = getBackgroundColor();
  const isLightColor = isColorLight(bodyBackgroundColor);
  if (isLightColor) {
    document.body.classList.add('light-mode');
    chatModal.classList.add('light-mode');
    document.body.style.colorScheme = 'light';
    chatModal.style.colorScheme = 'light';
  } else {
    document.body.classList.add('dark-mode');
    chatModal.classList.add('dark-mode');
    document.body.style.colorScheme = 'dark';
    chatModal.style.colorScheme = 'dark';
  }
}

function disableDarkMode() {
  document.body.classList.remove('dark-mode');
  document.body.classList.remove('light-mode');
  chatModal.classList.remove('dark-mode');
  chatModal.classList.remove('light-mode');
  document.body.style.colorScheme = '';
  chatModal.style.colorScheme = '';
}

function isColorLight(color) {
  const hexColor = color.replace('#', '');
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);
  const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
  return brightness > 0.5;
}

function createChatModal(chatUrl) {
    chatModal = document.createElement('div');
    chatModal.id = 'chatModal';
    chatModal.className = 'github-style';
    chatModal.style.position = 'fixed';
    chatModal.style.top = '50%';
    chatModal.style.left = '50%';
    chatModal.style.transform = 'translate(-50%, -50%) scale(0.9)';
    chatModal.style.opacity = '0';
    chatModal.style.width = '700px';
    chatModal.style.height = '500px';
    chatModal.style.zIndex = '10000';
    chatModal.style.backgroundColor = '#fff';
    chatModal.style.borderRadius = '8px';
    chatModal.style.overflow = 'hidden';
    chatModal.style.boxShadow = '0px 8px 16px rgba(0, 0, 0, 0.1)';
    chatModal.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    const draggableArea = document.createElement("div");
    draggableArea.style.width = "100%";
    draggableArea.style.height = "30px";
    draggableArea.style.cursor = "move";
    draggableArea.style.background = 'linear-gradient(90deg, #f6f8fa, #e1e4e8)';
    draggableArea.style.position = "absolute";
    draggableArea.style.top = "0";
    draggableArea.style.left = "0";
    draggableArea.style.borderTopLeftRadius = "8px";
    draggableArea.style.borderTopRightRadius = "8px";
    draggableArea.style.userSelect = "none";
    draggableArea.style.display = 'flex';
    draggableArea.style.alignItems = 'center';
    draggableArea.style.padding = '0 10px';
    draggableArea.style.color = '#24292e';
    draggableArea.innerText = 'GFY';
    draggableArea.style.fontFamily = 'Roboto, sans-serif';
    draggableArea.style.fontWeight = 'bold';

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

    const darkModeButton = document.createElement('button');
    darkModeButton.style.position = 'absolute';
    darkModeButton.style.top = '1px';
    darkModeButton.style.left = '40px';
    darkModeButton.style.padding = '5px 10px';
    darkModeButton.style.backgroundColor = '#f6f8fa';
    darkModeButton.style.color = '#24292e';
    darkModeButton.style.border = 'none';
    darkModeButton.style.cursor = 'pointer';
    darkModeButton.style.borderRadius = '50%';
    darkModeButton.style.transition = 'background-color 0.3s ease, transform 0.3s ease';
    darkModeButton.innerText = '☀️';

    darkModeButton.addEventListener('mouseenter', () => {
        darkModeButton.style.backgroundColor = '#e1e4e8';
        darkModeButton.style.transform = 'scale(1.1)';
    });

    darkModeButton.addEventListener('mouseleave', () => {
        darkModeButton.style.backgroundColor = '#f6f8fa';
        darkModeButton.style.transform = 'scale(1)';
    });

    darkModeButton.addEventListener('click', () => {
        if (document.body.classList.contains('dark-mode')) {
            disableDarkMode();
            darkModeButton.innerText = '☀️';
        } else {
            enableDarkMode();
            darkModeButton.innerText = '🌙';
        }
    });

    draggableArea.appendChild(darkModeButton);

    const minimizeButton = document.createElement('button');
    minimizeButton.innerText = '➖';
    minimizeButton.style.position = 'absolute';
    minimizeButton.style.top = '5px';
    minimizeButton.style.right = '10px';
    minimizeButton.style.padding = '5px 10px';
    minimizeButton.style.backgroundColor = '#f6f8fa';
    minimizeButton.style.color = '#24292e';
    minimizeButton.style.border = 'none';
    minimizeButton.style.cursor = 'pointer';
    minimizeButton.style.borderRadius = '5px';
    minimizeButton.style.transition = 'background-color 0.3s ease, transform 0.3s ease';

    minimizeButton.addEventListener('mouseenter', () => {
        minimizeButton.style.backgroundColor = '#e1e4e8';
        minimizeButton.style.transform = 'scale(1.1)';
    });

    minimizeButton.addEventListener('mouseleave', () => {
        minimizeButton.style.backgroundColor = '#f6f8fa';
        minimizeButton.style.transform = 'scale(1)';
    });

    function minimizeChatModal() {
        chatModal.style.bottom = '0';
        chatModal.style.left = '50%';
        chatModal.style.transform = 'translateY(90%)';
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
    inputBar.style.backgroundColor = '#f6f8fa';
    inputBar.style.color = '#24292e';
    inputBar.style.outline = 'none';
    inputBar.style.transition = 'background-color 0.3s ease, transform 0.3s ease';

    inputBar.addEventListener('mouseenter', () => {
        inputBar.style.backgroundColor = '#e1e4e8';
        inputBar.style.transform = 'scale(1.1)';
    });

    inputBar.addEventListener('mouseleave', () => {
        inputBar.style.backgroundColor = '#f6f8fa';
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

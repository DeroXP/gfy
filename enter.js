const openButton = document.createElement('button');
openButton.innerText = 'Open';
openButton.id = 'openButton';
openButton.style.position = 'fixed';
openButton.style.bottom = '10px';
openButton.style.right = '10px';
openButton.style.zIndex = '9999'; // Set a z-index value
document.body.appendChild(openButton);

let chatVisible = false;

openButton.addEventListener('click', async () => {
    chatVisible = !chatVisible;

    if (chatVisible) {
        try {
            const chatContainer = document.createElement('iframe');
            chatContainer.id = 'chatContainer';
            chatContainer.style.position = 'fixed';
            chatContainer.style.top = '50%';
            chatContainer.style.left = '50%';
            chatContainer.style.transform = 'translate(-50%, -50%)';
            chatContainer.style.width = '400px';
            chatContainer.style.height = '600px';
            chatContainer.style.zIndex = '10000'; // Set a higher z-index value than the button

            // Set the iframe source to the Express server root URL
            chatContainer.src = 'http://localhost:3000/';

            // Delay the iframe creation to avoid autofocusing issues
            await new Promise(resolve => setTimeout(resolve, 500));

            document.body.appendChild(chatContainer);
        } catch (error) {
            console.error('Error creating iframe:', error);
        }
    } else {
        const chatContainer = document.getElementById('chatContainer');
        if (chatContainer) {
            chatContainer.parentNode.removeChild(chatContainer);
        }
    }

    openButton.innerText = chatVisible ? 'Close' : 'Open';
});

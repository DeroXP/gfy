// Select the textarea element by its ID
let textarea = document.getElementById('chat-input-box');

// Select the button element using its class name
let button = document.querySelector('.inline-flex.items-center.justify-center.rounded-md.text-sm.font-medium.ring-offset-background.transition-colors.focus-visible\\:outline-none.focus-visible\\:ring-2.focus-visible\\:ring-ring.focus-visible\\:ring-offset-2.disabled\\:pointer-events-none.disabled\\:opacity-50.bg-primary.text-primary-foreground.shadow-md.hover\\:bg-primary\\/90.h-8.px-4.py-2');

// Check if the textarea and the button exist
if (textarea && button) {
    let text = 'Hello, can you understand me?';
    let charArray = text.split('');
    let delay = 50; // adjust this value to change the typing speed

    // Focus the textarea
    textarea.focus();

    charArray.forEach((char, index) => {
        setTimeout(() => {
            let event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: char.charCodeAt(0) });
            textarea.dispatchEvent(event);
            textarea.value += char;
        }, index * delay);
    });

    // Simulate the user pressing the Enter key
    setTimeout(() => {
        let event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 13 });
        textarea.dispatchEvent(event);
    }, charArray.length * delay);
} else {
    console.log('Textarea or button not found');
}

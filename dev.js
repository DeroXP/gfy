// Select the textarea element by its ID
let textarea = document.getElementById('chat-input-box');

// Select the button element using its class name
let button = document.querySelector('.inline-flex.items-center.justify-center.rounded-md.text-sm.font-medium.ring-offset-background.transition-colors.focus-visible\\:outline-none.focus-visible\\:ring-2.focus-visible\\:ring-ring.focus-visible\\:ring-offset-2.disabled\\:pointer-events-none.disabled\\:opacity-50.bg-primary.text-primary-foreground.shadow-md.hover\\:bg-primary\\/90.h-8.px-4.py-2');

// Check if the textarea and the button exist
if (textarea && button) {
    // Set the value of the textarea
    textarea.value = 'Hello, can you understand me?';

    // Simulate a button click
    button.click();
} else {
    console.log('Textarea or button not found');
}

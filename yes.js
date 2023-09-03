// Create a div element to hold the extension list
const extensionList = document.createElement('div');
extensionList.style.width = '300px';
extensionList.style.padding = '10px';
document.body.appendChild(extensionList);

// Fetch a list of installed extensions
chrome.management.getAll(function(extensions) {
  extensions.forEach(function(extension) {
    if (extension.type === 'extension') {
      // Create a div for each extension
      const extensionDiv = document.createElement('div');
      extensionDiv.className = 'extensionItem';

      // Create an image element for the extension icon
      const extensionIcon = document.createElement('img');
      extensionIcon.src = extension.icons[0].url;
      extensionIcon.style.width = '24px';
      extensionIcon.style.height = '24px';

      // Create a span for the extension name
      const extensionName = document.createElement('span');
      extensionName.textContent = extension.name;
      extensionName.style.marginLeft = '10px';

      // Create a checkbox to enable/disable the extension
      const extensionSwitch = document.createElement('input');
      extensionSwitch.type = 'checkbox';
      extensionSwitch.checked = extension.enabled;

      // Add an event listener to toggle the extension on/off
      extensionSwitch.addEventListener('change', function() {
        chrome.management.setEnabled(extension.id, extensionSwitch.checked, function() {
          if (extensionSwitch.checked) {
            console.log(`Enabled extension: ${extension.name}`);
          } else {
            console.log(`Disabled extension: ${extension.name}`);
          }
        });
      });

      // Append the elements to the extensionDiv
      extensionDiv.appendChild(extensionIcon);
      extensionDiv.appendChild(extensionName);
      extensionDiv.appendChild(extensionSwitch);

      // Append the extensionDiv to the extensionList
      extensionList.appendChild(extensionDiv);
    }
  });
});

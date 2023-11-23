function convertImageToColor(imgElement, hexColor) {
  // Convert hex to RGB
  function hexToRgb(hex) {
    const bigint = parseInt(hex.substring(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b];
  }

  const color = hexToRgb(hexColor);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = imgElement.width;
  canvas.height = imgElement.height;

  ctx.drawImage(imgElement, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // If the pixel is not transparent
    if (data[i + 3] > 0) {
      data[i]     = color[0]; // Red
      data[i + 1] = color[1]; // Green
      data[i + 2] = color[2]; // Blue
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Replace the original image's src with the canvas data
  imgElement.src = canvas.toDataURL();
}

function updateSkillIconColors(isDarkTheme) {
    const hexColor = isDarkTheme ? "#F5F5F5" : "#171717";

    const skillImages = document.querySelectorAll('img[id^="skill_img_"]');
    skillImages.forEach((img) => {
        // If images are already loaded:
        if (img.complete) convertImageToColor(img, hexColor);
    });
}

// Initially color the images based on the current theme
updateSkillIconColors(document.documentElement.classList.contains('dark'));

// When DOM is loaded
document.addEventListener('DOMContentLoaded', function() {

  var themeToggleButton = document.getElementById("themeToggle");

  // Theme toggle logic
  themeToggleButton.addEventListener("click", function() {

    let themeIsDark = localStorage.theme === 'dark';
    document.documentElement.classList.add('no-transition');

    if (themeIsDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      themeToggleButton.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      themeToggleButton.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }

    // Emit custom event after theme switch
    const themeChangedEvent = new CustomEvent('themeChanged', { detail: { isDark: themeIsDark } });
    document.dispatchEvent(themeChangedEvent);

    setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
    }, 150);
  });

  // Open the modal
  document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-identifier')) {
      const modalId = event.target.getAttribute('data-modal-id');
      if (modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.body.style.overflowY = 'hidden';
        document.body.style.borderRight = `${scrollbarWidth}px solid transparent`;
      }
    }
    if (event.target.closest('.modal-identifier')) {
      const modalId = event.target.closest('.modal-identifier').getAttribute('data-modal-id');
      if (modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.body.style.overflowY = 'hidden';
        document.body.style.borderRight = `${scrollbarWidth}px solid transparent`;
      }
    }
  });

  // Close the modal when clicking the button
  document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-close-btn')) {
      const modalCloseId = event.target.getAttribute('data-modal-close-id');
      if (modalCloseId) {
        document.getElementById(modalCloseId).style.display = 'none';
        document.body.style.overflowY = 'scroll';
        document.body.style.borderRight = '';
      }
    }
  });

  // Close the modal when clicking outside of the content
  window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
      document.body.style.overflowY = 'scroll';
      document.body.style.borderRight = '';
    }
  });

  // Switch between posts and their translation
  document.body.addEventListener('click', function(event) {
    if (event.target.classList.contains('translate-btn')) {
      const iframeId = event.target.getAttribute('iframe_recognition_id');
          
      if (iframeId) {
        const translationContainer = document.getElementById('translation_' + iframeId);
              
        // Toggle visibility of the iframes
        if (translationContainer.style.display === 'block') {
          translationContainer.style.display = 'none';
          event.target.textContent = 'Show Translation'; // Update button label
        } else {
          translationContainer.style.display = 'block';
          event.target.textContent = 'Show Original'; // Update button label
        }
      }
    }
  });
});

// Set up the event listener for theme changes
document.addEventListener('themeChanged', function(e) {
  updateSkillIconColors(e.detail.isDark);
});

document.addEventListener('DOMContentLoaded', function () {
  const textarea = document.getElementById('clipboardContent');
  const imagePreview = document.getElementById('imagePreview');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const status = document.getElementById('status');
  const historyWindow = document.getElementById('historyWindow');
  const historyList = document.getElementById('historyList');

  // Handle paste event for both text and images
  textarea.addEventListener('paste', function (event) {
      event.preventDefault(); // Prevent default paste
      const items = (event.clipboardData || event.originalEvent.clipboardData).items;
      let hasImage = false;

      for (const item of items) {
          if (item.type.indexOf('image') !== -1) {
              const blob = item.getAsFile();
              const reader = new FileReader();
              reader.onload = function (event) {
                  imagePreview.src = event.target.result;
                  imagePreview.style.display = 'block';
                  imagePreviewContainer.style.display = 'block';
                  textarea.style.display = 'none';
                  status.textContent = '🖼️ Image pasted!';
              };
              reader.readAsDataURL(blob);
              hasImage = true;
              break;
          } else if (item.type === 'text/plain') {
              item.getAsString(function (text) {
                  textarea.value = text;
                  imagePreview.style.display = 'none';
                  imagePreviewContainer.style.display = 'none';
                  textarea.style.display = 'block';
                  status.textContent = '📝 Text pasted!';
              });
          }
      }

      // If no image or text/plain found, try getting text from clipboardData
      if (!hasImage && items.length === 0) {
          const text = event.clipboardData.getData('text');
          if (text) {
              textarea.value = text;
              imagePreview.style.display = 'none';
              imagePreviewContainer.style.display = 'none';
              textarea.style.display = 'block';
              status.textContent = '📝 Text pasted!';
          }
      }
  });

  // Copy to clipboard
  window.copyToClipboard = function () {
      // Force checking textarea first
      const content = textarea.value.trim();
      const imageSrc = imagePreview.style.display !== 'none' ? imagePreview.src : null;
      
      let type, data;
      if (content) {
          type = 'text';
          data = content;
      } else if (imageSrc || imageSrc !== '#') {
          type = 'image';
          data = imageSrc;
      } else {
          status.textContent = '❌ No content to copy!';
          return;
      }

      fetch('/copy', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `content=${encodeURIComponent(data)}&type=${type}`,
      })
          .then(response => response.text())
          .then(message => {
              status.textContent = message;
          })
          .catch(error => {
              status.textContent = '❌ Failed to copy content';
          });
  };

  // Paste from clipboard
  window.pasteFromClipboard = function () {
      fetch('/paste')
          .then(response => response.json())
          .then(data => {
              if (data.type === 'image') {
                  imagePreview.src = data.content;
                  imagePreview.style.display = 'block';
                  imagePreviewContainer.style.display = 'block';
                  textarea.style.display = 'none';
              } else {
                  textarea.value = data.content;
                  imagePreview.style.display = 'none';
                  imagePreviewContainer.style.display = 'none';
                  textarea.style.display = 'block';
              }
              status.textContent = '✅ Content pasted!';
          })
          .catch(error => {
              status.textContent = '❌ Failed to paste content';
          });
  };

  // Open history window
  window.openHistoryWindow = function () {
      fetch('/history')
          .then(response => response.json())
          .then(data => {
              historyList.innerHTML = '';
              data.forEach(entry => {
                  const li = document.createElement('li');
                  li.className = `history-item ${entry.type}`;
                  
                  if (entry.type === 'image') {
                      li.innerHTML = `
                          <img src="${entry.content}" alt="Clipboard Image" style="max-width: 100%; border-radius: 8px;">
                          <div class="buttons">
                              <button class="copy" onclick="copyFromHistory('${entry.content}', 'image')">Copy</button>
                              <button class="delete" onclick="deleteHistoryEntry(${entry.id})">Delete</button>
                          </div>
                      `;
                  } else {
                      const textContent = entry.content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                      li.innerHTML = `
                          <pre class="text-content">${textContent}</pre>
                          <div class="buttons">
                              <button class="copy" onclick="copyFromHistory(${JSON.stringify(entry.content)}, 'text')">Copy</button>
                              <button class="delete" onclick="deleteHistoryEntry(${entry.id})">Delete</button>
                          </div>
                      `;
                  }
                  historyList.appendChild(li);
              });
              historyWindow.style.display = 'block';
          })
          .catch(error => {
              status.textContent = '❌ Failed to fetch history';
          });
  };

  // Close history window
  window.closeHistoryWindow = function () {
      historyWindow.style.display = 'none';
  };

  // Clear content
  window.clearContent = function () {
      textarea.value = '';
      imagePreview.src = '#';
      imagePreview.style.display = 'none';
      imagePreviewContainer.style.display = 'none';
      textarea.style.display = 'block';
      status.textContent = '🧹 Content cleared!';
  };

  // Delete history entry
  window.deleteHistoryEntry = function (id) {
      if (!id) {
          console.error('Invalid ID');
          status.textContent = '❌ Invalid entry ID';
          return;
      }

      fetch(`/delete?id=${id}`, {
          method: 'DELETE',
      })
          .then(response => response.text())
          .then(message => {
              status.textContent = message;
              openHistoryWindow(); // Refresh history
          })
          .catch(error => {
              status.textContent = '❌ Failed to delete entry';
          });
  };

  // Copy from history
  window.copyFromHistory = function (content, type) {
      if (type === 'image') {
          // Copy image to clipboard
          fetch(content)
              .then(response => response.blob())
              .then(blob => {
                  const item = new ClipboardItem({ [blob.type]: blob });
                  navigator.clipboard.write([item]);
                  status.textContent = '✅ Image copied to clipboard!';
              })
              .catch(error => {
                  status.textContent = '❌ Failed to copy image';
              });
      } else {
          // Copy text to clipboard
          navigator.clipboard.writeText(content)
              .then(() => {
                  status.textContent = '✅ Text copied to clipboard!';
              })
              .catch(error => {
                  status.textContent = '❌ Failed to copy text';
              });
      }
  };
});
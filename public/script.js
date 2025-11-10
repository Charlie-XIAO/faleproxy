document.addEventListener("DOMContentLoaded", () => {
  const urlForm = document.getElementById("url-form");
  const urlInput = document.getElementById("url-input");
  const loadingElement = document.getElementById("loading");
  const errorMessage = document.getElementById("error-message");
  const resultContainer = document.getElementById("result-container");
  const contentDisplay = document.getElementById("content-display");
  const originalUrlElement = document.getElementById("original-url");
  const pageTitleElement = document.getElementById("page-title");

  urlForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const url = urlInput.value.trim();

    if (!url) {
      showError("Please enter a valid URL");
      return;
    }

    // Show loading indicator
    loadingElement.classList.remove("hidden");
    resultContainer.classList.add("hidden");
    errorMessage.classList.add("hidden");

    try {
      const response = await fetch("/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch content");
      }

      // Update the info bar
      originalUrlElement.textContent = url;
      originalUrlElement.href = url;
      pageTitleElement.textContent = data.title || "No title";

      // Create a sandboxed iframe to display the content
      const iframe = document.createElement("iframe");
      iframe.sandbox = "allow-same-origin allow-scripts";
      contentDisplay.innerHTML = "";
      contentDisplay.appendChild(iframe);

      // Write the modified HTML to the iframe
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;
      iframeDocument.open();
      iframeDocument.write(data.content);
      iframeDocument.close();

      // Adjust iframe height to match content
      iframe.onload = function () {
        iframe.style.height = iframeDocument.body.scrollHeight + "px";

        // Make sure links open in a new tab
        const links = iframeDocument.querySelectorAll("a");
        links.forEach((link) => {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        });
      };

      // Show result container
      resultContainer.classList.remove("hidden");
    } catch (error) {
      showError(error.message);
    } finally {
      // Hide loading indicator
      loadingElement.classList.add("hidden");
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
  }
});

document.addEventListener("astro:page-load", () => {
  const form = document.getElementById("contact-form");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");
  const submitBtn = document.getElementById("submit-btn");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "sending...";

    const formData = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/mkgdvrgw", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        toast.className =
          "fixed top-4 right-4 bg-green-600 px-6 py-3 rounded-lg shadow-lg transform translate-x-0 transition-transform duration-300 z-50";
        toastMessage.textContent = "✓ Message sent successfully!";
        form.reset();
      } else {
        toast.className =
          "fixed top-4 right-4 bg-red-600 px-6 py-3 rounded-lg shadow-lg transform translate-x-0 transition-transform duration-300 z-50";
        toastMessage.textContent =
          "✗ Error sending message. Please try again.";
      }
    } catch {
      toast.className =
        "fixed top-4 right-4 bg-red-600 px-6 py-3 rounded-lg shadow-lg transform translate-x-0 transition-transform duration-300 z-50";
      toastMessage.textContent = "✗ Error sending message. Please try again.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;

      setTimeout(() => {
        toast.className =
          "fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform translate-x-[400px] transition-transform duration-300 z-50";
      }, 3000);
    }
  });
});

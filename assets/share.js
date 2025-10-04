class ShareButton extends HTMLElement {
  constructor() {
    super();
    this.mainButton = this.querySelector('.share-button');
    this.shareUrl = this.dataset.shareUrl || window.location.href;
    this.shareTitle = this.dataset.shareTitle || document.title;
    this.shareText = this.dataset.shareText || '';
    
    if (this.mainButton) {
      this.mainButton.addEventListener('click', this.handleShare.bind(this));
    }

    this.initializeShareOptions();
  }

  initializeShareOptions() {
    const shareOptions = this.querySelectorAll('.share-option');
    shareOptions.forEach(option => {
      option.addEventListener('click', this.handleShareOption.bind(this));
    });
  }

  async handleShare(event) {
    event.preventDefault();
    
    // Check if Web Share API is supported
    if (navigator.share && this.isWebShareSupported()) {
      try {
        await navigator.share({
          title: this.shareTitle,
          text: this.shareText,
          url: this.shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.warn('Web Share API failed, falling back to copy URL:', error);
          this.fallbackCopyUrl();
        }
      }
    } else {
      // Fallback: show share options or copy URL
      this.showShareOptions();
    }
  }

  handleShareOption(event) {
    event.preventDefault();
    const option = event.currentTarget;
    const platform = option.dataset.platform;
    
    if (platform === 'copy') {
      this.copyToClipboard();
      return;
    }

    const shareUrls = this.getShareUrls();
    const url = shareUrls[platform];
    
    if (url) {
      this.openShareWindow(url);
    }
  }

  getShareUrls() {
    const encodedUrl = encodeURIComponent(this.shareUrl);
    const encodedTitle = encodeURIComponent(this.shareTitle);
    const encodedText = encodeURIComponent(this.shareText);
    
    return {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`,
      sms: `sms:?body=${encodedTitle}%20${encodedUrl}`
    };
  }

  openShareWindow(url) {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2 + window.screenX;
    const top = (window.innerHeight - height) / 2 + window.screenY;
    
    window.open(
      url,
      'share-window',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  }

  async copyToClipboard() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(this.shareUrl);
      } else {
        // Fallback for older browsers
        this.fallbackCopyUrl();
      }
      this.showCopyFeedback();
    } catch (error) {
      console.warn('Failed to copy to clipboard:', error);
      this.fallbackCopyUrl();
    }
  }

  fallbackCopyUrl() {
    const textArea = document.createElement('textarea');
    textArea.value = this.shareUrl;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      this.showCopyFeedback();
    } catch (error) {
      console.warn('Fallback copy failed:', error);
      this.showCopyFeedback('Failed to copy URL');
    } finally {
      document.body.removeChild(textArea);
    }
  }

  showCopyFeedback(message = 'URL copied to clipboard!') {
    // Find or create feedback element
    let feedback = this.querySelector('.share-feedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.className = 'share-feedback';
      this.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.classList.add('show');
    
    // Hide feedback after 2 seconds
    setTimeout(() => {
      feedback.classList.remove('show');
    }, 2000);
  }

  showShareOptions() {
    const dropdown = this.querySelector('.share-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('show');
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (event) => {
        if (!this.contains(event.target)) {
          dropdown.classList.remove('show');
        }
      }, { once: true });
    } else {
      // If no dropdown, just copy the URL
      this.copyToClipboard();
    }
  }

  isWebShareSupported() {
    return navigator.share && 
           navigator.canShare && 
           navigator.canShare({
             title: this.shareTitle,
             text: this.shareText,
             url: this.shareUrl
           });
  }
}

// Helper function to create share buttons programmatically
function createShareButton(options = {}) {
  const shareButton = document.createElement('share-button');
  shareButton.dataset.shareUrl = options.url || window.location.href;
  shareButton.dataset.shareTitle = options.title || document.title;
  shareButton.dataset.shareText = options.text || '';
  
  const platforms = options.platforms || ['facebook', 'twitter', 'copy'];
  
  shareButton.innerHTML = `
    <button class="share-button" aria-label="Share this page">
      <svg class="icon icon-share" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.625 8.125V10.2917C1.625 10.579 1.73914 10.8545 1.9424 11.0578C2.14565 11.2611 2.42119 11.375 2.70833 11.375H10.2917C10.579 11.375 10.8545 11.2611 11.0578 11.0578C11.2611 10.8545 11.375 10.579 11.375 10.2917V8.125" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.5 1.625V8.125" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M4.33333 3.79167L6.5 1.625L8.66667 3.79167" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Share
    </button>
    <div class="share-dropdown">
      ${platforms.map(platform => {
        const labels = {
          facebook: 'Facebook',
          twitter: 'Twitter',
          pinterest: 'Pinterest',
          linkedin: 'LinkedIn',
          whatsapp: 'WhatsApp',
          telegram: 'Telegram',
          email: 'Email',
          sms: 'SMS',
          copy: 'Copy URL'
        };
        
        return `
          <button class="share-option" data-platform="${platform}">
            ${labels[platform] || platform}
          </button>
        `;
      }).join('')}
    </div>
  `;
  
  return shareButton;
}

customElements.define('share-button', ShareButton);

// Auto-initialize share buttons on page load
document.addEventListener('DOMContentLoaded', () => {
  const shareButtons = document.querySelectorAll('share-button');
  shareButtons.forEach(button => {
    if (!button.initialized) {
      button.initialized = true;
    }
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ShareButton, createShareButton };
}
/* ==========================================================================
   Raigon Arts Management System - Owner & Shop Settings View
   ========================================================================== */

class SettingsView {
  constructor() {
    this.container = document.getElementById('settingsView');
  }

  render() {
    const currentLogo = window.RaigonStorage ? window.RaigonStorage.getCustomLogo() : 'assets/images/img2.png';

    this.container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Shop Settings</h1>
          <p class="page-subtitle">Configure business profile, workshop details, and security credentials</p>
        </div>
        <button class="btn btn-primary" onclick="window.RaigonToast.show('Shop settings saved successfully!', 'success')">
          <i class="fa-solid fa-floppy-disk"></i> Save All Changes
        </button>
      </div>

      <div class="form-grid">
        <!-- BUSINESS PROFILE & BRANDING (FULL WIDTH) -->
        <div class="col-12">
          
          <!-- SECTION 1: BUSINESS PROFILE & BRANDING -->
          <div class="table-card" style="padding: 24px;">
            <h3 class="form-section-header" style="margin-top: 0;">
              <i class="fa-solid fa-building"></i> Business & Workshop Profile
            </h3>
            
            <div class="settings-logo-banner">
              
              <!-- LEFT SIDE: LOGO + INFO -->
              <div style="display: flex; align-items: center; gap: 20px; flex: 1; min-width: 280px;">
                <div style="position: relative; width: 84px; height: 84px; flex-shrink: 0; cursor: pointer;"
                  onclick="document.getElementById('shopLogoFileInput').click()" title="Click to upload new logo">
                  <div style="width: 100%; height: 100%; border-radius: 18px; overflow: hidden; border: 1.5px solid rgba(115, 103, 240, 0.35); box-shadow: 0 8px 24px -4px rgba(115, 103, 240, 0.25); background: #FFFFFF; display: flex; align-items: center; justify-content: center;">
                    <img id="shopLogoPreview" src="${currentLogo}" alt="Shop Logo" style="width: 100%; height: 100%; object-fit: cover;">
                  </div>
                  <div style="position: absolute; bottom: -4px; right: -4px; width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #7367F0 0%, #6358E1 100%); color: #FFFFFF; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 4px 10px rgba(115, 103, 240, 0.4); border: 2.5px solid #FFFFFF;">
                    <i class="fa-solid fa-camera"></i>
                  </div>
                </div>

                <div>
                  <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                    <h4 style="font-size: 16.5px; font-weight: 700; color: var(--text-primary); margin: 0;">Workshop Brand Logo</h4>
                    <span class="badge" style="background: rgba(115,103,240,0.12); color: #7367F0; font-weight: 600; font-size: 11px; padding: 2px 8px; border-radius: 6px;">PNG, JPG, WEBP</span>
                  </div>
                  <p class="text-xs text-muted" style="margin: 0; line-height: 1.5; max-width: 480px;">Upload your high-res shop logo for invoices, framing job slips, customer receipts, and workshop headers.</p>
                </div>
              </div>

              <!-- RIGHT SIDE: BUTTON ACTIONS -->
              <div style="display: flex; align-items: center; gap: 12px;">
                <button type="button" class="btn btn-primary" onclick="document.getElementById('shopLogoFileInput').click()" style="padding: 10px 18px; font-weight: 600;">
                  <i class="fa-solid fa-cloud-arrow-up"></i> Upload New Logo
                </button>
                <button type="button" class="btn btn-secondary" onclick="window.RaigonSettingsView.resetLogo()" style="padding: 10px 16px; font-weight: 600;">
                  <i class="fa-solid fa-rotate-left"></i> Reset Default
                </button>
                <input type="file" id="shopLogoFileInput" accept="image/*" style="display: none;" onchange="window.RaigonSettingsView.handleLogoUpload(event)">
              </div>

            </div>

            <div class="form-grid">
              <div class="col-6 form-group">
                <label class="form-label">Business Name <span class="required">*</span></label>
                <input type="text" class="form-input" value="Raigon Arts">
              </div>

              <div class="col-6 form-group">
                <label class="form-label">Business Phone <span class="required">*</span></label>
                <input type="text" class="form-input" value="+91 8921348433">
              </div>

              <div class="col-12 form-group">
                <label class="form-label">Business Email Address <span class="required">*</span></label>
                <input type="email" class="form-input" value="orders@raigonarts.com">
              </div>

              <div class="col-12 form-group">
                <label class="form-label">Physical Workshop Address <span class="required">*</span></label>
                <textarea class="form-textarea" rows="3">Main Workshop, MG Road, Overbridge Junction, Trivandrum, Kerala - 695001</textarea>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  handleLogoUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      window.RaigonToast.show('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      window.RaigonStorage.setCustomLogo(dataUrl);
      if (window.RaigonApp) window.RaigonApp.applyCustomLogo();
      const previewEl = document.getElementById('shopLogoPreview');
      if (previewEl) previewEl.src = dataUrl;
      window.RaigonToast.show('Workshop brand logo updated successfully!', 'success');
    };
    reader.readAsDataURL(file);
  }

  resetLogo() {
    window.RaigonStorage.removeCustomLogo();
    if (window.RaigonApp) window.RaigonApp.applyCustomLogo();
    const previewEl = document.getElementById('shopLogoPreview');
    if (previewEl) previewEl.src = 'assets/images/img2.png';
    window.RaigonToast.show('Brand logo reset to default.', 'info');
  }
}

window.RaigonSettingsView = new SettingsView();

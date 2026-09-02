/* ==========================================================================
   Vuexy Custom Datepicker / Calendar Popover Component
   ========================================================================== */

class VuexyDatepicker {
  constructor() {
    this.activeInput = null;
    this.popover = null;
    this.currentDate = new Date();
    this.selectedDate = null;
    this.init();
  }

  init() {
    this.createPopover();
    document.addEventListener('click', (e) => this.handleOutsideClick(e));
    window.addEventListener('resize', () => this.positionPopover());
    window.addEventListener('scroll', () => this.positionPopover(), true);

    // Observer to enhance any dynamically rendered date inputs
    const observer = new MutationObserver(() => this.enhanceAll());
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Initial run
    setTimeout(() => this.enhanceAll(), 100);
  }

  createPopover() {
    if (document.getElementById('vuexyCalendarPopover')) return;

    const popover = document.createElement('div');
    popover.id = 'vuexyCalendarPopover';
    popover.className = 'vuexy-calendar-popover';
    popover.innerHTML = `
      <div class="calendar-header">
        <button type="button" class="cal-nav-btn" id="calPrevMonth" title="Previous Month">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <div class="cal-title" id="calMonthYearTitle">September 2026</div>
        <button type="button" class="cal-nav-btn" id="calNextMonth" title="Next Month">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      <div class="calendar-weekdays">
        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
      </div>

      <div class="calendar-days-grid" id="calDaysGrid"></div>

      <div class="calendar-presets">
        <button type="button" class="cal-preset-btn" data-days="0">Today</button>
        <button type="button" class="cal-preset-btn" data-days="1">Tomorrow</button>
        <button type="button" class="cal-preset-btn" data-days="3">+3 Days</button>
        <button type="button" class="cal-preset-btn" data-days="7">+7 Days</button>
      </div>
    `;

    document.body.appendChild(popover);
    this.popover = popover;

    // Attach listeners
    document.getElementById('calPrevMonth').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderDays();
    });

    document.getElementById('calNextMonth').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderDays();
    });

    popover.querySelectorAll('.cal-preset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const daysToAdd = parseInt(btn.getAttribute('data-days'), 10);
        const d = new Date();
        d.setDate(d.getDate() + daysToAdd);
        this.selectDate(d);
      });
    });
  }

  enhanceAll(container = document) {
    const selector = 'input[type="date"]:not([data-vuexy-datepicker-init="true"]), input.datepicker-field:not([data-vuexy-datepicker-init="true"])';
    const inputs = container.querySelectorAll(selector);

    inputs.forEach(input => {
      input.setAttribute('data-vuexy-datepicker-init', 'true');
      
      // If native date input, switch type to text so OS datepicker is hidden
      if (input.type === 'date') {
        input.type = 'text';
      }

      input.setAttribute('readonly', 'true');
      input.classList.add('datepicker-enhanced');

      // Wrap input with calendar icon container if not already wrapped
      if (!input.parentElement.classList.contains('datepicker-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'datepicker-wrapper';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const calIcon = document.createElement('i');
        calIcon.className = 'fa-regular fa-calendar-days datepicker-icon';
        wrapper.appendChild(calIcon);

        calIcon.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openForInput(input);
        });
      }

      input.addEventListener('focus', (e) => {
        e.stopPropagation();
        this.openForInput(input);
      });

      input.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openForInput(input);
      });
    });
  }

  openForInput(input) {
    this.activeInput = input;

    // Parse existing date (supports DD-MM-YYYY, YYYY-MM-DD, etc.)
    const val = input.value.trim();
    const parsedDate = this.parseDateString(val);
    this.selectedDate = parsedDate;
    this.currentDate = new Date(parsedDate.getTime());

    this.renderDays();
    this.positionPopover();
    this.popover.classList.add('active');
  }

  parseDateString(val) {
    if (!val) return new Date();
    if (val.includes('-')) {
      const parts = val.split('-');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        } else if (parts[2].length === 4) {
          // DD-MM-YYYY
          return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        }
      }
    } else if (val.includes('/')) {
      const parts = val.split('/');
      if (parts.length === 3) {
        if (parts[2].length === 4) {
          // DD/MM/YYYY
          return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
        }
      }
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  positionPopover() {
    if (!this.activeInput || !this.popover || !this.popover.classList.contains('active')) return;

    const rect = this.activeInput.getBoundingClientRect();
    const popoverHeight = 340;
    const viewportHeight = window.innerHeight;

    let top = rect.bottom + window.scrollY + 6;
    if (rect.bottom + popoverHeight > viewportHeight && rect.top - popoverHeight > 0) {
      top = rect.top + window.scrollY - popoverHeight - 6;
    }

    let left = rect.left + window.scrollX;
    if (left + 310 > window.innerWidth) {
      left = window.innerWidth - 320;
    }

    this.popover.style.top = `${top}px`;
    this.popover.style.left = `${left}px`;
  }

  renderDays() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    document.getElementById('calMonthYearTitle').textContent = `${monthNames[month]} ${year}`;

    const daysGrid = document.getElementById('calDaysGrid');
    daysGrid.innerHTML = '';

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Previous month padding days
    for (let i = firstDayIndex; i > 0; i--) {
      const d = document.createElement('div');
      d.className = 'cal-day other-month';
      d.textContent = prevMonthDays - i + 1;
      daysGrid.appendChild(d);
    }

    const today = new Date();

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const d = document.createElement('div');
      d.className = 'cal-day';
      d.textContent = day;

      const thisDate = new Date(year, month, day);

      if (
        thisDate.getFullYear() === today.getFullYear() &&
        thisDate.getMonth() === today.getMonth() &&
        thisDate.getDate() === today.getDate()
      ) {
        d.classList.add('today');
      }

      if (
        this.selectedDate &&
        thisDate.getFullYear() === this.selectedDate.getFullYear() &&
        thisDate.getMonth() === this.selectedDate.getMonth() &&
        thisDate.getDate() === this.selectedDate.getDate()
      ) {
        d.classList.add('selected');
      }

      d.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.selectDate(thisDate);
      });

      daysGrid.appendChild(d);
    }

    // Next month padding days
    const totalCells = firstDayIndex + totalDays;
    const remaining = 42 - totalCells; // 6 rows grid
    for (let i = 1; i <= (remaining < 7 ? remaining : remaining - 7); i++) {
      const d = document.createElement('div');
      d.className = 'cal-day other-month';
      d.textContent = i;
      daysGrid.appendChild(d);
    }
  }

  selectDate(dateObj) {
    if (!this.activeInput) return;

    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const formattedDate = `${dd}-${mm}-${yyyy}`;

    this.activeInput.value = formattedDate;

    // Trigger change event so any listeners (like forms) update
    this.activeInput.dispatchEvent(new Event('change', { bubbles: true }));
    this.activeInput.dispatchEvent(new Event('input', { bubbles: true }));

    this.closePopover();
  }

  closePopover() {
    if (this.popover) {
      this.popover.classList.remove('active');
    }
    this.activeInput = null;
  }

  handleOutsideClick(e) {
    if (!this.popover || !this.popover.classList.contains('active')) return;
    if (
      this.popover.contains(e.target) ||
      (this.activeInput && this.activeInput.contains(e.target)) ||
      (e.target.classList && e.target.classList.contains('datepicker-icon'))
    ) {
      return;
    }
    this.closePopover();
  }
}

// Global Instance
window.RaigonDatepicker = new VuexyDatepicker();

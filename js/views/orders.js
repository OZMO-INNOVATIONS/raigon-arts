/* ==========================================================================
   Raigon Arts Management System - Order Management View
   ========================================================================== */

class OrdersView {
  constructor() {
    this.container = document.getElementById('ordersView');
    this.currentTab = 'All';
    this.searchQuery = '';
  }

  render() {
    const customers = window.RaigonStorage.getCustomers();
    const filtered = customers.filter(c => {
      const matchTab = this.currentTab === 'All' || c.orderStatus === this.currentTab;
      const matchSearch = !this.searchQuery || 
        c.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        c.phone.includes(this.searchQuery);
      return matchTab && matchSearch;
    });

    this.container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Order Management</h1>
          <p class="page-subtitle">Track, update and manage wholesale & retail custom frame orders</p>
        </div>
        <button class="btn btn-primary" onclick="window.RaigonCustomersView.openCustomerModal()">
          <i class="fa-solid fa-user-plus"></i> Add New Customer
        </button>
      </div>

      <!-- Filter Tabs -->
      <div class="filter-tabs">
        ${['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'].map(tab => `
          <button class="tab-btn ${this.currentTab === tab ? 'active' : ''}" onclick="window.RaigonOrdersView.setTab('${tab}')">
            ${tab} ${tab === 'All' ? `(${customers.length})` : `(${customers.filter(c => c.orderStatus === tab).length})`}
          </button>
        `).join('')}
      </div>

      <!-- Orders Data Table Card -->
      <div class="table-card">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <div class="table-search">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="Search order ID, customer name..." value="${this.searchQuery}" oninput="window.RaigonOrdersView.handleSearch(this.value)">
            </div>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 110px;">Order ID</th>
                <th style="width: 160px;">Customer</th>
                <th style="width: 130px;">Phone</th>
                <th style="width: 100px;">Photos</th>
                <th style="width: 160px;">Frame Specs</th>
                <th style="width: 70px;">Qty</th>
                <th style="width: 130px;">Total Amount</th>
                <th style="width: 110px;">Payment</th>
                <th style="width: 140px;">Order Status</th>
                <th style="width: 130px;">Delivery Date</th>
                <th style="width: 100px; text-align: center;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="11" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    No orders found matching tab filter "${this.currentTab}".
                  </td>
                </tr>
              ` : filtered.map(ord => `
                <tr>
                  <td class="font-bold text-primary">${ord.id}</td>
                  <td class="font-semibold">${ord.name}</td>
                  <td>${ord.phone}</td>
                  <td>${ord.photos ? ord.photos.length : 0} Photos</td>
                  <td>
                    <div class="font-medium">${ord.frameSize}</div>
                    <div class="text-xs text-muted">${ord.frameType}</div>
                  </td>
                  <td class="font-bold">${ord.quantity}</td>
                  <td class="font-bold">₹${Number(ord.totalAmount).toLocaleString('en-IN')}</td>
                  <td>
                    <span class="badge ${ord.paymentStatus === 'Paid' ? 'badge-completed' : (ord.paymentStatus === 'Partial' ? 'badge-pending' : 'badge-cancelled')}">
                      ${ord.paymentStatus}
                    </span>
                  </td>
                  <td>${this.getStatusSelect(ord.id, ord.orderStatus)}</td>
                  <td class="text-sm">${ord.deliveryDate || 'TBD'}</td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn" title="View Order Details" onclick="window.RaigonCustomersView.viewCustomer('${ord.id}')">
                        <i class="fa-solid fa-eye"></i>
                      </button>
                      <button class="action-btn" style="color: #25D366; background: rgba(37, 211, 102, 0.12);" title="Send WhatsApp Order Receipt" onclick="window.RaigonCustomersView.sendWhatsAppReceipt('${ord.id}')">
                        <i class="fa-brands fa-whatsapp"></i>
                      </button>
                      <button class="action-btn edit" title="Edit Order" onclick="window.RaigonCustomersView.editCustomer('${ord.id}')">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
    if (window.RaigonSelect2) {
      window.RaigonSelect2.enhanceAll(this.container);
    }
  }

  getStatusSelect(id, currentStatus) {
    const statuses = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
    const badgeClassMap = {
      'Pending': 'status-badge-pending',
      'In Progress': 'status-badge-progress',
      'Completed': 'status-badge-completed',
      'Cancelled': 'status-badge-cancelled'
    };
    const currentClass = badgeClassMap[currentStatus] || 'status-badge-pending';

    return `
      <select class="status-select-badge ${currentClass}" onchange="window.RaigonOrdersView.updateOrderStatus('${id}', this.value)">
        ${statuses.map(st => `<option value="${st}" ${st === currentStatus ? 'selected' : ''}>${st}</option>`).join('')}
      </select>
    `;
  }

  setTab(tab) {
    this.currentTab = tab;
    this.render();
  }

  handleSearch(val) {
    this.searchQuery = val;
    this.render();
  }

  updateOrderStatus(id, newStatus) {
    const cust = window.RaigonStorage.getCustomerById(id);
    if (cust) {
      cust.orderStatus = newStatus;
      window.RaigonStorage.saveCustomer(cust);
      window.RaigonToast.show(`Order ${id} status updated to "${newStatus}"`, 'success');
      this.render();
      window.RaigonDashboardView.render();
    }
  }
}

window.RaigonOrdersView = new OrdersView();

/* ==========================================================================
   Raigon Arts Management System - Dashboard View Handler
   ========================================================================== */

class DashboardView {
  constructor() {
    this.container = document.getElementById('dashboardView');
  }

  render() {
    const stats = window.RaigonStorage.getDashboardStats();
    const customers = window.RaigonStorage.getCustomers();
    const recentCustomers = customers.slice(0, 5);

    this.container.innerHTML = `
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard Overview</h1>
          <p class="page-subtitle">Welcome back, Raigon Arts Workshop Manager</p>
        </div>
        <div class="flex gap-3">
          <button class="btn btn-primary" onclick="window.RaigonCustomersView.openCustomerModal()">
            <i class="fa-solid fa-user-plus"></i> Add New Customer
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="metrics-grid">
        <!-- Card 1: Total Frame Orders -->
        <div class="metric-card metric-card-primary">
          <div class="metric-card-body">
            <div class="metric-info">
              <span class="metric-label">Total Frame Orders</span>
              <h3 class="metric-value">${stats.totalOrders}</h3>
            </div>
            <div class="metric-icon-box icon-primary">
              <i class="fa-solid fa-boxes-packing"></i>
            </div>
          </div>
          <div class="metric-card-footer">
            <span class="trend-pill trend-primary"><i class="fa-solid fa-arrow-up"></i> +12%</span>
            <span class="trend-subtext">vs last month</span>
          </div>
        </div>

        <!-- Card 2: In Progress -->
        <div class="metric-card metric-card-info">
          <div class="metric-card-body">
            <div class="metric-info">
              <span class="metric-label">In Progress</span>
              <h3 class="metric-value">${stats.inProgress}</h3>
            </div>
            <div class="metric-icon-box icon-info">
              <i class="fa-solid fa-screwdriver-wrench"></i>
            </div>
          </div>
          <div class="metric-card-footer">
            <span class="trend-pill trend-info"><i class="fa-solid fa-rotate"></i> Active</span>
            <span class="trend-subtext">in workshop</span>
          </div>
        </div>

        <!-- Card 3: Completed Orders -->
        <div class="metric-card metric-card-success">
          <div class="metric-card-body">
            <div class="metric-info">
              <span class="metric-label">Completed Orders</span>
              <h3 class="metric-value">${stats.completed}</h3>
            </div>
            <div class="metric-icon-box icon-success">
              <i class="fa-solid fa-circle-check"></i>
            </div>
          </div>
          <div class="metric-card-footer">
            <span class="trend-pill trend-success"><i class="fa-solid fa-check"></i> Ready</span>
            <span class="trend-subtext">for delivery</span>
          </div>
        </div>

        <!-- Card 4: Pending Orders -->
        <div class="metric-card metric-card-warning">
          <div class="metric-card-body">
            <div class="metric-info">
              <span class="metric-label">Pending Orders</span>
              <h3 class="metric-value">${stats.pending}</h3>
            </div>
            <div class="metric-icon-box icon-warning">
              <i class="fa-solid fa-clock"></i>
            </div>
          </div>
          <div class="metric-card-footer">
            <span class="trend-pill trend-warning"><i class="fa-solid fa-triangle-exclamation"></i> Urgent</span>
            <span class="trend-subtext">action needed</span>
          </div>
        </div>

        <!-- Card 5: Total Revenue -->
        <div class="metric-card metric-card-primary">
          <div class="metric-card-body">
            <div class="metric-info">
              <span class="metric-label">Total Revenue</span>
              <h3 class="metric-value">₹${stats.totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
            <div class="metric-icon-box icon-primary">
              <i class="fa-solid fa-indian-rupee-sign"></i>
            </div>
          </div>
          <div class="metric-card-footer">
            <span class="trend-pill trend-primary"><i class="fa-solid fa-arrow-up"></i> +28%</span>
            <span class="trend-subtext">growth</span>
          </div>
        </div>
      </div>

      <!-- Recent Orders Section -->
      <div class="table-card">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <h3 class="text-lg font-bold">Recent Customer Frame Orders</h3>
          </div>
          <div class="toolbar-right">
            <button class="btn btn-secondary btn-sm" onclick="window.RaigonApp.navigateTo('customers')">
              View All Customers <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
        
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Customer Name</th>
                <th>Phone</th>
                <th>Frame Size</th>
                <th>Frame Type</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${recentCustomers.map(cust => `
                <tr>
                  <td class="font-bold text-primary">${cust.id}</td>
                  <td>
                    <div class="customer-avatar-cell">
                      <div class="avatar-circle">${cust.name.charAt(0)}</div>
                      <div>
                        <div class="font-semibold">${cust.name}</div>
                        <div class="text-xs text-muted">${cust.city}</div>
                      </div>
                    </div>
                  </td>
                  <td>${cust.phone}</td>
                  <td class="font-medium">${cust.frameSize}</td>
                  <td>${cust.frameType}</td>
                  <td class="font-bold">${cust.quantity}</td>
                  <td class="font-bold">₹${Number(cust.totalAmount).toLocaleString('en-IN')}</td>
                  <td>${this.getStatusBadge(cust.orderStatus)}</td>
                  <td>
                    <div class="table-actions">
                      <button class="action-btn" title="View Customer Profile" onclick="window.RaigonCustomersView.viewCustomer('${cust.id}')">
                        <i class="fa-solid fa-eye"></i>
                      </button>
                      <button class="action-btn edit" title="Edit Order" onclick="window.RaigonCustomersView.editCustomer('${cust.id}')">
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
  }

  getStatusBadge(status) {
    let badgeClass = 'badge-pending';
    if (status === 'In Progress') badgeClass = 'badge-in-progress';
    if (status === 'Completed') badgeClass = 'badge-completed';
    if (status === 'Delivered') badgeClass = 'badge-delivered';
    if (status === 'Cancelled') badgeClass = 'badge-cancelled';

    return `
      <span class="badge ${badgeClass}">
        <span class="badge-dot"></span> ${status}
      </span>
    `;
  }
}

window.RaigonDashboardView = new DashboardView();

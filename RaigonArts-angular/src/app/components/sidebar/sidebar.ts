import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  @Input() isCollapsed: boolean = false;
  @Output() isCollapsedChange = new EventEmitter<boolean>();

  constructor(
    public modalService: ModalService,
    public authService: AuthService
  ) {}

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.isCollapsedChange.emit(this.isCollapsed);
  }

  openNewCustomer(): void {
    this.modalService.openCustomerModal('create');
  }

  logout(): void {
    this.authService.logout();
  }
}

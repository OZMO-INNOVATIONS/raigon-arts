import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService, FrameSize } from '../../services/storage';
import { ModalService } from '../../services/modal.service';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-frames',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './frames.html',
  styleUrl: './frames.css'
})
export class Frames implements OnInit {
  frameSizes: FrameSize[] = [];
  searchQuery: string = '';

  constructor(
    private storage: StorageService,
    public modalService: ModalService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadFrames();
  }

  loadFrames(): void {
    this.frameSizes = this.storage.getFrameSizes();
  }

  get filteredFrameSizes(): FrameSize[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.frameSizes;
    return this.frameSizes.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      (f.code && f.code.toLowerCase().includes(q)) ||
      f.unit.toLowerCase().includes(q)
    );
  }

  openAddFrameSize(): void {
    this.modalService.openFrameSizeModal('create');
  }

  editFrameSize(frame: FrameSize): void {
    this.modalService.openFrameSizeModal('edit', frame);
  }

  deleteFrameSize(frame: FrameSize): void {
    this.modalService.openConfirmModal(
      'Delete Frame Size',
      `Are you sure you want to delete "${frame.name}"?`,
      () => {
        this.storage.deleteFrameSize(frame.id);
        this.toast.success(`Frame size "${frame.name}" deleted.`);
        this.loadFrames();
      }
    );
  }
}

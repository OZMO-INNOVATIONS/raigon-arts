import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-photos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photos.html',
  styleUrl: './photos.css'
})
export class Photos implements OnInit {
  photos: any[] = [];
  selectedOrientation: string = 'All';

  constructor(
    private storage: StorageService,
    public modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.photos = this.storage.getAllPhotos();
  }

  get filteredPhotos(): any[] {
    if (this.selectedOrientation === 'All') return this.photos;
    return this.photos.filter(p => p.orientation === this.selectedOrientation);
  }

  setOrientation(ori: string): void {
    this.selectedOrientation = ori;
  }

  openLightbox(photo: any): void {
    this.modalService.openLightbox(photo.photoUrl, `${photo.photoName} — ${photo.customerName}`);
  }
}

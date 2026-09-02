import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  ChangeDetectorRef,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FrameSize {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: string;
  category: string;
  usageCount: number;
  status: string;
}

const INITIAL_FRAME_SIZES: FrameSize[] = [
  { id: 'FS-01', name: '4 × 6 inch', width: 4, height: 6, unit: 'inch', category: 'Standard Photo', usageCount: 142, status: 'Active' },
  { id: 'FS-02', name: '5 × 7 inch', width: 5, height: 7, unit: 'inch', category: 'Standard Photo', usageCount: 98, status: 'Active' },
  { id: 'FS-03', name: '8 × 10 inch', width: 8, height: 10, unit: 'inch', category: 'Medium Portrait', usageCount: 210, status: 'Active' },
  { id: 'FS-04', name: '8 × 12 inch', width: 8, height: 12, unit: 'inch', category: 'Medium Portrait', usageCount: 320, status: 'Active' },
  { id: 'FS-05', name: '12 × 18 inch', width: 12, height: 18, unit: 'inch', category: 'Large Gallery', usageCount: 455, status: 'Active' },
  { id: 'FS-06', name: '16 × 20 inch', width: 16, height: 20, unit: 'inch', category: 'Large Gallery', usageCount: 184, status: 'Active' },
  { id: 'FS-07', name: '20 × 30 inch', width: 20, height: 30, unit: 'inch', category: 'Exhibition Wall Art', usageCount: 92, status: 'Active' }
];

@Component({
  selector: 'app-frame-sizes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './frame-sizes.html',
  styleUrl: './frame-sizes.css'
})
export class FrameSizes implements OnInit {

  readonly showModal = signal(false);

  frameSizes: FrameSize[] = [];
  filteredSizes: FrameSize[] = [];

  searchQuery = '';
  editingId: string | null = null;

  formSize = {
    name: '',
    width: 0,
    height: 0,
    unit: 'inch',
    category: 'Standard Photo'
  };

  formErrors: { [key: string]: string } = {};
  toastMessage = '';
  private toastTimer: any = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadFrameSizes();
  }

  loadFrameSizes(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    let stored: FrameSize[] = JSON.parse(
      localStorage.getItem('raigon_arts_frame_sizes') ||
      localStorage.getItem('raigon_frame_sizes') ||
      '[]'
    );

    if (stored.length === 0) {
      stored = [...INITIAL_FRAME_SIZES];
      localStorage.setItem('raigon_arts_frame_sizes', JSON.stringify(stored));
    }

    this.frameSizes = stored;
    this.applyFilter();
    this.cdr.detectChanges();
  }

  applyFilter(): void {
    let result = [...this.frameSizes];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(
        s =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.category && s.category.toLowerCase().includes(q)) ||
          (s.id && s.id.toLowerCase().includes(q))
      );
    }

    this.filteredSizes = result;
    this.cdr.detectChanges();
  }

  openAddModal(): void {
    this.editingId = null;
    this.formErrors = {};
    this.formSize = {
      name: '',
      width: 0,
      height: 0,
      unit: 'inch',
      category: 'Standard Photo'
    };
    this.showModal.set(true);
    this.cdr.detectChanges();
  }

  openEditModal(size: FrameSize): void {
    this.editingId = size.id;
    this.formErrors = {};
    this.formSize = {
      name: size.name,
      width: size.width,
      height: size.height,
      unit: size.unit || 'inch',
      category: size.category || 'Standard Photo'
    };
    this.showModal.set(true);
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingId = null;
    this.formErrors = {};
    this.cdr.detectChanges();
  }

  validateField(field: string): void {
    delete this.formErrors[field];
    if (field === 'name') {
      if (!this.formSize.name || !this.formSize.name.trim()) {
        this.formErrors['name'] = 'Size Name is required.';
      }
    }
    if (field === 'width') {
      const w = Number(this.formSize.width);
      if (!w || w <= 0) {
        this.formErrors['width'] = 'Width must be greater than 0.';
      }
    }
    if (field === 'height') {
      const h = Number(this.formSize.height);
      if (!h || h <= 0) {
        this.formErrors['height'] = 'Height must be greater than 0.';
      }
    }
    this.cdr.detectChanges();
  }

  saveFrameSize(): void {
    this.formErrors = {};
    const name = (this.formSize.name || '').trim();
    const width = Number(this.formSize.width);
    const height = Number(this.formSize.height);

    if (!name) {
      this.formErrors['name'] = 'Size Name is required.';
    }
    if (!width || width <= 0) {
      this.formErrors['width'] = 'Width must be greater than 0.';
    }
    if (!height || height <= 0) {
      this.formErrors['height'] = 'Height must be greater than 0.';
    }

    if (Object.keys(this.formErrors).length > 0) {
      this.showToast('Please correct the highlighted fields before saving.');
      return;
    }

    if (this.editingId) {
      const idx = this.frameSizes.findIndex(s => s.id === this.editingId);
      if (idx !== -1) {
        this.frameSizes[idx] = {
          ...this.frameSizes[idx],
          name,
          width,
          height,
          unit: this.formSize.unit,
          category: this.formSize.category
        };
      }
      this.showToast(`Frame size "${name}" updated successfully!`);
    } else {
      // Generate next FS code
      let maxNum = 7;
      for (const s of this.frameSizes) {
        const match = (s.id || '').match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      const nextId = `FS-${String(maxNum + 1).padStart(2, '0')}`;

      const newSize: FrameSize = {
        id: nextId,
        name,
        width,
        height,
        unit: this.formSize.unit,
        category: this.formSize.category,
        usageCount: 0,
        status: 'Active'
      };
      this.frameSizes.push(newSize);
      this.showToast(`Frame size "${name}" (${nextId}) added successfully!`);
    }

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('raigon_arts_frame_sizes', JSON.stringify(this.frameSizes));
    }

    this.closeModal();
    this.applyFilter();
  }

  deleteSize(id: string, name: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const confirmed = window.confirm(`Are you sure you want to delete frame size "${name}"?`);
    if (!confirmed) return;

    this.frameSizes = this.frameSizes.filter(s => s.id !== id);
    localStorage.setItem('raigon_arts_frame_sizes', JSON.stringify(this.frameSizes));
    this.applyFilter();
    this.showToast(`Frame size "${name}" deleted.`);
  }

  showToast(msg: string): void {
    this.toastMessage = msg;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastMessage = '';
      this.cdr.detectChanges();
    }, 3500);
    this.cdr.detectChanges();
  }

  dismissToast(): void {
    this.toastMessage = '';
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.cdr.detectChanges();
  }
}

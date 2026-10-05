import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { GestionService } from './gestion.service';
import { MANAGEMENT_RESOURCES, ManagementField, ManagementResource } from './gestion-resource';

type ManagementRecord = Record<string, unknown>;

@Component({
  selector: 'app-gestion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gestion.component.html',
  styleUrl: './gestion.component.scss'
})
export class GestionComponent implements OnInit, OnDestroy {
  resource?: ManagementResource;
  records: ManagementRecord[] = [];
  form?: FormGroup;
  selectedRecord: ManagementRecord | null = null;
  searchTerm = '';
  currentPage = 1;
  readonly pageSize = 10;
  loading = false;
  saving = false;
  errorMessage = '';
  successMessage = '';
  private routeSubscription?: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly gestionService: GestionService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.data.subscribe((data) => {
      const key = data['managementResource'] as string | undefined;
      this.resource = key ? MANAGEMENT_RESOURCES[key] : undefined;
      this.records = [];
      this.cancelForm();
      this.loadRecords();
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
  }

  get filteredRecords(): ManagementRecord[] {
    const term = this.normalize(this.searchTerm.trim());
    if (!term || !this.resource) {
      return this.records;
    }
    return this.records.filter((record) =>
      this.resource!.columns.some((column) => this.normalize(this.displayValue(record, column.key)).includes(term))
    );
  }

  get pagedRecords(): ManagementRecord[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRecords.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRecords.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  loadRecords(): void {
    if (!this.resource) {
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.gestionService.listar<ManagementRecord>(this.resource.endpoint, this.resource.listPath).subscribe({
      next: (records) => {
        this.records = records;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (error: unknown) => {
        this.loading = false;
        this.errorMessage = this.errorText(error, `No fue posible cargar ${this.resource?.title.toLowerCase()}.`);
      }
    });
  }

  startCreate(): void {
    this.selectedRecord = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.buildForm({});
  }

  startEdit(record: ManagementRecord): void {
    this.selectedRecord = record;
    this.errorMessage = '';
    this.successMessage = '';
    const values: Record<string, unknown> = {};
    this.resource?.fields.forEach((field) => {
      let value = this.readPath(record, field.readKey ?? field.key);
      if (field.type === 'datetime-local' && typeof value === 'string') {
        value = value.slice(0, 16);
      }
      if (field.type === 'select' && typeof value === 'boolean') {
        value = String(value);
      }
      values[field.key] = value ?? '';
    });
    this.buildForm(values);
  }

  save(): void {
    if (!this.resource || !this.form || this.form.invalid || this.saving) {
      this.form?.markAllAsTouched();
      return;
    }

    const payload: ManagementRecord = {};
    this.resource.fields.forEach((field) => {
      const value = this.form?.get(field.key)?.value;
      payload[field.key] = this.convertValue(value, field);
    });
    if (this.selectedRecord) {
      payload[this.resource.idField] = this.selectedRecord[this.resource.idField];
    }

    this.saving = true;
    this.errorMessage = '';
    const action = this.selectedRecord ? 'actualizar' : 'guardar';
    this.gestionService.guardar<unknown>(this.resource.endpoint, action, payload).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = `${this.resource?.title} ${this.selectedRecord ? 'actualizado' : 'guardado'} correctamente.`;
        this.cancelForm();
        this.loadRecords();
      },
      error: (error: unknown) => {
        this.saving = false;
        this.errorMessage = this.errorText(error, `No fue posible guardar ${this.resource?.title.toLowerCase()}.`);
      }
    });
  }

  cancelForm(): void {
    this.selectedRecord = null;
    this.form = undefined;
  }

  updateSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  displayValue(record: ManagementRecord, path: string): string {
    const value = this.readPath(record, path);
    if (value === null || value === undefined || value === '') {
      return '—';
    }
    if (typeof value === 'boolean') {
      return value ? 'Activo' : 'Inactivo';
    }
    return String(value);
  }

  isInvalid(field: ManagementField): boolean {
    const control = this.form?.get(field.key);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private buildForm(values: Record<string, unknown>): void {
    if (!this.resource) {
      return;
    }
    const controls: Record<string, unknown[]> = {};
    this.resource.fields.forEach((field) => {
      const validators = field.required
        ? [Validators.required, ...(field.type === 'number' ? [Validators.min(1)] : [])]
        : [];
      controls[field.key] = [values[field.key] ?? '', validators];
    });
    this.form = this.formBuilder.group(controls);
  }

  private convertValue(value: unknown, field: ManagementField): unknown {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    if (field.type === 'number') {
      return Number(value);
    }
    if (field.type === 'select' && (value === 'true' || value === 'false')) {
      return value === 'true';
    }
    if (field.type === 'datetime-local' && typeof value === 'string' && value.length === 16) {
      return `${value}:00`;
    }
    return value;
  }

  private readPath(record: ManagementRecord, path: string): unknown {
    return path.split('.').reduce<unknown>((value, key) => {
      if (value && typeof value === 'object') {
        return (value as ManagementRecord)[key];
      }
      return undefined;
    }, record);
  }

  private normalize(value: string): string {
    return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private errorText(error: unknown, fallback: string): string {
    if (error && typeof error === 'object') {
      const response = error as { error?: { message?: string; error?: string } };
      return response.error?.message ?? response.error?.error ?? fallback;
    }
    return fallback;
  }
}

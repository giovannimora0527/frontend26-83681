import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from 'src/environments/environment';

interface ClienteItem {
  id: number;
  nombres?: string;
  apellidos?: string;
  numeroDocumento?: string;
}

interface MascotaItem {
  mascotaId: number;
  nombreMascota?: string;
  clienteId?: number;
  cliente?: { id: number; nombres?: string; apellidos?: string };
}

interface MedicoItem {
  id: number;
  nombres?: string;
  apellidos?: string;
}

interface Item {
  id?: number;
  mascota?: MascotaItem;
  medico?: MedicoItem;
  clienteId?: number;
  fechaHora?: string;
  estado?: string;
  motivo?: string;
}

interface CitaForm {
  clienteId: string | number;
  mascotaId: string | number;
  medicoId: string | number;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}
@Component({ selector: 'app-cita', standalone: true, imports: [CommonModule, FormsModule, RouterLink], templateUrl: './cita.component.html', styleUrl: './cita.component.scss' })
export class CitaComponent implements OnInit {
  private api = `${environment.apiUrlAuth}/gestion`;
  citas: Item[] = []; clientes: ClienteItem[] = []; mascotas: MascotaItem[] = []; mascotasCliente: MascotaItem[] = []; medicos: MedicoItem[] = [];
  filtro = ''; cargando = false; guardando = false; error = ''; exito = ''; pagina = 1; porPagina = 8; editando: number | null = null;
  fechaMinima = new Date().toLocaleDateString('en-CA');
  form: CitaForm = { clienteId: '', mascotaId: '', medicoId: '', fecha: '', hora: '', motivo: '', estado: 'PENDIENTE' };
  constructor(private http: HttpClient) {}
  ngOnInit(): void { this.cargar(); }
  cargar(): void { this.cargando = true; this.error = ''; this.http.get<Item[]>(`${this.api}/citas`).subscribe({ next: d => { this.citas = d || []; this.cargando = false; }, error: e => this.fallo(e) });
    this.http.get<ClienteItem[]>(`${this.api}/clientes`).subscribe({ next: d => this.clientes = d || [], error: e => this.fallo(e) });
    this.http.get<MascotaItem[]>(`${this.api}/mascotas`).subscribe({ next: d => this.mascotas = d || [], error: e => this.fallo(e) });
    this.http.get<MedicoItem[]>(`${this.api}/medicos`).subscribe({ next: d => this.medicos = d || [], error: e => this.fallo(e) }); }
  cambiarCliente(): void { this.mascotasCliente = this.mascotas.filter(m => Number(m.cliente?.id ?? m.clienteId) === Number(this.form.clienteId)); this.form.mascotaId = ''; }
  nueva(): void { this.editando = null; this.form = { clienteId: '', mascotaId: '', medicoId: '', fecha: '', hora: '', motivo: '', estado: 'PENDIENTE' }; this.mascotasCliente = []; this.error = ''; this.exito = ''; }
  editar(c: Item): void { if (['CANCELADA','ATENDIDA'].includes((c.estado || '').toUpperCase())) { this.error = 'Las citas canceladas o atendidas conservan su información histórica.'; return; } this.editando = c.id!; this.form = { clienteId: c.clienteId ?? c.mascota?.cliente?.id ?? '', mascotaId: c.mascota?.mascotaId ?? '', medicoId: c.medico?.id ?? '', fecha: (c.fechaHora || '').slice(0,10), hora: (c.fechaHora || '').slice(11,16), motivo: c.motivo || '', estado: c.estado || 'PENDIENTE' }; this.cambiarCliente(); this.form.mascotaId = c.mascota?.mascotaId ?? ''; this.error = ''; }
  guardar(): void { this.error = ''; this.exito = ''; if (!this.form.clienteId || !this.form.mascotaId || !this.form.medicoId || !this.form.fecha || !this.form.hora || !this.form.motivo.trim()) { this.error = 'Completa todos los campos obligatorios.'; return; } const payload = { clienteId: Number(this.form.clienteId), mascotaId: Number(this.form.mascotaId), medicoId: Number(this.form.medicoId), fechaHora: `${this.form.fecha}T${this.form.hora}:00`, motivo: this.form.motivo.trim(), estado: this.form.estado }; this.guardando = true; const req = this.editando ? this.http.put(`${this.api}/citas/${this.editando}`, payload) : this.http.post(`${this.api}/citas`, payload); req.subscribe({ next: () => { this.guardando = false; this.exito = this.editando ? 'Cita actualizada.' : 'Cita registrada.'; this.nueva(); this.cargar(); }, error: e => { this.guardando = false; this.fallo(e); } }); }
  get filtradas(): Item[] { const q = this.filtro.toLowerCase().trim(); return this.citas.filter(c => [c.id,c.mascota?.nombreMascota,c.mascota?.cliente?.nombres,c.mascota?.cliente?.apellidos,c.medico?.nombres,c.medico?.apellidos,c.estado,c.motivo,c.fechaHora].join(' ').toLowerCase().includes(q)); }
  get paginaDatos(): Item[] { return this.filtradas.slice((this.pagina-1)*this.porPagina,this.pagina*this.porPagina); }
  get paginas(): number { return Math.max(1,Math.ceil(this.filtradas.length/this.porPagina)); }
  fallo(e: HttpErrorResponse): void {
    const body: unknown = e.error;
    const detail = body && typeof body === 'object' ? body as { message?: unknown; detail?: unknown } : null;
    const message = typeof detail?.message === 'string' ? detail.message :
      typeof detail?.detail === 'string' ? detail.detail : '';
    this.error = message || (e.status === 0 ? 'No hay conexión con el backend.' : 'No fue posible completar la operación.');
    this.cargando = false;
  }
}

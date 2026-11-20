import { confirmarAccion } from 'src/app/utils/confirmar-accion';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DespachoComponent } from '../despacho/despacho.component';
import { InventarioComponent } from '../inventario/inventario.component';
import { MedicamentoService } from './service/medicamento.service';
import { Medicamento } from 'src/app/models/medicamento';
import { getJwtPayload } from 'src/app/utils/jwt.util';

/** Identifica la sección de medicamentos, inventario o despacho que está abierta. */
type ModuloClinica = 'medicamentos' | 'inventario' | 'despacho';

/** Contenedor de navegación local para los tres módulos asignados a inventario. */
@Component({
  selector: 'app-medicamento',
  imports: [CommonModule, FormsModule, InventarioComponent, DespachoComponent],
  templateUrl: './medicamento.component.html',
  styleUrl: './medicamento.component.scss'
})
export class MedicamentoComponent implements OnInit, OnDestroy {
  /** Rol obtenido del token para ocultar secciones que la API no autoriza. */
  readonly rol = this.normalizarRol(getJwtPayload()?.rol ?? '');
  readonly esAdmin = ['ADMIN', 'ADMINISTRADOR'].includes(this.rol);
  readonly esDespacho = this.rol === 'DESPACHO_MEDICO';
  readonly esMedico = ['MEDICO', 'VETERINARIO'].includes(this.rol);
  readonly autorizado = this.esAdmin || this.esDespacho || this.esMedico;
  moduloActual: ModuloClinica = 'medicamentos';
  /** Lista del catálogo consultado por el servicio ya existente en pages/medicamento. */
  medicamentos: Medicamento[] = [];
  /** Criterio para filtrar el catálogo de medicamentos. */
  busquedaMedicamentos = '';
  /** Página actual del listado de medicamentos. */
  paginaMedicamentos = 1;
  /** Número de filas visibles por página en el listado. */
  readonly tamanoPagina = 8;
  cargandoMedicamentos = false;
  errorMedicamentos = '';

  /** Conserva la suscripción a query params para permitir enlaces directos desde el sidebar. */
  private querySubscription?: Subscription;

  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor(private readonly route: ActivatedRoute, private readonly router: Router, private readonly medicamentoService: MedicamentoService) {}

  /** Selecciona el submódulo solicitado en el enlace del sidebar. */
  ngOnInit(): void {
    if (this.autorizado) this.listarMedicamentos();
    this.querySubscription = this.route.queryParamMap.subscribe((params) => {
      const modulo = params.get('modulo');
      this.moduloActual = modulo === 'despacho' && this.esDespacho ? 'despacho' : modulo === 'inventario' && (this.esAdmin || this.esDespacho) ? 'inventario' : 'medicamentos';
    });
  }

  /** Libera la suscripción al destruir el contenedor. */
  ngOnDestroy(): void { this.querySubscription?.unsubscribe(); }

  /** Consulta los medicamentos usando el servicio existente del módulo. */
  listarMedicamentos(mostrarConfirmacion = false): void {
    this.cargandoMedicamentos = true;
    this.errorMedicamentos = '';
    this.medicamentoService.listarMedicamentos().subscribe({
      next: (data) => {
        this.medicamentos = Array.isArray(data) ? data : [];
        this.paginaMedicamentos = 1;
        this.cargandoMedicamentos = false;
        if (mostrarConfirmacion) confirmarAccion('Catálogo de medicamentos actualizado.', true);
      },
      error: (error: { status?: number; message?: string; error?: { mensaje?: string; message?: string } }) => {
        this.errorMedicamentos = this.mensajeErrorCarga(error);
        this.cargandoMedicamentos = false;
      }
    });
  }

  /** Identifica los errores comunes de conexión, autenticación y permisos del catálogo. */
  private mensajeErrorCarga(error: { status?: number; message?: string; error?: { mensaje?: string; message?: string } }): string {
    if (error.status === 0) return 'No se pudo conectar con el servidor. Verifica que el backend esté activo.';
    if (error.status === 200) return 'El backend respondió HTTP 200, pero el cuerpo no tiene formato JSON válido para el catálogo.';
    if (error.status === 401) return 'La sesión venció o no es válida. Inicia sesión nuevamente.';
    if (error.status === 403) return 'Tu rol no tiene permiso para consultar los medicamentos.';
    const detalle = error.error?.mensaje ?? error.error?.message;
    return detalle
      ? `No fue posible cargar los medicamentos: ${detalle}`
      : `No fue posible cargar los medicamentos (HTTP ${error.status ?? 'desconocido'}).`;
  }

  /** Filtra el catálogo de medicamentos por nombre. */
  get medicamentosFiltrados(): Medicamento[] {
    const termino = this.busquedaMedicamentos.trim().toLocaleLowerCase('es');
    return this.medicamentos.filter((item) => !termino || [item.nombre, item.codigo, item.descripcion, item.tipoProducto]
      .some((valor) => valor?.toLocaleLowerCase('es').includes(termino)));
  }

  /** Recorta la lista al bloque de filas correspondiente a la página seleccionada. */
  get medicamentosPagina(): Medicamento[] {
    const inicio = (this.paginaMedicamentos - 1) * this.tamanoPagina;
    return this.medicamentosFiltrados.slice(inicio, inicio + this.tamanoPagina);
  }

  /** Calcula el número de páginas del catálogo filtrado. */
  get paginasMedicamentos(): number[] {
    return Array.from({ length: Math.max(1, Math.ceil(this.medicamentosFiltrados.length / this.tamanoPagina)) }, (_, index) => index + 1);
  }

  /** Cambia a una página válida del catálogo. */
  cambiarPaginaMedicamentos(pagina: number): void {
    if (pagina >= 1 && pagina <= this.paginasMedicamentos.length) this.paginaMedicamentos = pagina;
  }

  /** Reinicia la página al modificar el texto de búsqueda. */
  reiniciarBusquedaMedicamentos(): void { this.paginaMedicamentos = 1; }

  /** Indica qué carpeta de funcionalidad se presenta en el área principal. */
  seleccionarModulo(modulo: ModuloClinica): void {
    this.moduloActual = modulo;
    void this.router.navigate([], { relativeTo: this.route, queryParams: { modulo: modulo === 'medicamentos' ? null : modulo }, queryParamsHandling: 'merge' });
  }

  /** Normaliza tildes, espacios y mayúsculas del perfil entregado por el JWT. */
  private normalizarRol(rol: string): string {
    return rol.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s-]+/g, '_').toUpperCase();
  }
}

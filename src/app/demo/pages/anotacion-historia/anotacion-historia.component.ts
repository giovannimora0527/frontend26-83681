import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlertaComponent } from 'src/app/components/alerta/alerta.component';
import { AnotacionesPanelComponent } from 'src/app/components/anotaciones-panel/anotaciones-panel.component';
import { HistoriaMedica } from 'src/app/models/historia-medica';
import { HistoriaMedicaService } from 'src/app/demo/pages/historia-medica/service/historia-medica.service';
import { mensajeDeError } from 'src/app/services/api.util';

/**
 * Página de anotaciones: el usuario elige una historia clínica y administra su histórico de anotaciones.
 * El histórico en sí vive en el componente reutilizable AnotacionesPanelComponent.
 */
@Component({
  selector: 'app-anotacion-historia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertaComponent, AnotacionesPanelComponent],
  templateUrl: './anotacion-historia.component.html'
})
export class AnotacionHistoriaComponent {
  private readonly historiaService = inject(HistoriaMedicaService);

  /** Historias disponibles para el selector (las más recientes primero). */
  historias: HistoriaMedica[] = [];
  cargando = false;
  aviso: string | null = null;

  /** Historia cuyo histórico se muestra; null mientras no se elija una. */
  historiaSeleccionada: number | null = null;

  readonly selectorForm = new FormGroup({
    historiaId: new FormControl('', { nonNullable: true })
  });

  constructor() {
    this.cargarHistorias();

    this.selectorForm.controls.historiaId.valueChanges.pipe(takeUntilDestroyed()).subscribe(valor => {
      this.historiaSeleccionada = valor ? Number(valor) : null;
    });
  }

  /**
   * @param historia historia del selector.
   * @returns texto legible para el combo.
   */
  textoHistoria(historia: HistoriaMedica): string {
    const fecha = historia.fechaHora.slice(0, 10);
    return `#${historia.id} · ${historia.mascotaNombre ?? ''} (${historia.clienteNombre ?? ''}) · ${fecha}`;
  }

  /** Carga las historias para el selector. El tamaño se fija en el servidor (máximo 100). */
  private cargarHistorias(): void {
    this.cargando = true;
    this.historiaService.listar({}, 0, 100, 'fechaHora', 'desc').subscribe({
      next: respuesta => {
        this.historias = respuesta.contenido;
        this.cargando = false;
      },
      error: error => {
        this.cargando = false;
        this.aviso = mensajeDeError(error);
      }
    });
  }
}

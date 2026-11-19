import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { CitaAgenda, ClinicaApi, Opcion } from './clinica-api.service';

/** Contiene el historial clínico y los datos del paciente. */
interface Historia {
  id: number; fecha: string; motivo: string; sintomas: string; diagnostico: string;
  observaciones: string; recomendaciones: string;
  anotaciones: { id: number; descripcion: string; diagnostico: string; observaciones: string }[];
}
/** Contiene los datos clínicos de la atención veterinaria. */
interface Atencion {
  cita: CitaAgenda;
  antecedentes: Historia[];
  historiaActual: Historia | null;
  prefacturaId: number | null;
}
/** Contiene el precio, el impuesto y la vigencia de un servicio. */
interface Tarifa { id: number; nombreServicio: string; valorBase: number; ivaPorcentaje: number }

/** Reúne el historial del paciente, la formulación médica y el cierre de la atención. */
@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './atencion.component.html'
})
export class AtencionComponent implements OnInit {
  private readonly api = inject(ClinicaApi);
  private readonly ruta = inject(ActivatedRoute);
  readonly id = Number(this.ruta.snapshot.paramMap.get('id'));
  private readonly base = 'atencion/' + this.id;
  detalle: Atencion | null = null;
  tarifas: Tarifa[] = [];
  productos: Opcion[] = [];
  tarifaIds: number[] = [];
  form = { motivo: '', sintomas: '', diagnostico: '', observaciones: '', recomendaciones: '' };
  indicaciones = '';
  medicamentos = [this.nuevaLinea()];
  formulas: number[] = [];
  prefacturaId: number | null = null;
  ocupado = false;
  error = '';
  private readonly fallo = this.api.error((mensaje) => this.error = mensaje);

  /** Indica si la cita aún admite cambios desde la pantalla de atención. */
  get abierta() {
    return ['PROGRAMADA', 'CONFIRMADA'].includes(this.detalle?.cita.estado ?? '') && !this.prefacturaId;
  }

  /** Prepara la pantalla al abrirse y carga los datos que necesita. */
  ngOnInit() {
    if (!this.id) return;
    this.api.leer<Atencion>(this.base).subscribe({
      next: (detalle) => {
        this.detalle = detalle;
        this.prefacturaId = detalle.prefacturaId ?? null;
        const historia = detalle.historiaActual;
        this.form = { motivo: historia?.motivo ?? detalle.cita.motivo, sintomas: historia?.sintomas ?? '',
          diagnostico: historia?.diagnostico ?? '', observaciones: historia?.observaciones ?? '',
          recomendaciones: historia?.recomendaciones ?? '' };
        if (this.abierta) this.cargarCatalogos();
        this.api.leer<{ id: number; cita: { id: number } }[]>('formula-medica/listar').subscribe({
          next: (formulas) => {
            const emitidas = formulas.filter((formula) => formula.cita?.id === this.id).map((formula) => formula.id);
            this.formulas = [...new Set([...this.formulas, ...emitidas])];
          }, error: this.fallo
        });
      }, error: this.fallo
    });
  }

  /** Carga los catálogos. */
  private cargarCatalogos() {
    forkJoin({
      tarifas: this.api.leer<Tarifa[]>(this.base + '/tarifas'),
      productos: this.api.leer<Opcion[]>('medicamento/disponibilidad')
    }).subscribe({ next: ({ tarifas, productos }) => { this.tarifas = tarifas; this.productos = productos; }, error: this.fallo });
  }

  /** Prepara los valores iniciales de una línea de la fórmula médica. */
  nuevaLinea() {
    return { medicamentoId: null as number | null, cantidad: 1, dosis: '', frecuencia: '', duracion: '',
      via: '', indicaciones: '', disponible: null as number | null };
  }

  /** Consulta las unidades disponibles para el medicamento elegido en la prescripción. */
  consultarSaldo(linea: ReturnType<AtencionComponent['nuevaLinea']>, id: number | null) {
    linea.medicamentoId = id;
    linea.disponible = null;
    if (!id) return;
    this.api.leer<{ disponible: number }>(`${this.base}/existencias/${id}`).subscribe({
      next: ({ disponible }) => { if (linea.medicamentoId === id) linea.disponible = disponible; }, error: this.fallo
    });
  }

  /** Valida la prescripción y envía la fórmula de la cita al servidor. */
  guardarFormula() {
    if (!this.abierta || this.ocupado) return;
    const cantidades = new Map<number, number>();
    for (const linea of this.medicamentos) {
      if (!linea.medicamentoId) continue;
      const cantidad = (cantidades.get(linea.medicamentoId) ?? 0) + linea.cantidad;
      cantidades.set(linea.medicamentoId, cantidad);
      if (linea.disponible !== null && cantidad > linea.disponible) {
        this.error = 'La cantidad prescrita supera las existencias informadas.';
        return;
      }
    }
    const medicamentos = this.medicamentos.map(({ disponible, ...linea }) => ({
      ...linea, dosis: linea.dosis.trim(), frecuencia: linea.frecuencia.trim(),
      duracion: linea.duracion.trim(), via: linea.via.trim(), indicaciones: linea.indicaciones.trim()
    }));
    if (medicamentos.some((linea) => !linea.medicamentoId || !Number.isInteger(linea.cantidad) || linea.cantidad <= 0
      || !linea.dosis || !linea.frecuencia || !linea.duracion || !linea.via)) {
      this.error = 'Completa la prescripción de cada medicamento.';
      return;
    }
    this.ocupado = true;
    this.error = '';
    this.api.enviar<{ formulaId: number }>('POST', this.base + '/formulas', {
      indicaciones: this.indicaciones.trim(), medicamentos
    }).pipe(finalize(() => this.ocupado = false)).subscribe({
      next: ({ formulaId }) => {
        this.formulas = [...this.formulas, formulaId];
        this.medicamentos = [this.nuevaLinea()];
        this.indicaciones = '';
      }, error: this.fallo
    });
  }

  /** Detecta datos de una fórmula que todavía no se han guardado. */
  private tieneBorradorFormula(): boolean {
    return !!this.indicaciones.trim() || this.medicamentos.some((linea) =>
      linea.medicamentoId !== null || linea.cantidad !== 1
      || [linea.dosis, linea.frecuencia, linea.duracion, linea.via, linea.indicaciones].some((texto) => texto.trim())
    );
  }

  /** Valida los datos clínicos y los servicios antes de solicitar el cierre de la cita. */
  async cerrarAtencion() {
    if (!this.abierta || this.ocupado) return;
    const motivo = this.form.motivo.trim();
    const diagnostico = this.form.diagnostico.trim();
    if (!motivo || !diagnostico || !this.tarifaIds.length) {
      this.error = 'Indica motivo, diagnóstico y al menos una tarifa.';
      return;
    }
    this.error = '';
    this.ocupado = true;
    const solicitud = {
      ...this.form, motivo, diagnostico, tarifaIds: this.tarifaIds
    };
    if (this.tieneBorradorFormula()) {
      const decision = await Swal.fire({
        icon: 'warning',
        title: 'Fórmula pendiente de emitir',
        text: 'Los datos del formulario aún no se han guardado y quedarán fuera de la prefactura si finalizas ahora.',
        showCancelButton: true,
        confirmButtonText: 'Finalizar sin el borrador',
        cancelButtonText: 'Volver a la fórmula',
        focusCancel: true
      });
      if (!decision.isConfirmed) {
        this.ocupado = false;
        return;
      }
    }
    this.api.enviar<{ prefacturaId: number }>('POST', this.base + '/finalizar', solicitud)
      .pipe(finalize(() => this.ocupado = false)).subscribe({
      next: ({ prefacturaId }) => this.prefacturaId = prefacturaId, error: this.fallo
    });
  }

  /** Solicita al servidor el archivo seleccionado y lo guarda desde el navegador. */
  descargar(tipo: 'formulas' | 'prefactura', id: number) {
    this.api.descargar(`${this.base}/${tipo}/${id}/pdf`, `${tipo}-${id}.pdf`, (mensaje) => this.error = mensaje);
  }

  /** Abre el PDF de la fórmula para consultarlo e imprimirlo. */
  verFormulaPdf(id: number) {
    this.error = '';
    this.api.abrirPdf(`${this.base}/formulas/${id}/pdf`, (mensaje) => this.error = mensaje);
  }
}

// angular import
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavigationItem, NavigationItems } from '../../../navigation/navigation';
import { UsuarioService } from 'src/app/demo/pages/usuario/service/usuario.service';
import { ClienteService } from 'src/app/demo/pages/cliente/service/cliente.service';
import { MascotaServiceService } from 'src/app/demo/pages/mascota/service/mascota-service.service';
import { Usuario } from 'src/app/models/usuario';
import { Cliente } from 'src/app/models/cliente';
import { Mascota } from 'src/app/models/mascota';

// Resultado de la busqueda global: un modulo del menu o un registro de la base de datos.
export interface ResultadoBusqueda {
  tipo: string;
  icono: string;
  titulo: string;
  detalle?: string;
  url: string;
  // Texto con el que se filtra la tabla del modulo al abrirlo.
  filtro?: string;
}

@Component({
  selector: 'app-nav-search',
  imports: [SharedModule],
  templateUrl: './nav-search.component.html',
  styleUrls: ['./nav-search.component.scss']
})
export class NavSearchComponent {
  // public props
  searchInterval;
  searchWidth: number;
  searchWidthString: string;

  // Variables para la busqueda global.
  terminoBusqueda = '';
  resultados: ResultadoBusqueda[] = [];
  indiceSeleccionado = 0;
  cargando = false;
  private readonly maxPorTipo = 5;
  private readonly modulos: NavigationItem[] = this.obtenerModulos(NavigationItems);

  // Datos en los que se busca (se recargan cada vez que se abre la lupa).
  private usuarios: Usuario[] = [];
  private clientes: Cliente[] = [];
  private mascotas: Mascota[] = [];

  // constructor
  constructor(private readonly router: Router,
    private readonly usuarioService: UsuarioService,
    private readonly clienteService: ClienteService,
    private readonly mascotaService: MascotaServiceService) {
    this.searchWidth = 0;
  }

  // public method
  searchOn() {
    clearInterval(this.searchInterval);
    document.querySelector('#main-search').classList.add('open');
    this.cargarDatos();
    this.searchInterval = setInterval(() => {
      if (this.searchWidth >= 170) {
        clearInterval(this.searchInterval);
        (document.querySelector('#m-search') as HTMLInputElement)?.focus();
        return;
      }
      this.searchWidth = this.searchWidth + 30;
      this.searchWidthString = this.searchWidth + 'px';
    }, 35);
  }

  searchOff() {
    clearInterval(this.searchInterval);
    this.limpiarBusqueda();
    this.searchInterval = setInterval(() => {
      if (this.searchWidth <= 0) {
        document.querySelector('#main-search').classList.remove('open');
        clearInterval(this.searchInterval);
        return;
      }
      this.searchWidth = this.searchWidth - 30;
      this.searchWidthString = this.searchWidth + 'px';
    }, 35);
  }

  // Carga usuarios, clientes y mascotas. Si un servicio falla, se busca en los demas.
  private cargarDatos() {
    this.cargando = true;
    forkJoin({
      usuarios: this.usuarioService.getUsuarios().pipe(catchError(() => of([] as Usuario[]))),
      clientes: this.clienteService.getClientes().pipe(catchError(() => of([] as Cliente[]))),
      mascotas: this.mascotaService.getMascotas().pipe(catchError(() => of([] as Mascota[])))
    }).subscribe(({ usuarios, clientes, mascotas }) => {
      this.usuarios = usuarios;
      this.clientes = clientes;
      this.mascotas = mascotas;
      this.cargando = false;
      this.buscar();
    });
  }

  // Busca el termino en los modulos del menu y en los datos (cedula, nombre, correo, telefono...).
  buscar() {
    const termino = this.normalizarTexto(this.terminoBusqueda);
    this.indiceSeleccionado = 0;
    if (!termino) {
      this.resultados = [];
      return;
    }

    const coincide = (...valores: unknown[]) =>
      valores.some((valor) => this.normalizarTexto(String(valor ?? '')).includes(termino));

    const modulos: ResultadoBusqueda[] = this.modulos
      .filter((modulo) => coincide(modulo.title))
      .map((modulo) => ({ tipo: 'Módulo', icono: modulo.icon, titulo: modulo.title, url: modulo.url }));

    const clientes: ResultadoBusqueda[] = this.clientes
      .filter((c) => coincide(c.numeroDocumento, `${c.nombres ?? ''} ${c.apellidos ?? ''}`, c.telefono, c.direccion))
      .slice(0, this.maxPorTipo)
      .map((c) => ({
        tipo: 'Cliente',
        icono: 'feather icon-users',
        titulo: `${c.nombres ?? ''} ${c.apellidos ?? ''}`,
        detalle: `${c.tipoDocumento ?? ''} ${c.numeroDocumento ?? ''}${c.telefono ? ' · ' + c.telefono : ''}`,
        url: '/inicio/clientes',
        filtro: c.numeroDocumento
      }));

    const usuarios: ResultadoBusqueda[] = this.usuarios
      .filter((u) => coincide(u.username, u.email, u.rol))
      .slice(0, this.maxPorTipo)
      .map((u) => ({
        tipo: 'Usuario',
        icono: 'feather icon-user',
        titulo: u.username ?? '',
        detalle: `${u.email ?? ''}${u.rol ? ' · ' + u.rol : ''}`,
        url: '/inicio/usuarios',
        filtro: u.email ?? u.username
      }));

    const mascotas: ResultadoBusqueda[] = this.mascotas
      .filter((m) => coincide(m.nombreMascota, m.raza?.nombre, m.raza?.especie,
        m.cliente?.numeroDocumento, `${m.cliente?.nombres ?? ''} ${m.cliente?.apellidos ?? ''}`))
      .slice(0, this.maxPorTipo)
      .map((m) => ({
        tipo: 'Mascota',
        icono: 'feather icon-heart',
        titulo: m.nombreMascota ?? '',
        detalle: `${m.raza?.especie ?? ''} ${m.raza?.nombre ?? ''} · Dueño: ${m.cliente?.nombres ?? ''} ${m.cliente?.apellidos ?? ''}`,
        url: '/inicio/mascotas',
        filtro: m.nombreMascota
      }));

    this.resultados = [...modulos, ...clientes, ...usuarios, ...mascotas];
  }

  // Permite moverse por los resultados con las flechas y seleccionar con Enter.
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' && this.resultados.length) {
      event.preventDefault();
      this.indiceSeleccionado = (this.indiceSeleccionado + 1) % this.resultados.length;
    } else if (event.key === 'ArrowUp' && this.resultados.length) {
      event.preventDefault();
      this.indiceSeleccionado = (this.indiceSeleccionado - 1 + this.resultados.length) % this.resultados.length;
    } else if (event.key === 'Enter' && this.resultados.length) {
      event.preventDefault();
      this.irA(this.resultados[this.indiceSeleccionado]);
    } else if (event.key === 'Escape') {
      this.searchOff();
    }
  }

  // Navega al modulo del resultado; si es un registro, la tabla del modulo queda filtrada por el.
  irA(resultado: ResultadoBusqueda) {
    this.router.navigate([resultado.url], {
      queryParams: resultado.filtro ? { buscar: resultado.filtro } : {}
    });
    this.searchOff();
  }

  private limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.resultados = [];
    this.indiceSeleccionado = 0;
  }

  // Obtiene de forma recursiva los items visibles del menu que tienen url.
  private obtenerModulos(items: NavigationItem[]): NavigationItem[] {
    return items.flatMap((item) => [
      ...(item.type === 'item' && item.url && !item.hidden ? [item] : []),
      ...this.obtenerModulos(item.children ?? [])
    ]);
  }

  // Metodo privado para normalizar el texto, eliminando acentos y convirtiendo a minúsculas.
  private normalizarTexto(texto: string): string {
    return texto
      .trim()
      .toLocaleLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
  }
}

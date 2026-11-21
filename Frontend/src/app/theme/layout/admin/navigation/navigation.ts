import { getJwtMenus, getJwtPayload } from 'src/app/utils/jwt.util';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;

  children?: NavigationItem[];
}
export const NavigationItems: NavigationItem[] = [
  {
    id: 'navigation',
    title: 'Inicio',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'cita',
        title: 'Gestión de Citas',
        type: 'item',
        url: '/inicio/citas',
        icon: 'bi bi-calendar',
        classes: 'nav-item'
      },
      {
        id: 'clientes',
        title: 'Gestión de Clientes',
        type: 'item',
        url: '/inicio/clientes',
        icon: 'bi bi-person-check',
        classes: 'nav-item'
      },
      {
        id: 'especializaciones',
        title: 'Gestión de Especializaciones',
        type: 'item',
        url: '/inicio/especializaciones',
        icon: 'fa-solid fa-user-graduate',
        classes: 'nav-item'
      },
      {
        id: 'formulas',
        title: 'Gestión de Formulas',
        type: 'item',
        url: '/inicio/formulas',
        icon: 'fa-solid fa-clipboard-list',
        classes: 'nav-item'
      },
      {
        id: 'historias',
        title: 'Gestión de Historias',
        type: 'item',
        url: '/inicio/historias',
        icon: 'fa-solid fa-book-medical',
        classes: 'nav-item'
      },
      {
        id: 'mascotas',
        title: 'Gestión de Mascotas',
        type: 'item',
        url: '/inicio/mascotas',
        icon: 'fa-solid fa-paw',
        classes: 'nav-item'
      },
      {
        id: 'medicamentos',
        title: 'Gestión de Medicamentos',
        type: 'item',
        url: '/inicio/medicamentos',
        icon: 'fa-solid fa-capsules',
        classes: 'nav-item'
      },
      {
        id: 'medicos',
        title: 'Gestión de Medicos',
        type: 'item',
        url: '/inicio/medicos',
        icon: 'fa-solid fa-user-doctor',
        classes: 'nav-item'
      },
      {
        id: 'usuarios',
        title: 'Gestión de Usuarios',
        type: 'item',
        url: '/inicio/usuarios',
        icon: 'feather icon-users',
        classes: 'nav-item'
      },
      { id: 'agenda-medica', title: 'Agenda médica', type: 'item', url: '/inicio/agenda-medica', icon: 'bi bi-calendar-week', classes: 'nav-item' },
      { id: 'despacho', title: 'Despacho de medicamentos', type: 'item', url: '/inicio/despacho', icon: 'fa-solid fa-box-open', classes: 'nav-item' },
      { id: 'gestion-lotes', title: 'Gestión de lotes', type: 'item', url: '/inicio/gestion-lotes', icon: 'fa-solid fa-boxes-stacked', classes: 'nav-item' },
      { id: 'alertas-inventario', title: 'Alertas de inventario', type: 'item', url: '/inicio/alertas-inventario', icon: 'fa-solid fa-triangle-exclamation', classes: 'nav-item' },
      { id: 'importacion-inventario', title: 'Importación de inventario', type: 'item', url: '/inicio/importacion-inventario', icon: 'fa-solid fa-file-import', classes: 'nav-item' },
      { id: 'estado-inventario', title: 'Estado de inventario', type: 'item', url: '/inicio/estado-inventario', icon: 'fa-solid fa-warehouse', classes: 'nav-item' },
      { id: 'exportacion-inventario', title: 'Exportación de inventario', type: 'item', url: '/inicio/exportacion-inventario', icon: 'fa-solid fa-file-export', classes: 'nav-item' },
      { id: 'crear-factura', title: 'Facturación', type: 'item', url: '/inicio/crear-factura', icon: 'fa-solid fa-file-invoice', classes: 'nav-item' },
      { id: 'registro-pagos', title: 'Registro de pagos', type: 'item', url: '/inicio/registro-pagos', icon: 'fa-solid fa-credit-card', classes: 'nav-item' },
      { id: 'documentos', title: 'Documentos PDF', type: 'item', url: '/inicio/documentos', icon: 'fa-solid fa-file-pdf', classes: 'nav-item' },
      { id: 'finanzas', title: 'Reportes financieros', type: 'item', url: '/inicio/finanzas', icon: 'fa-solid fa-chart-line', classes: 'nav-item' },
      { id: 'conciliacion', title: 'Conciliación financiera', type: 'item', url: '/inicio/conciliacion', icon: 'fa-solid fa-scale-balanced', classes: 'nav-item' },
      { id: 'control-citas', title: 'Control de citas', type: 'item', url: '/inicio/control-citas', icon: 'fa-solid fa-clock', classes: 'nav-item' },
      { id: 'auditoria-despacho', title: 'Auditoría de despacho', type: 'item', url: '/inicio/auditoria-despacho', icon: 'fa-solid fa-clipboard-check', classes: 'nav-item' },
      /* ---------- Nuevos menus aqui -------------  */
    ]
  },
];

// Los menús anteriores conservan la autorización original del JWT.
// Los nuevos se muestran por rol hasta que se parametrizan en la tabla de menús.
// Esta visibilidad NO sustituye la autorización obligatoria del Backend.
const MODULOS_POR_ROL: Record<string, readonly string[]> = {
  Administrador: [
    'agenda-medica', 'gestion-lotes', 'alertas-inventario',
    'importacion-inventario', 'estado-inventario', 'exportacion-inventario',
    'crear-factura', 'registro-pagos', 'documentos', 'finanzas',
    'conciliacion', 'control-citas', 'auditoria-despacho'
  ],
  Recepcion: ['agenda-medica', 'alertas-inventario', 'estado-inventario', 'control-citas'],
  Medico: ['agenda-medica', 'alertas-inventario', 'estado-inventario'],
  DESPACHO_MEDICO: ['despacho', 'estado-inventario', 'auditoria-despacho']
};

export function getNavigationItems(): NavigationItem[] {
  let allowedCodes: Set<string>;
  try {
    const payload = getJwtPayload();
    if (!payload) return [];
    allowedCodes = new Set(
      getJwtMenus().filter((menu) => menu.activo).map((menu) => menu.code)
    );
    for (const codigo of MODULOS_POR_ROL[payload.rol] ?? []) {
      allowedCodes.add(codigo);
    }
  } catch (error) {
    console.error('No fue posible obtener los menus del token JWT', error);
    return [];
  }

  const filterItems = (items: NavigationItem[]): NavigationItem[] =>
    items.flatMap((item) => {
      if (item.type === 'item') {
        return allowedCodes.has(item.id) ? [{ ...item }] : [];
      }
      const children = filterItems(item.children ?? []);
      return children.length > 0 ? [{ ...item, children }] : [];
    });

  return filterItems(NavigationItems);
}

import { getJwtMenus } from 'src/app/utils/jwt.util';

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
        title: 'Inventario',
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
      { id: 'calendario-medico', title: 'Mi calendario', type: 'item', url: '/inicio/calendario-medico', icon: 'bi bi-calendar-week', classes: 'nav-item' },
      { id: 'atencion', title: 'Atención médica', type: 'item', url: '/inicio/atencion', icon: 'fa-solid fa-stethoscope', classes: 'nav-item' },
      { id: 'carga-inventario', title: 'Carga masiva de inventario', type: 'item', url: '/inicio/carga-inventario', icon: 'fa-solid fa-file-arrow-up', classes: 'nav-item' },
      { id: 'despacho', title: 'Despacho de medicamentos', type: 'item', url: '/inicio/despacho', icon: 'fa-solid fa-truck-medical', classes: 'nav-item' },
      { id: 'historial-despachos', title: 'Historial de despachos', type: 'item', url: '/inicio/historial-despachos', icon: 'fa-solid fa-clock-rotate-left', classes: 'nav-item' },
      { id: 'tarifas', title: 'Tarifas y servicios', type: 'item', url: '/inicio/tarifas', icon: 'fa-solid fa-tags', classes: 'nav-item' },
      { id: 'facturas', title: 'Facturación', type: 'item', url: '/inicio/facturas', icon: 'fa-solid fa-file-invoice-dollar', classes: 'nav-item' },
      { id: 'reportes', title: 'Reportes', type: 'item', url: '/inicio/reportes', icon: 'fa-solid fa-chart-column', classes: 'nav-item' },
      /* ---------- Nuevos menus aqui -------------  */
    ]
  },
];

export function getNavigationItems(): NavigationItem[] {
  let allowedCodes: Set<string>;
  try {
    allowedCodes = new Set(getJwtMenus().filter((menu) => menu.activo).map((menu) => menu.code));
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

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
        id: 'agenda',
        title: 'Mi agenda médica',
        type: 'item',
        url: '/inicio/agenda',
        icon: 'fa-solid fa-calendar-days',
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
      { id: 'inventario', title: 'Inventario', type: 'item', url: '/inicio/inventario', icon: 'fa-solid fa-boxes-stacked', classes: 'nav-item' },
      { id: 'despachos', title: 'Despacho médico', type: 'item', url: '/inicio/despachos', icon: 'fa-solid fa-prescription-bottle-medical', classes: 'nav-item' },
      { id: 'facturacion', title: 'Facturación', type: 'item', url: '/inicio/facturacion', icon: 'fa-solid fa-file-invoice-dollar', classes: 'nav-item' },
      { id: 'reportes', title: 'Reportes', type: 'item', url: '/inicio/reportes', icon: 'fa-solid fa-chart-column', classes: 'nav-item' },
      {
        id: 'usuarios',
        title: 'Gestión de Usuarios',
        type: 'item',
        url: '/inicio/usuarios',
        icon: 'feather icon-users',
        classes: 'nav-item'
      },
      /* ---------- Nuevos menus aqui -------------  */
    ]
  },
];

/** Módulos nuevos que se muestran por rol aunque el menú aún no exista en la tabla de menús de la BD. */
const MODULE_ROLES: Record<string, string[]> = {
  agenda: ['VETERINARIO'],
  inventario: ['ADMINISTRADOR', 'VETERINARIO', 'DESPACHO_MEDICO'],
  despachos: ['ADMINISTRADOR', 'DESPACHO_MEDICO'],
  facturacion: ['ADMINISTRADOR', 'RECEPCIONISTA'],
  reportes: ['ADMINISTRADOR', 'VETERINARIO', 'RECEPCIONISTA']
};

/** DESPACHO_MEDICO solo accede a inventario (consulta) y despacho (Req. 5.1). */
const DESPACHO_ONLY = ['inventario', 'despachos'];

/**
 * Req. 2: el médico ve la nueva agenda en calendario en lugar de la gestión de citas;
 * secretaría (RECEPCIONISTA) y administrador conservan el módulo de citas existente.
 */
function moduleDeniedForRole(id: string, role: string): boolean {
  if (role === 'DESPACHO_MEDICO') return !DESPACHO_ONLY.includes(id);
  if (role === 'VETERINARIO') return id === 'cita';
  return false;
}

export function getNavigationItems(): NavigationItem[] {
  let allowedCodes: Set<string>;
  let role: string;
  try {
    allowedCodes = new Set(getJwtMenus().filter((menu) => menu.activo).map((menu) => menu.code));
    role = getJwtPayload()?.rol.toUpperCase() ?? '';
  } catch (error) {
    console.error('No fue posible obtener los menus del token JWT', error);
    return [];
  }

  const filterItems = (items: NavigationItem[]): NavigationItem[] =>
    items.flatMap((item) => {
      if (item.type === 'item') {
        if (moduleDeniedForRole(item.id, role)) return [];
        const roleAllowsModule = MODULE_ROLES[item.id]?.includes(role) ?? false;
        return allowedCodes.has(item.id) || roleAllowsModule ? [{ ...item }] : [];
      }

      const children = filterItems(item.children ?? []);
      return children.length > 0 ? [{ ...item, children }] : [];
    });

  return filterItems(NavigationItems);
}

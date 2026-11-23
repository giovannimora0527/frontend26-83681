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
<<<<<<< HEAD
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
=======
        id: 'usuario',
        title: 'Gestión de Usuarios',
        type: 'item',
        url: '/inicio/usuarios',
        icon: 'feather icon-user',
        classes: 'nav-item'
      },
      /* ---------- Nuevos menus aqui -------------  */
      {
        id: 'mascota',
        title: 'Gestión de Mascotas',
        type: 'item',
        url: '/inicio/mascotas',
        icon: 'feather icon-heart',
        classes: 'nav-item'
      },
      {
        id: 'cliente',
        title: 'Gestión de Clientes',
        type: 'item',
        url: '/inicio/clientes',
        icon: 'feather icon-users',
        classes: 'nav-item'
      },
      {
        id: 'raza',
        title: 'Gestión de Razas',
        type: 'item',
        url: '/inicio/razas',
        hidden: true, // Oculto por ahora; aún no se necesita.
        icon: 'feather icon-tag',
        classes: 'nav-item'
      },
      {
        id: 'medico',
        title: 'Gestión de Médicos',
        type: 'item',
        url: '/inicio/medicos',
        icon: 'feather icon-user-plus',
        classes: 'nav-item'
      },
      {
        id: 'especializacion',
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
        title: 'Gestión de Especializaciones',
        type: 'item',
        url: '/inicio/especializaciones',
        icon: 'fa-solid fa-user-graduate',
        classes: 'nav-item'
      },
      {
<<<<<<< HEAD
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
=======
        id: 'cita',
        title: 'Gestión de Citas',
        type: 'item',
        url: '/inicio/citas',
        icon: 'feather icon-calendar',
        classes: 'nav-item'
      },
      {
        id: 'historia-medica',
        title: 'Gestión de Historias Médicas',
        type: 'item',
        url: '/inicio/historias-medicas',
        icon: 'feather icon-clipboard',
        classes: 'nav-item'
      },
      {
        id: 'anotacion-historia',
        title: 'Gestión de Anotaciones de Historia',
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
        type: 'item',
        url: '/inicio/historias',
        icon: 'fa-solid fa-book-medical',
        classes: 'nav-item'
      },
      {
<<<<<<< HEAD
        id: 'mascotas',
        title: 'Gestión de Mascotas',
        type: 'item',
        url: '/inicio/mascotas',
        icon: 'fa-solid fa-paw',
=======
        id: 'formula-medica',
        title: 'Gestión de Fórmulas Médicas',
        type: 'item',
        url: '/inicio/formulas-medicas',
        icon: 'feather icon-file-text',
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
        classes: 'nav-item'
      },
      {
        id: 'medicamento',
        title: 'Gestión de Medicamentos',
        type: 'item',
        url: '/inicio/medicamentos',
<<<<<<< HEAD
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
=======
        hidden: true, // Oculto por ahora; aún no se necesita.
        icon: 'feather icon-box',
        classes: 'nav-item'
      },
      {
        id: 'session',
        title: 'Gestión de Sesiones',
        type: 'item',
        url: '/inicio/sesiones',
        hidden: true, // Oculto por ahora; aún no se necesita.
        icon: 'feather icon-lock',
        classes: 'nav-item'
      },
>>>>>>> 2c629aa81f5ed56d21d4e0b867ceab67000b1be3
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

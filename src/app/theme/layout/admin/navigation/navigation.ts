import { getJwtMenus, getJwtPayload } from 'src/app/utils/jwt.util';

/** Define las propiedades de una opción o grupo del menú lateral. */
export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  /** Parámetros de ruta que el item comparte con su componente de destino. */
  queryParams?: Record<string, string>;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;

  children?: NavigationItem[];
}
/** Define las opciones de navegación a las que se aplican los permisos de la sesión. */
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
        exactMatch: true,
        title: 'Gestión de Medicamentos',
        type: 'item',
        url: '/inicio/medicamentos',
        icon: 'fa-solid fa-capsules',
        classes: 'nav-item'
      },
      {
        id: 'inventario',
        exactMatch: true,
        title: 'Gestión de Inventario',
        type: 'item',
        url: '/inicio/medicamentos',
        queryParams: { modulo: 'inventario' },
        icon: 'bi bi-boxes',
        classes: 'nav-item'
      },
      {
        id: 'despacho',
        exactMatch: true,
        title: 'Gestión de Despacho',
        type: 'item',
        url: '/inicio/medicamentos',
        queryParams: { modulo: 'despacho' },
        icon: 'bi bi-clipboard2-check',
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
      {
        id: 'calendario-medico',
        title: 'Mi agenda (calendario)',
        type: 'item',
        url: '/inicio/calendario-medico',
        icon: 'fa-solid fa-calendar-days',
        classes: 'nav-item'
      },
      {
        id: 'atencion-medica',
        title: 'Atención médica',
        type: 'item',
        url: '/inicio/atencion-medica',
        icon: 'fa-solid fa-stethoscope',
        classes: 'nav-item'
      },
      {
        id: 'tarifas',
        title: 'Especialidades y tarifas',
        type: 'item',
        url: '/inicio/tarifas',
        icon: 'fa-solid fa-tags',
        classes: 'nav-item'
      },
      {
        id: 'facturacion',
        title: 'Facturación y pagos',
        type: 'item',
        url: '/inicio/facturacion',
        icon: 'fa-solid fa-file-invoice-dollar',
        classes: 'nav-item'
      },
      {
        id: 'reportes',
        title: 'Reportes PDF y Excel',
        type: 'item',
        url: '/inicio/reportes',
        icon: 'fa-solid fa-chart-column',
        classes: 'nav-item'
      },
    ]
  },
];

/** Construye el menú visible a partir del perfil y de las opciones autorizadas. */
export function getNavigationItems(): NavigationItem[] {
  // El administrador puede navegar todos los módulos; el backend conserva la autorización de cada API.
  try {
    const rol = getJwtPayload()?.rol ?? '';
    const rolNormalizado = rol.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\s-]+/g, '_').toUpperCase();
    if (rolNormalizado === 'ADMIN' || rolNormalizado === 'ADMINISTRADOR') {
      return NavigationItems.map((item) => ({
        ...item,
        children: item.children?.filter((child) => !['calendario-medico', 'atencion-medica', 'despacho'].includes(child.id))
          .map((child) => ({ ...child }))
      }));
    }
  } catch (error) {
    console.error('No fue posible obtener el perfil del token JWT', error);
    return [];
  }

  // Los otros perfiles conservan los menús activos que entrega el backend en el JWT.
  let allowedCodes: Set<string>;
  try {
    allowedCodes = new Set(getJwtMenus().filter((menu) => menu.activo).map((menu) => menu.code));
    if (allowedCodes.has('inventario-lotes')) allowedCodes.add('inventario');
  } catch (error) {
    console.error('No fue posible obtener los menus del token JWT', error);
    return [];
  }

  /** Aplica los permisos a las opciones y sus grupos del menú. */
  const filterItems = (items: NavigationItem[]): NavigationItem[] =>
    items.flatMap((item) => {
      if (item.type === 'item') {
        const agendaAsignada = allowedCodes.has('calendario-medico');
        return allowedCodes.has(item.id) && !(item.id === 'cita' && agendaAsignada) ? [{ ...item }] : [];
      }

      const children = filterItems(item.children ?? []);
      return children.length > 0 ? [{ ...item, children }] : [];
    });

  return filterItems(NavigationItems);
}

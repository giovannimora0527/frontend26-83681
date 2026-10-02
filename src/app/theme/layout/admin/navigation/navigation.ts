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
        icon: 'feather icon-github',
        classes: 'nav-item'
      },
      {
        id: 'citas',
        title: 'Gestión de Citas',
        type: 'item',
        url: '/inicio/citas',
        classes: 'nav-item',
        icon: 'feather icon-calendar'
      },
      {
        id: 'clientes',
        title: 'Gestión de Clientes',
        type: 'item',
        url: '/inicio/clientes',
        classes: 'nav-item',
        icon: 'feather icon-users'
      },
      {
        id: 'medicos',
        title: 'Gestión de Médicos',
        type: 'item',
        url: '/inicio/medicos',
        classes: 'nav-item',
        icon: 'feather icon-user-plus'
      },
      {
        id: 'especializaciones',
        title: 'Gestión de Especializaciones',
        type: 'item',
        url: '/inicio/especializaciones',
        classes: 'nav-item',
        icon: 'feather icon-award'
      },
      {
        id: 'historias-medicas',
        title: 'Historias Médicas',
        type: 'item',
        url: '/inicio/historias-medicas',
        classes: 'nav-item',
        icon: 'feather icon-clipboard'
      },
      {
        id: 'anotaciones-historias',
        title: 'Anotaciones Clínicas',
        type: 'item',
        url: '/inicio/anotaciones-historias',
        classes: 'nav-item',
        icon: 'feather icon-edit'
      },
      {
        id: 'formulas-medicas',
        title: 'Fórmulas Médicas',
        type: 'item',
        url: '/inicio/formulas-medicas',
        classes: 'nav-item',
        icon: 'feather icon-file-text'
      },
      {
        id: 'medicamentos',
        title: 'Gestión de Medicamentos',
        type: 'item',
        url: '/inicio/medicamentos',
        classes: 'nav-item',
        icon: 'feather icon-box'
      },
      {
        id: 'razas',
        title: 'Gestión de Razas',
        type: 'item',
        url: '/inicio/razas',
        classes: 'nav-item',
        icon: 'feather icon-target'
      }
    ]
  },  
];
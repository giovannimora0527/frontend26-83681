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
      {
        id: 'mascotas',
        title: 'Gestión de Mascotas',
        type: 'item',
        url: '/inicio/mascotas',
        icon: 'bi bi-person-lines-fill',
        classes: 'nav-item'
      },
      /* ---------- Nuevos menus aqui -------------  */ 
      {
        id: 'medicos',
        title: 'Gestión de Medicos',
        type: 'item',
        url: '/inicio/medicos',
        icon: 'feather icon-users',
        classes: 'nav-item'
      },
      {
      id: 'medicos',
      title: 'Gestión de Médicos',
      type: 'item',
      url: '/inicio/medicos',
      icon: 'feather icon-user-plus',
      classes: 'nav-item'
      },
      {
      id: 'citas',
      title: 'Gestión de Citas',
      type: 'item',
      url: '/inicio/citas',
      icon: 'feather icon-calendar',
      classes: 'nav-item'
      },
      {
        id: 'especializaciones',
        title: 'Gestión de Especializaciones',
        type: 'item',
        url: '/inicio/especializaciones',
        icon: 'feather icon-award',
        classes: 'nav-item'
      },
      {
        id: 'historias-medicas',
        title: 'Historias Médicas',
        type: 'item',
        url: '/inicio/historias-medicas',
        icon: 'feather icon-clipboard',
        classes: 'nav-item'
      },
      {
        id: 'anotaciones-historias',
        title: 'Anotaciones Clínicas',
        type: 'item',
        url: '/inicio/anotaciones-historias',
        icon: 'feather icon-edit',
        classes: 'nav-item'
      },
      {
        id: 'formulas-medicas',
        title: 'Fórmulas Médicas',
        type: 'item',
        url: '/inicio/formulas-medicas',
        icon: 'feather icon-file-text',
        classes: 'nav-item'
      },
      {
        id: 'medicamentos',
        title: 'Gestión de Medicamentos',
        type: 'item',
        url: '/inicio/medicamentos',
        icon: 'feather icon-box',
        classes: 'nav-item'
      },
      {
        id: 'razas',
        title: 'Gestión de Razas',
        type: 'item',
        url: '/inicio/razas',
        icon: 'feather icon-target',
        classes: 'nav-item'
      }


    ]
  },  
];

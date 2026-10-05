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
        title: 'Razas',
        type: 'item',
        url: '/inicio/razas',
        icon: 'feather icon-tag',
        classes: 'nav-item'
      },
    ]
  },
  {
    id: 'atencion',
    title: 'Atención médica',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'cita',
        title: 'Citas',
        type: 'item',
        url: '/inicio/citas',
        icon: 'feather icon-calendar',
        classes: 'nav-item'
      },
      {
        id: 'historia',
        title: 'Historias médicas',
        type: 'item',
        url: '/inicio/historias',
        icon: 'feather icon-file-text',
        classes: 'nav-item'
      },
      {
        id: 'formula',
        title: 'Fórmulas médicas',
        type: 'item',
        url: '/inicio/formulas',
        icon: 'feather icon-clipboard',
        classes: 'nav-item'
      },
    ]
  },
  {
    id: 'clinica',
    title: 'Clínica',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'medicos',
        title: 'Gestión de Médicos',
        type: 'item',
        url: '/inicio/medicos',
        icon: 'feather icon-activity',
        classes: 'nav-item'
      },
      {
        id: 'especializacion',
        title: 'Especializaciones',
        type: 'item',
        url: '/inicio/especializaciones',
        icon: 'feather icon-award',
        classes: 'nav-item'
      },
      {
        id: 'medicamento',
        title: 'Medicamentos',
        type: 'item',
        url: '/inicio/medicamentos',
        icon: 'feather icon-package',
        classes: 'nav-item'
      },
      {
        id: 'veterinaria',
        title: 'Ver página pública',
        type: 'item',
        url: '/veterinaria',
        icon: 'feather icon-globe',
        classes: 'nav-item'
      },
    ]
  },
];

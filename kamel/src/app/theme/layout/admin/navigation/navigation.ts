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
        id: 'anotacion',
        title: 'Anotaciones de Historias',
        type: 'item',
        url: '/inicio/anotaciones',
        icon: 'feather icon-user',
        classes: 'nav-item'
      },
      {
        id: 'cita',
        title: 'Citas',
        type: 'item',
        url: '/inicio/citas',
        icon: 'feather icon-user',
        classes: 'nav-item'
      },
      {
        id: 'cliente',
        title: 'Clientes',
        type: 'item',
        url: '/inicio/clientes',
        icon: 'feather icon-user',
        classes: 'nav-item'
      },
      {
        id: 'especializacion',
        title: 'Especializaciones',
        type: 'item',
        url: '/inicio/especializaciones',
        icon: 'feather icon-user',
        classes: 'nav-item'
      },
      {
        id: 'formula',
        title: 'Fórmulas Médicas',
        type: 'item',
        url: '/inicio/formulas',
        icon: 'feather icon-user',
        classes: 'nav-item'
      },
      {
        id: 'historia',
        title: 'Historias Médicas',
        type: 'item',
        url: '/inicio/historias',
        icon: 'feather icon-user',
        classes: 'nav-item'
      },
      {
        id: 'mascota',
        title: 'Gestión de Mascotas',
        type: 'item',
        url: '/inicio/mascotas',
        icon: 'feather icon-user',
        classes: 'nav-item'
      },
      {
        id: 'medicamento',
        title: 'Medicamentos',
        type: 'item',
        url: '/inicio/medicamentos',
        icon: 'feather icon-user',
        classes: 'nav-item'
      },
      {
        id: 'medico',
        title: 'Medicos',
        type: 'item',
        url: '/inicio/medicos',
        icon: 'feather icon-user',
        classes: 'nav-item'
      },
      {
        id: 'raza',
        title: 'Razas',
        type: 'item',
        url: '/inicio/razas',
        icon: 'feather icon-user',
        classes: 'nav-item'
      },
      {
        id: 'sesion',
        title: 'Sesiones',
        type: 'item',
        url: '/inicio/sesiones',
        icon: 'feather icon-user',
        classes: 'nav-item'
      }
    ]
  },   
];

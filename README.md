[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Price](https://img.shields.io/badge/price-FREE-0098f7.svg)](https://codedthemes.com/item/datta-able-angular-lite/)
[![GitHub package version](https://img.shields.io/github/package-json/v/codedthemes/datta-able-free-angular-admin-template)](https://github.com/codedthemes/datta-able-free-angular-admin-template/)

| -------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| **9** Demo pages                                                                                   | **45+** demo pages                                                |
| -                                                                                                  | ✓ Multi-language                                                  |
| -                                                                                                  | ✓ Dark/Light Mode 🌓                                              |
| -                                                                                                  | ✓ TypeScript version                                              |
| -                                                                                                  | ✓ 6+ color Options                                                |
| -                                                                                                  | ✓ RTL                                                             |
| ✓ MIT License                                                                                      | ✓ [Pro License](https://codedthemes.com/item/datta-able-angular/?utm_source=free_demo&utm_medium=codedthemes&utm_campaign=button_download_premium) |

#### Preview

- [Demo](https://codedthemes.com/demos/admin-templates/datta-able/angular/free/dashboard)

#### Download

- [Download from GitHub](https://github.com/codedthemes/datta-able-free-angular-admin-template)

## Datta Able Pro version

#### Preview

- [Demo](https://codedthemes.com/demos/admin-templates/datta-able/angular/default/)

#### Purchase

- [Purchase from CodedThemes](https://codedthemes.com/item/datta-able-angular/?utm_source=free_demo&utm_medium=codedthemes&utm_campaign=button_download_premium)

## Table of contents

- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Technology Stack](#technology-stack)
- [Author](#author)
- [Issues?](#issues)
- [License](#license)
- [More Free Angular Templates](#more-free-angular-dashboard-templates)
- [More Pro Angular Templates](#more-premium-angular-dashboard-templates)
- [Follow us](#follow-us)

## Getting Started

1. Clone from Github

```
git clone https://github.com/codedthemes/datta-able-free-angular-admin-template.git
```

2. Install packages

```
yarn
```

3. Run project

```
yarn start
```

## Documentation

[Datta Able Angular Documentation](https://codedthemes.gitbook.io/datta-angular/) helps you with installation, deployment, and troubleshooting.

### Gestion de citas

La vista de citas permite crear y editar registros en un modal, seleccionar una mascota
y un medico, e ingresar fecha, hora y motivo (entre 6 y 255 caracteres).
Las citas nuevas se envian con estado `programada`, sin selector de estado.
En edicion se conserva el estado actual y solo se puede cambiar a `cancelada`
o `confirmada`. Las citas que ya estan canceladas no permiten editarse ni guardar
actualizaciones. Una cita activa si puede cambiarse a cancelada.
El boton "Ver" abre un modal de solo lectura con los datos disponibles
de la cita, mascota, medico y cliente, incluso en citas canceladas. El modal solo
incluye el boton "Cerrar". La tabla permite ordenar por
columna, buscar por los datos visibles sin distinguir acentos y navegar en paginas
de cinco registros. Los errores de carga y guardado se muestran en la vista.
Los estados se muestran en amarillo (programada), rojo (cancelada), anaranjado
(pendiente) o verde (confirmada y atendida); los demas estados usan un fondo neutro.
La fecha final del modal se calcula automaticamente 15 minutos despues del inicio.
El boton "Consultar medicos disponibles" consulta ese intervalo y carga el selector.
Cambiar el inicio limpia la disponibilidad y el medico seleccionado. Al editar sin
cambiar el horario se conserva el medico asignado. La cita sigue enviando su inicio
en `fechaHora`; la fecha final se usa para consultar disponibilidad.
La consulta GET a `/medico/listar-disponibles` envia `fechaInicio` y `fechaFin`
como parametros en formato `yyyy-MM-ddTHH:mm:ss`, sin zona horaria ni conversion
a UTC, compatibles con `LocalDateTime` del backend.

### Historias medicas

Cada anotacion nueva requiere descripcion, `diagnostico` y `observaciones`;
ninguno puede contener solo espacios. Los textos se envian sin espacios en los
extremos, junto con los identificadores de historia, cita y veterinario.
La tabla muestra el diagnostico y las observaciones de la anotacion mas reciente
y permite ordenar por ambos campos. La busqueda ignora mayusculas y acentos e
incluye estos campos en todas las anotaciones, incluso las anteriores.
El detalle muestra ambos campos en cada anotacion; los registros antiguos que
no los incluyan se muestran como "No informado".

## Technology Stack

- Bootstrap 5
- Angular 18

## Author

Datta Able is developed by Team [CodedThemes](https://codedthemes.com).

## Issues

To report a bug, please submit an [issue](https://github.com/codedthemes/datta-able-free-angular-admin-template/issues) on Github. We will respond as soon as possible to resolve the issue.

## License

- Licensed cover under [MIT](https://github.com/codedthemes/datta-able-free-angular-admin-template/blob/master/LICENSE)

## Datta Able - React version

- [Free](https://lite.codedthemes.com/datta-able/react/default/dashboard/default)
- [Premium](https://codedthemes.com/item/datta-able-react-admin-template/?utm_source=free_demo&utm_medium=codedthemes&utm_campaign=button_download_premium)

## More Free Angular Dashboard Templates

- [Mantis Angular](https://codedthemes.com/item/mantis-angular-free-admin-template/)
- [Gradient Able Angular](https://codedthemes.com/item/gradient-able-angular-free-admin-template/)
- [Next Angular](https://codedthemes.com/item/next-free-admin-template/)
- [Berry Angular](https://codedthemes.com/item/berry-angular-free-admin-template/)

## More Premium Angular Dashboard Templates

- [Mantis Angular Pro](https://codedthemes.com/item/mantis-angular-admin-template/?utm_source=free_demo&utm_medium=codedthemes&utm_campaign=button_download_premium)
- [Gradient Able Angular Pro](https://codedthemes.com/item/gradient-able-angular-admin-template/?utm_source=free_demo&utm_medium=codedthemes&utm_campaign=button_download_premium)
- [Next Angular Pro](https://codedthemes.com/item/next-angular-admin-template/)
- [Berry Angular Pro](https://codedthemes.com/item/berry-angular-admin-dashboard-template/?utm_source=free_demo&utm_medium=codedthemes&utm_campaign=button_download_premium)

## Follow us

- Website [https://codedthemes.com/demos/admin-templates/datta-able/angular/default](https://codedthemes.com/demos/admin-templates/datta-able/angular/default)
- Blog [https://blog.codedthemes.com/](https://blog.codedthemes.com/)
- CodedThemes [https://codedthemes.com](https://codedthemes.com)
- Dribbble [https://dribbble.com/codedthemes](https://dribbble.com/codedthemes)
- Facebook [https://www.facebook.com/codedthemes](https://www.facebook.com/codedthemes)
- Twitter [https://twitter.com/codedthemes](https://twitter.com/codedthemes)

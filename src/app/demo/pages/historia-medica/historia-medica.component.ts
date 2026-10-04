import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

// Las historias medicas las crea el backend al registrar la primera anotacion de una mascota.
// Cuando exista el endpoint historia-medica/listar, aqui se agrega el servicio y la tabla.
@Component({
  selector: 'app-historia-medica',
  imports: [RouterModule],
  templateUrl: './historia-medica.component.html',
  styleUrl: './historia-medica.component.scss'
})
export class HistoriaMedicaComponent {}

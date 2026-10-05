import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importa los objetos necesarios de Bootstrap
declare var bootstrap: any;

@Component({
  selector: 'app-mascota',
  imports: [CommonModule],
  templateUrl: './mascota.component.html',
  styleUrl: './mascota.component.scss'
})
export class MascotaComponent {

  title: string = "Mi titulo personalizado de mascotas";


  saludar() {
     alert("Hola mundos");
     console.log("Saludando por consola");
  }

}

import { Component } from '@angular/core';

@Component({
  selector: 'app-mascota',
  imports: [],
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

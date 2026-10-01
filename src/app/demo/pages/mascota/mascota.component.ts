import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MascotaServiceService } from './service/mascota-service.service';
import { Mascota } from 'src/app/models/mascota';

@Component({
  selector: 'app-mascota',
  imports: [CommonModule],
  templateUrl: './mascota.component.html',
  styleUrl: './mascota.component.scss'
})
export class MascotaComponent {

  listMascotas: Mascota[] = [];

  constructor(private readonly mascotaService: MascotaServiceService) {
     this.listar();
  }

  listar() {
    this.mascotaService.getMascotas()
      .subscribe(
        {
          next: (data) => {
            console.log(data);
            this.listMascotas = data;
          },
          error: (error) => {
            console.error('Error al obtener las mascotas:', error);
          }
        }
      );
  }


}

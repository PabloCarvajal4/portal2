import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';

import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ComprobantePagoComponent } from './components/comprobante-pago/comprobante-pago.component';
import { ConsultaVacacionesComponent } from './components/consulta-vacaciones/consulta-vacaciones.component';
import { ConsultaSolicitudesComponent } from './components/consulta-solicitudes/consulta-solicitudes.component';
import { SolicitudVacacionesComponent } from './components/solicitud-vacaciones/solicitud-vacaciones.component';
import { SolicitudPermisosComponent } from './components/solicitud-permisos/solicitud-permisos.component';
import { SolicitudCarnetComponent } from './components/solicitud-carnet/solicitud-carnet.component';
import { IncapacidadesComponent } from './components/incapacidades/incapacidades.component';
import { ConstanciasComponent } from './components/constancias/constancias.component';
import { AprobacionSolicitudesComponent } from './components/aprobacion-solicitudes/aprobacion-solicitudes.component';
import { DenunciaComponent } from './components/denuncia/denuncia.component';
import { BuzonSugerenciaComponent } from './components/buzon-sugerencia/buzon-sugerencia.component';
import { CambioPasswordComponent } from './components/cambio-password/cambio-password.component';
import { CambiarFotoComponent } from './components/cambiar-foto/cambiar-foto.component';
import { PruebaComponent } from './components/prueba/prueba.component';
import { HomeAdminComponent } from './components/home-admin/home-admin.component';
import { HomeDdhhComponent } from './components/home-ddhh/home-ddhh.component';
import { SugerenciasRecibidasComponent } from './components/sugerencias-recibidas/sugerencias-recibidas.component';
import { IncapacidadesRegistradasComponent } from './components/incapacidades-registradas/incapacidades-registradas.component';
import { DenunciasRegistradasComponent } from './components/denuncias-registradas/denuncias-registradas.component';
import { SolicitudesRespondidasComponent } from './components/solicitudes-respondidas/solicitudes-respondidas.component';
import { DashboardsComponent } from './components/dashboards/dashboards.component';
import { ConstanciasGeneradasComponent } from './components/constancias-generadas/constancias-generadas.component';
import { RestablecerPasswordComponent } from './components/restablecer-password/restablecer-password.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'home/:codigo_colaborador',
    component: HomeComponent, canActivate: [AuthGuard]
  },
  {
    path: 'home-admin/:codigo_colaborador',
    component: HomeAdminComponent, canActivate: [AuthGuard]
  },
  {
    path: 'home-ddhh/:codigo_colaborador',
    component: HomeDdhhComponent, canActivate: [AuthGuard],
  },
  {
    path: 'comprobante-pago/:codigo_colaborador',
    component: ComprobantePagoComponent, canActivate: [AuthGuard]
  },
  {
    path: 'consulta-vacaciones/:codigo_colaborador',
    component: ConsultaVacacionesComponent, canActivate: [AuthGuard]
  },
  {
    path: 'consulta-solicitudes/:codigo_colaborador',
    component: ConsultaSolicitudesComponent, canActivate: [AuthGuard]
  },
  {
    path: 'solicitud-vacaciones/:codigo_colaborador',
    component: SolicitudVacacionesComponent, canActivate: [AuthGuard]
  },
  {
    path: 'solicitud-permisos/:codigo_colaborador',
    component: SolicitudPermisosComponent, canActivate: [AuthGuard]
  },
  {
    path: 'solicitud-carnet/:codigo_colaborador',
    component: SolicitudCarnetComponent, canActivate: [AuthGuard]
  },
  {
    path: 'incapacidades/:codigo_colaborador',
    component: IncapacidadesComponent, canActivate: [AuthGuard]
  },
  {
    path: 'incapacidades-registradas/:codigo_colaborador',
    component: IncapacidadesRegistradasComponent, canActivate: [AuthGuard]
  },
  {
    path: 'constancias/:codigo_colaborador',
    component: ConstanciasComponent, canActivate: [AuthGuard]
  },
  {
    path: 'aprobacion-solicitudes/:codigo_colaborador',
    component: AprobacionSolicitudesComponent, canActivate: [AuthGuard]
  },
  {
    path: 'denuncia/:codigo_colaborador',
    component: DenunciaComponent, canActivate: [AuthGuard]
  },
  {
    path: 'denuncias-registradas/:codigo_colaborador',
    component: DenunciasRegistradasComponent, canActivate: [AuthGuard]
  },
  {
    path: 'buzon-sugerencia/:codigo_colaborador',
    component: BuzonSugerenciaComponent, canActivate: [AuthGuard]
  },
  {
    path: 'cambio-password/:codigo_colaborador',
    component: CambioPasswordComponent, canActivate: [AuthGuard]
  },
  {
    path: 'cambiar-foto/:codigo_colaborador',
    component: CambiarFotoComponent, canActivate: [AuthGuard]
  },
  {
    path: 'sugerencias-recibidas/:codigo_colaborador',
    component: SugerenciasRecibidasComponent, canActivate: [AuthGuard]
  },
  {
    path: 'solicitudes/:codigo_colaborador',
    component: SolicitudesRespondidasComponent, canActivate: [AuthGuard]
  },
  {
    path: 'dashboards/:codigo_colaborador',
    component: DashboardsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'constancias-generadas/:codigo_colaborador',
    component: ConstanciasGeneradasComponent, canActivate: [AuthGuard]
  },
  {
    path: 'restablecer-contrasena/:codigo_colaborador',
    component: RestablecerPasswordComponent, canActivate: [AuthGuard]
  },
  {
    path: 'prueba',
    component: PruebaComponent, canActivate: [AuthGuard]
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

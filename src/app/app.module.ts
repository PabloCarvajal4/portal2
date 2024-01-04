import { ChangeDetectorRef, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { NgToastModule } from 'ng-angular-popup';
import { DatePipe } from '@angular/common';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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

import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { CambioPasswordComponent } from './components/cambio-password/cambio-password.component';
import { CambiarFotoComponent } from './components/cambiar-foto/cambiar-foto.component';
import { PruebaComponent } from './components/prueba/prueba.component';
import { VacacionesPipe } from './pipes/vacaciones.pipe';
import { DepartamentoPipe } from './pipes/departamento.pipe';
import { HomeAdminComponent } from './components/home-admin/home-admin.component';
import { HomeDdhhComponent } from './components/home-ddhh/home-ddhh.component';
import { SugerenciasRecibidasComponent } from './components/sugerencias-recibidas/sugerencias-recibidas.component';
import { IncapacidadesRegistradasComponent } from './components/incapacidades-registradas/incapacidades-registradas.component';
import { IncapacidadesPipe } from './pipes/incapacidades.pipe';
import { DenunciasRegistradasComponent } from './components/denuncias-registradas/denuncias-registradas.component';
import { DenunciasPipe } from './pipes/denuncias.pipe';
import { SolicitudesRespondidasComponent } from './components/solicitudes-respondidas/solicitudes-respondidas.component';
import { DashboardsComponent } from './components/dashboards/dashboards.component';
import { ConstanciasGeneradasComponent } from './components/constancias-generadas/constancias-generadas.component';
import { ConstanciasPipe } from './pipes/constancias.pipe';
import { TipoConstanciaPipe } from './pipes/tipo-constancia.pipe';
import { TipoSolicitudPipe } from './pipes/tipo-solicitud.pipe';
import { RestablecerPasswordComponent } from './components/restablecer-password/restablecer-password.component';
import { LimitePipe } from './pipes/limite.pipe';


@NgModule({
  declarations: [
    AppComponent,
    VacacionesPipe,
    LoginComponent,
    HomeComponent,
    ComprobantePagoComponent,
    ConsultaVacacionesComponent,
    ConsultaSolicitudesComponent,
    SolicitudVacacionesComponent,
    SolicitudPermisosComponent,
    SolicitudCarnetComponent,
    IncapacidadesComponent,
    ConstanciasComponent,
    AprobacionSolicitudesComponent,
    DenunciaComponent,
    BuzonSugerenciaComponent,
    CambioPasswordComponent,
    CambiarFotoComponent,
    PruebaComponent,
    VacacionesPipe,
    DepartamentoPipe,
    HomeAdminComponent,
    HomeDdhhComponent,
    SugerenciasRecibidasComponent,
    IncapacidadesRegistradasComponent,
    IncapacidadesPipe,
    DenunciasRegistradasComponent,
    DenunciasPipe,
    SolicitudesRespondidasComponent,
    DashboardsComponent,
    ConstanciasGeneradasComponent,
    ConstanciasPipe,
    TipoConstanciaPipe,
    TipoSolicitudPipe,
    RestablecerPasswordComponent,
    LimitePipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgToastModule,
    ToastrModule.forRoot()
  ],
  providers: [DatePipe, {provide:LocationStrategy, useClass:HashLocationStrategy}],
  bootstrap: [AppComponent, DashboardsComponent]
})
export class AppModule { }

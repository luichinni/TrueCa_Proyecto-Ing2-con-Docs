import './App.css';
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar";
import Header from './components/Header';
import ListarCentro from './pages/centros/ListarCentro';
import AgregarCategoria from './pages/categorias/AgregarCategoria';
import Dashboard from "./pages/Dashboard";
import Registrarse from './pages/sesion/Registrarse';
import IniciarSesion from './pages/sesion/IniciarSesion';
import AgregarPublicacion from './pages/publicaciones/CargarPublicacion';
import AgregarCentro from './pages/centros/AgregarCentro';
import MisPublis from './pages/publicaciones/MisPublicaciones';
import ListarCategoria from './pages/categorias/ListarCategoria';
import DeleteCategoria from './pages/categorias/deleteCategoria';
import PubliDetalle from './pages/publicaciones/PubliDetalle';
import Explorar from './pages/publicaciones/Explorar';
import InterPublicacion from './pages/Intercambios/InterPublicacion';
import InterCentroHorario from './pages/Intercambios/InterCentroHorario';
import ListarUsuario from './pages/sesion/ListarUsuarios';
import ValidarIntercambio from './pages/Intercambios/ValidarIntercambio';
import ListarIntercambios from './pages/Intercambios/listarIntercambios';
import Configuracion from './components/configuracion'
import ModificarInter from './pages/Intercambios/ModificarInter';
import IntercambiosEstats from './pages/Estadisticas/IntercambiosEstats';
import DeleteCentro from './pages/centros/DeleteCentro';
import DeleteComentario from './pages/Comentarios/DeleteComentario';
import ModificarPublicacion from './pages/publicaciones/ModificarPublicacion';
import ListarPublisUsuario from './pages/publicaciones/PublisUsuario';
import ModificarUsuario from './pages/sesion/ModificarUsuario';
import ModificarCentro from './pages/centros/ModificarCentro';
import PuntuarUsuario from './pages/sesion/PuntuarUsuario';


function App() {
  return (
    <div>
      <BrowserRouter>
        <div>
          <div>
            <Header/>
            <NavBar/>
          </div>
          <div>
              <Routes>
                <Route path={"/"} element={<Dashboard />} />
                <Route path={"/MisPublicaciones"} element={<MisPublis />} />
                <Route path={"/PubliDetalle/:id"} element={<PubliDetalle/>} />
                <Route path={"/Explorar"} element={<Explorar/>} />
                <Route path={"/ModificarPublicacion/:id"} element={<ModificarPublicacion/>} />
                <Route path={"/PubliUsuario/:username"} element={<ListarPublisUsuario />} />

                <Route path={"/Registrarse"} element={<Registrarse />} />
                <Route path={"/IniciarSesion"} element={<IniciarSesion />} />
                <Route path={"/Usuarios"} element={<ListarUsuario/>} />
                <Route path={"/ModificarUsuario/:username"} element={<ModificarUsuario />}/>

                <Route path={"/agregarPublicacion"} element={<AgregarPublicacion />} />
                
                <Route path={"/agregarCentro"} element={<AgregarCentro />} />
                <Route path={"/Centros"} element={<ListarCentro />} />
                <Route path={"/DeleteCentro/:id"} element={<DeleteCentro />} />
                <Route path={"/ModificarCentro/:id"} element={<ModificarCentro />} />

                <Route path={"/DeleteComentario/:id"} element={<DeleteComentario />} />
                { //<Route path={"/EditarComentario/:id"} element={<EditarComentario />} />
                  }

                <Route path={"/AgregarCategoria"} element={<AgregarCategoria />} />
                <Route path={"/Categorias"} element={<ListarCategoria/> }/>
                <Route path={"/deleteCategoria/:id"} element={<DeleteCategoria />} />

                <Route path={"/InterSelePubli"} element={<InterPublicacion />} />
                <Route path={"/InterSeleCentHor"} element={<InterCentroHorario />} />
                <Route path={"/ValidarIntercambio"} element={<ValidarIntercambio />} />
                <Route path={"/Intercambios"} element={<ListarIntercambios />} />
                <Route path={"/ModificarInter/:interId/:publiId"} element={<ModificarInter />} />

                <Route path={"/config"} element={<Configuracion />} />
                <Route path={'/PuntuarUsuario/:publicacionOferta/:publicacionOfertada/:publicacion'} element={<PuntuarUsuario />} />
                <Route path={"/Estadisticas"} element={<IntercambiosEstats />} />

              </Routes>
          </div>
        </div>
      </BrowserRouter>
    </div>
  )
}

export default App;
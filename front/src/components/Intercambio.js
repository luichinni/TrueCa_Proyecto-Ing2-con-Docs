import "../HarryStyles/Intercambios.css";
import "../HarryStyles/Publicaciones.css"
import React, { useEffect, useState } from "react";
import axios from 'axios';
import {Link, useNavigate } from "react-router-dom";
import Publicacion from "./Publicacion";
import PuntuarUsuario from "../pages/sesion/PuntuarUsuario";

const Intercambio = ({ id, publicacionOferta, publicacionOfertada, centro, horario, estado, ofertaAcepta, ofertadaAcepta }) => {
  const [publi1, setPubli1] = useState([]);
  const [publi2, setPubli2] = useState([]);
  const [userPubli, setUserPubli] = useState('');
  const [userOferto, setUserOferto] = useState('');
  const [error, setError] = useState('');
  const username = localStorage.getItem('username');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const Token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        
        const url1 = `http://localhost:8000/public/listarPublicaciones?id=${publicacionOferta}&token=${Token}`;
        const response1 = await axios.get(url1);
        
        if (response1.data) {
          const publicaciones = procesar(response1.data);
          setPubli1(publicaciones);
          const userPub = publicaciones[0]?.user || 'nop';
          setUserPubli(userPub);
    
        } else {
          setError('No hay publicaciones disponibles.');
          setPubli1([]);
          setUserPubli('nop');
        }
      } catch (error) {
        setError('No hay publicaciones disponibles.');
        console.error(error);
      }

      try {
        const url2 = `http://localhost:8000/public/listarPublicaciones?id=${publicacionOfertada}&token=${Token}`;
        const response2 = await axios.get(url2);

        if (response2.data) {
          const publicaciones = procesar(response2.data);
          setPubli2(publicaciones);
          const userOfer = publicaciones[0]?.user || 'nop';
          setUserOferto(userOfer);
          console.log(`userOferto: ${userOfer}`);
        } else {
          setError('No hay publicaciones disponibles.');
          setPubli2([]);
          setUserOferto('nop');
        }
      } catch (error) {
        setError('No hay publicaciones disponibles.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicacionOferta, publicacionOfertada, Token]);

  function procesar(publicaciones) {
    let publisCopy = [];
    Object.keys(publicaciones).forEach(function (clave) {
      if (!isNaN(clave)) {
        publisCopy.push(publicaciones[clave]);
      }
    });
    return publisCopy;
  }

  const handleValidarClick = () => {
    localStorage.setItem('idValidar', id);
    navigate(`../ValidarIntercambio`);
  };

  const handleRechazadoClick = async () => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('setestado', 'rechazado');
      const respon = await axios.put(`http://localhost:8000/public/updateIntercambio`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (respon.data.length === 3) {
        setError('No se realizó la modificación.');
      } else {
        window.location.reload();
      }
    } catch (error) {
      setError('No se pudo rechazar el intercambio.');
      console.error(error);
    }
  };

  const handleAceptadoClick = async () => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('setestado', 'aceptado');
      const respon = await axios.put(`http://localhost:8000/public/updateIntercambio`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (respon.data.length === 3) {
        setError('No se realizó la modificación.');
      } else {
        window.location.reload();
      }
    } catch (error) {
      setError('No se pudo aceptar el intercambio.');
      console.error(error);
    }
  };

  const handleModificarClick = () => {
    navigate(`../ModificarInter/${id}/${publi1[0]?.id}`);
  };

  const PuntuarUsuario = () =>{
    let pOferta=publi1[0].id 
    let pOfertada=publi2[0].id
    
    navigate(`../PuntuarUsuario/${pOferta}/${pOfertada}`);
  }

  return (
    <li className="intercambio-item">
      <br/><br/><br/><br/>
      <div className="intercambio-content">
        <div className="publicaciones-container">
          <div className="publicacioninter">
            Publicación
            {publi1.map(publicacion => (
              <Publicacion
                key={publicacion.id}
                id={publicacion.id}
                nombre={publicacion.nombre}
                descripcion={publicacion.descripcion}
                user={publicacion.user}
                categoria_id={publicacion.categoria_id}
                estado={publicacion.estado}
                imagenes={publicacion.imagenes}
                centros={publicacion.centros}
              />
            ))}
          </div>
          <div className="publicacioninter">
            Oferta Recibida
            {publi2.map(publicacion => (
              <Publicacion
                key={publicacion.id}
                id={publicacion.id}
                nombre={publicacion.nombre}
                descripcion={publicacion.descripcion}
                user={publicacion.user}
                categoria_id={publicacion.categoria_id}
                estado={publicacion.estado}
                imagenes={publicacion.imagenes}
                centros={publicacion.centros}
              />
            ))}
          </div>
        </div>
        <div className="detalles">
          <p><strong>Centro:</strong> {centro}</p>
          <p><strong>Horario:</strong> {horario}</p>
          <p><strong>Estado:</strong> {estado}</p>
  
          { (estado === 'aceptado' || estado === 'pendiente') ? (
              (Token === 'tokenAdmin' || Token === 'tokenVolunt') ? (
                <button className="detalle-button" onClick={handleValidarClick}>
                  Validar Intercambio
                </button>
              ):(
              <>
              <button className="detalle-button" onClick={handleModificarClick}>
                Modificar
              </button>
              <button className="detalle-button" onClick={handleRechazadoClick}>
                Rechazar
              </button>
              {console.log(`Entro a condición de confirmar: ${userPubli} y ${userOferto}`)}
              {((userPubli == username && ofertaAcepta == false) || (userOferto == username && ofertadaAcepta == false)) ? (
                <>
                  {console.log("Entro a condición de confirmar")}
                  <button className="detalle-button" onClick={handleAceptadoClick}>
                    Confirmar
                  </button>
                </>):(<></>)}
              </>)):(
              (estado === 'concretado')?(
                <>
                  <button onClick={PuntuarUsuario}>Puntuar al Otro usuario</button>
                </>
                ):(<></>)
              )}
        </div>
      </div>
    </li>
  );
}  

export default Intercambio;
import "../HarryStyles/Publicaciones.css";
import React from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { MdEdit } from "react-icons/md";

const Publicacion = (props) => {

    const handleDetalleClick = () => {
        console.log("AL APRETAR EL BOTON" + JSON.stringify(props.centros));
        localStorage.setItem("publicacion", JSON.stringify(props));
        localStorage.setItem("publicacionOferta", JSON.stringify(props.id));
    };
    const cambiarEstado = async () => {
        const formData = new FormData();
        formData.append('setestado',(props.estado === 'alta')?'baja':'alta')
        formData.append('id', props.id)
        try{
            await axios.put("http://localhost:8000/public/updatePublicacion", formData, {
                headers: { "Content-Type": "application/json" },
            });
            window.location.reload();
        } catch (error) {
            console.error('Error:', error.response.data.Mensaje);
            alert(error.response.data.Mensaje || "Ocurrió un error");
        }
    }

    const Modificar = async () =>{
        localStorage.setItem('id', props.id)
    }

    return (
        <fieldset className="publicacion">
            <div className="publicacion-img">
                <img className="img" src={props.imagenes[0].archivo} alt="imagen no encontrada" />
            </div>
            <div className="publicacion-info">
                <p className="nombre">{props.nombre}</p>
                <p className="descripcion">
                    Descripción: {props.descripcion}
                    <br />
                    Categoría: {props.categoria_id}
                    <br />
                {(props.user === 'misPublis')?(
                    <></>
                ):(
                    <>
                    Por:<Link className={'linkUsuario'} to={`/PubliUsuario/${props.user}`}>{props.user}</Link>
                    </>
                )}
                </p>
                {(props.user === 'misPublis') && (
                    <>
                    <p className="descripcion">Estado: {props.estado}</p>
                    <br/>
                    </>
                )}
                {(props.user === 'misPublis') && (
                    <div className="boton">
                        {(props.estado === 'baja')?(
                        <>
                            <button className="botonEstado botonAlta" onClick={cambiarEstado}> Dar de Alta </button>
                        </>):(
                        <>
                            <button className="botonEstado botonBaja" onClick={cambiarEstado}> Dar de Baja </button>
                        </>
                            )}
                        <>
                        <Link to={`/ModificarPublicacion/${props.id}`} onClick={Modificar}>
                            <button className="botonEstado botonEditar"> <MdEdit className="editar" size={20}/>  </button>
                        </Link>
                        </>
                    </div>
                )}
                <Link to={`/PubliDetalle/${props.id}`} onClick={handleDetalleClick}>
                    <button className="detalle-button">Ver Detalle</button>
                </Link>
            </div>
        </fieldset>
    );
};

export default Publicacion;

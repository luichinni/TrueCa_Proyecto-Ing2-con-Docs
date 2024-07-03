import "../HarryStyles/Publicaciones.css";
import React from "react";
import { Link } from "react-router-dom";

const InterPubli = (props) => {
    const handleDetalleClick = () => {
        localStorage.setItem("publicacionOfertada", props.id);
        console.log(localStorage.getItem("publicacionOfertada"));
    };

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
                    Por: {props.user}
                </p>
                <Link to={`/InterSeleCentHor`} onClick={handleDetalleClick}>
                    <button className="detalle-button">Seleccionar</button>
                </Link>
            </div>
        </fieldset>
    );
};

export default InterPubli;
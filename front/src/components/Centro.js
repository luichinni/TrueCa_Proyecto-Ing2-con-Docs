import "../HarryStyles/centros.css"
import "../HarryStyles/styles.css"
import React, { useState } from "react";
import {Link} from "react-router-dom";
import { CiTrash } from 'react-icons/ci';
import { MdEdit } from "react-icons/md";

const Centro = (props) => {
        const [isExpanded, setIsExpanded]= useState(false);

        const handleToggle =()=>{
            setIsExpanded(!isExpanded);
        }


        return  <fieldset className="centro-fila">
                    <div className="div">
                        <p className="nombre">
                            centro {props.Id}:  {props.nombre}
                            <button onClick={handleToggle} className="toggle-button">
                                {isExpanded ? "Ocultar Detalles" : "Mostrar Detalles" }
                            </button>
                        </p>
                        {isExpanded && (
                        <div className="detalleUsuario">
                        <p className="informacion">
                            direccion: {props.direccion}
                            <br/>
                            hora de apertura: {props.hora_abre}
                            <br/>
                            hora de cierre: {props.hora_cierra}
                            <br /><br />
                            {(localStorage.getItem('token') == 'tokenAdmin')?(
                            <>
                                <Link to={`/ModificarCentro/${props.Id}`} > 
                                    <button className="botonEstado botonEditar"> <MdEdit className="editar" size={20}/>  </button>
                                </Link>

                                <Link to={"/deleteCentro/" + props.Id} className="botonEliminar"> 
                                    <CiTrash size={22} className='botonCampanita' />
                                </Link>
                                <br />
                            </>
                            ):(<></>)}
                        </p>
                        </div>
                        )}
                    </div>
                </fieldset>

}

export default Centro
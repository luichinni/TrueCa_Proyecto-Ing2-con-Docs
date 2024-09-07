import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../../HarryStyles/PubliDetalle.css"; 
import { Link } from "react-router-dom";
import axios from "axios";
import ListarComentarios from "../Comentarios/ListarComentarios";
import { FaArrowRight,FaArrowLeft } from "react-icons/fa";

const PubliDetalle = () => {
    const Token = localStorage.getItem('token');
    const username = localStorage.getItem('username')
    const { id } = useParams(); 
    const [error, setError] = useState(false);
    const [publicacion, setPublicacion] = useState(null);
    const [valoraciones, setValoraciones] = useState('');
    const [dueño, setDueño] = useState('')

    const [numeroFoto, setNumeroFoto] = useState(0);

    useEffect(() => {
        const publicacionGuardada = localStorage.getItem("publicacion");

        const publicacionObj = JSON.parse(publicacionGuardada);

        let nuevoArr = [];
        publicacionObj.centros.forEach((centro)=> nuevoArr.push(centro.nombre));
        publicacionObj.centros = nuevoArr;

        const idNumero = Number(id);

        if (publicacionObj && publicacionObj.id === idNumero) {
            setPublicacion(publicacionObj);
            setDueño(publicacionObj.user)
        } else {
        }

    }, [id]);

    useEffect(() => {
        if (dueño) {
            fetchValoraciones();
        }
    }, [dueño]);

    const fetchValoraciones = async () => {
        setError('');
        try {
            const url = `http://localhost:8000/public/getValoracion?userValorado=${dueño}&token=${localStorage.getItem('token')}`;

            const response = await axios.get(url);

            if (!response.data || response.data.Valoracion === undefined) {
                setError('No hay valoraciones disponibles');
                setValoraciones('Sin valoraciones');
     
            } else {
                setValoraciones(response.data.Valoracion);
                
            }
        } catch (error) {
            /* setError('No hay valoraciones disponibles.'); */
            setValoraciones('Sin valoraciones');
            console.error(error);
            
        }
    };

    const avanzarFoto = () => {
        if ((numeroFoto+1) < publicacion.imagenes.length){
            setNumeroFoto(numeroFoto+1);
        } else if ((numeroFoto+1) == publicacion.imagenes.length){
            setNumeroFoto(0)
        }
    }

    const retrocederFoto = () => {
        if ((numeroFoto-1) >= 0) {
            setNumeroFoto(numeroFoto-1);
        } else if ((numeroFoto - 1) < 0){
            setNumeroFoto(publicacion.imagenes.length - 1)
        }
    }

    if (!publicacion) {
        return <div>Cargando...</div>;
    }

    const handleDetalleClick = () => {
        localStorage.setItem("publiOferto", publicacion.id);
        localStorage.setItem("categoriaInter", publicacion.categoria_id);
   
    };

    return (
        <div className="detalle-container">
            <div className="detalle-imagen">
                <br/><br/><br/><br/><br/><br/><br/><br/>
                <img className="imagen-grande" src={publicacion.imagenes[numeroFoto].archivo} alt="imagen no encontrada" />
                {(publicacion.imagenes[1])&&(
                <div className="botones-imagenes">
                    <button className='botonCampanita' onClick={retrocederFoto}>
                        <FaArrowLeft size={32} className='botonCampanita' />
                    </button>
                    <button className='botonCampanita' onClick={avanzarFoto}>
                        <FaArrowRight size={32} className='botonCampanita' />
                    </button>
                </div>
                )}
            </div>
            <div className="detalle-info">
                <br/><br/><br/><br/><br/><br/><br/><br/>
                <h2>{publicacion.nombre}</h2>
                <p className="usuario-valoracion-container">
                    <strong>Usuario:</strong>
                        <Link className={'linkUsuario'} to={`/PubliUsuario/${publicacion.user}`}>
                            {publicacion.user}
                        </Link>
                    <div className="valoracion">
                    {(valoraciones === 'Sin valoraciones')?
                        (<>Puntuación: {valoraciones}</>):
                        (<>Puntuación: {valoraciones}/5</>)
                    }
                    </div>
                </p>
                <p><strong>Centros:</strong> {publicacion.centros.join(' | ')}</p>
                <p><strong>Descripción:</strong> {publicacion.descripcion}</p>
                <p><strong>Categoría:</strong> {publicacion.categoria_id}</p>
                {((Token === 'tokenUser')&&(username !== publicacion.user))?(
                <>
                    <Link to={`/InterSelePubli`} onClick={handleDetalleClick}>
                        <button className="detalle-button"> Ofrecer intercambio </button>
                    </Link>
                </>
                ):(<></>)}
                <ListarComentarios
                    publicacion={publicacion.id}
                />
            </div>
        </div>
    );
};

export default PubliDetalle;

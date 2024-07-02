import '../HarryStyles/Comentario.css';
import DeleteComentario from '../pages/Comentarios/DeleteComentario';
import { useEffect, useState } from 'react';
import ModificarComentario from '../pages/Comentarios/ModificarComentario';
import { CiTrash } from 'react-icons/ci'; 
import axios from "axios"
import { MdEdit } from "react-icons/md";
import ResponderComentario from './ResponderComentario';

const Comentario = ({ id, publicacion, user, texto, respuesta,fecha_publicacion }) => {

  const [ELIMINAR,setEliminar] = useState(false);
  const [error, setError] = useState('');
  const username = localStorage.getItem('username');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuario, setUsuario] = useState('')
  console.log(`publicacion: ${publicacion}`)

  function handleBorrar(){
    console.log(id + ' ' + localStorage.getItem('username'))
    setEliminar(true);
  }

  useEffect(() => {
    const fetchData = async () => {
      setError('');
      console.log(`usuario ${usuario} y username: ${username}`)
      try {
        const url = `http://localhost:8000/public/listarPublicaciones?id=${publicacion}&token=${localStorage.getItem('token')}`;
        const response = await axios.get(url);

        if (response.data.length === 3) {
          setError('No hay publicaciones disponibles.');
          setUsuario([]); 
        } else {
          let users = procesar(response.data);
          setUsuario(users[0].user)
        }
      } catch (error) {
        setError('No hay publicaciones disponibles.');
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(()=>{
    if (ELIMINAR == true) setEliminar(false);
  },[ELIMINAR])

  function procesar(publicaciones) {
    let publisCopy = [];
    Object.keys(publicaciones).forEach(function (clave) {
      if (!isNaN(clave)) {
        publisCopy[clave] = publicaciones[clave]
      }
    });
    return publisCopy;
  }

  const toggleFormulario = () => {
    setMostrarFormulario(prevMostrarFormulario => !prevMostrarFormulario);
  };

  return (
    <div className="Comentario">
      <div className="comentario-info">
        <h2 className="user">{user}</h2>
        <h3 className="texto">{texto}</h3>
        <p className="fecha">Publicado el: {new Date(fecha_publicacion).toLocaleDateString()}</p>
        {(respuesta === null)&&(usuario === username)?(
          <>
            <button onClick={toggleFormulario}>
              {mostrarFormulario ? 'Cancelar' : 'Responder'}
            </button>
          </>
          ):(<></>)
        }
        {mostrarFormulario && (
          <ResponderComentario 
            id={id}
          />
        )}

        {// si soy un admin, el dueño de la publicación o la persona que comento
          <button onClick={handleBorrar} className='botonCampanita'> <CiTrash size={26} className='botonCampanita' /> </button>
        }
        {ELIMINAR && (
          <DeleteComentario 
            id={id} 
            userMod={localStorage.getItem('username')} 
            />
        )
        }
        {respuesta &&(
          <fieldset className="respuesta-info">
            <legend className='titRespuesta'>Respuesta:</legend>
            <h2 className="user">{username}</h2>
            <h3 className="texto">{respuesta}</h3>
          </fieldset>
        )}
        { /*(user === username)&&(
          <ModificarComentario
            id={id}
            userMod={localStorage.getItem('username')}
          />
        )
         */ }
      </div>
    </div>
  ); 
}

export default Comentario;

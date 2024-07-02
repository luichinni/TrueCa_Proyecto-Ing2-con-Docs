import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../HarryStyles/Comentario.css';
import '../../HarryStyles/styles.css';
import { useEffect, useState } from 'react';
import Comentario from '../../components/Comentario';
import AgregarComentario from '../../components/AgregarComentario';

const ListarComentarios = (props) => {
  const [comentarios, setComentarios] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [parametros] = useState({
    id: '',
    publicacion: props.publicacion,
    user: '',
    texto: '',
    created_at: '',
    updated_at: ''
  });

    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        console.log(`key: ${props.publicacion}`)
        console.log(`parametros: ${parametros}`)
        const queryParams = new URLSearchParams(parametros).toString();
        const url = `http://localhost:8000/public/listarComentarios?${queryParams}`;
        console.log(`url: ${url}`)
        const response = await axios.get(url);
        console.log(`respuesta: ${response.data}`)

        if (response.data.length === 0) {
          setError('No hay Preguntas');
          setComentarios([]);
          console.log(`falle por 0 resultados`)
        } else {
          setComentarios(procesar (response.data));
          console.log(`comentarios: ${comentarios}`)
        }
      } catch (error) {
        setError('No hay Preguntas.');
        console.log(`falle por error`)
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    useEffect(() => {
    fetchData();
  }, [parametros]);

  function procesar(comentarios) {
    let comentCopy = [];
    Object.keys(comentarios).forEach(function (clave) {
      if (!isNaN(clave)) {
        comentCopy[clave] = comentarios[clave]
      }
    })
    return comentCopy
  }

  const toggleFormulario = () => {
    setMostrarFormulario(prevMostrarFormulario => !prevMostrarFormulario);
  };

  const handleComentarioAgregado = () => {
    setMostrarFormulario(false);
    fetchData(); // Recarga los comentarios
  };
  
  return (
    <div className='Content'>
      <div className='Publi-Div'>
      <div>
        {(localStorage.getItem('token') === 'tokenUser')?(
          <button className='agregarBoton' onClick={toggleFormulario}>
            {mostrarFormulario ? 'Cancelar' : 'Preguntar'}
          </button>
        ):(<></>)}
        </div>
        {mostrarFormulario && (localStorage.getItem('token') === 'tokenUser') && (
          <AgregarComentario 
            publicacion={props.publicacion}
            onComentarioAgregado={handleComentarioAgregado}
          />
        )}
        {loading ? (
          <h1 className='Cargando'>Cargando...</h1>
        ) : error ? (
          <h1 className='SinComentarios'>{error}</h1>
        ) : (
          comentarios.map(comentario => (
            <Comentario 
              key={comentario.id} 
              id={comentario.id}
              publicacion={comentario.publicacion}
              user={comentario.user}
              texto={comentario.texto}
              respuesta={comentario.respuesta}
              fecha_publicacion={comentario.created_at}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ListarComentarios;


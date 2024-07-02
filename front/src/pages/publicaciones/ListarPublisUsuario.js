import axios from 'axios';
import Publicacion from '../../components/Publicacion';
import FiltroMisPublis from '../../components/FiltroMisPublis';
import '../../HarryStyles/Publicaciones.css';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ListarPublisUsuario = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {username} = useParams()
  const [parametros, setParametros] = useState({
    nombre: "",
    user: "",
    categoria_id: "",
    estado: "",
    id: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        const queryParams = new URLSearchParams({
            nombre: parametros.nombre,
            user: username,
            categoria_id: parametros.categoria_id,
            id: parametros.id,
            habilitado: 0
        }).toString();
        const url = `http://localhost:8000/public/listarPublicaciones?${queryParams}&token=${localStorage.getItem('token')}`;
        const response = await axios.get(url);

        if (response.data.length === 3) {
          setError('No hay publicaciones que listar');
          setPublicaciones([]); 
          console.log('disponibles')
        } else {
          setPublicaciones(procesar(response.data));
        }
      } catch (error) {
        setError('No hay publicaciones que listar.');
        console.log('encontradas')
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  },[parametros]);

  const handleParametrosChange = (newParametros) => {
    setParametros(newParametros);
  };

  function procesar(publicaciones) {
    let publisCopy = [];
    Object.keys(publicaciones).forEach(function (clave) {
      if (!isNaN(clave)) {
        publisCopy[clave] = publicaciones[clave]
      }
    })
    return publisCopy
  }

  return (
    <div className='content'>
      <div className='sidebar'>
        <FiltroMisPublis onFiltroSubmit={handleParametrosChange} />
      </div>
      <div className='publi-container'>
        {loading ? (
          <h1 className='cargando'>Cargando...</h1>
        ) : error ? (
          <h1 className='sin-publi'>{error}</h1>
        ) : (
          publicaciones.filter(publicacion => (publicacion.estado === 'alta')).map(publicacion => (
            <Publicacion
              key={publicacion.id} // Agregar key prop para evitar advertencia
              id={publicacion.id}
              nombre={publicacion.nombre}
              descripcion={publicacion.descripcion}
              user={username}
              categoria_id={publicacion.categoria_id}
              estado={publicacion.estado}
              imagenes={publicacion.imagenes}
              centros={publicacion.centros}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ListarPublisUsuario;

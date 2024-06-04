import axios from 'axios';
import InterPubli from '../../components/InterPubli';
import Filtro from '../../components/Filtro';
import '../../HarryStyles/Publicaciones.css';
import { useEffect, useState } from 'react';

const ListarMisPublis = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem('username')
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
            estado: parametros.estado,
            id: parametros.id
        }).toString();
        const url = `http://localhost:8000/public/listarPublicaciones?${queryParams}&token=${localStorage.getItem('token')}`;
        const response = await axios.get(url);

        if (response.data.length === 3) {
          setError('No hay publicaciones disponibles');
          setPublicaciones([]); 
          console.log('disponibles')
        } else {
          setPublicaciones(procesar(response.data));
        }
      } catch (error) {
        setError('No hay publicaciones disponibles.');
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
        <Filtro onFiltroSubmit={handleParametrosChange} />
      </div>
      <div className='publi-container'>
        {loading ? (
          <h1 className='cargando'>Cargando...</h1>
        ) : error ? (
          <h1 className='sin-publi'>{error}</h1>
        ) : (
          publicaciones.map(publicacion => (
            <InterPubli
              key={publicacion.id} // Agregar key prop para evitar advertencia
              id={publicacion.id}
              nombre={publicacion.nombre}
              descripcion={publicacion.descripcion}
              user={publicacion.user}
              categoria_id={publicacion.categoria_id}
              estado={publicacion.estado}
              imagen={publicacion.imagenes[0].archivo}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ListarMisPublis;
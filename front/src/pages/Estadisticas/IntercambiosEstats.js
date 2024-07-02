import axios from 'axios';
import Publicacion from '../../components/Publicacion';
import FiltroEstadistica from '../../components/FiltroEstadistica';
import '../../HarryStyles/Publicaciones.css';
import { useEffect, useState } from 'react';
import Estadistica from '../../components/Estadistica';

const IntercambiosEstats = () => {
  const [intercambios, setIntercambios] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [texto, setTexto] = useState('')
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  const [parametros, setParametros] = useState({
    publicacionOferta: "",
    publicacionOfertada: "",
    estado: "",
    centro: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      setTexto('ausencia ambas partes')

      try {
        const queryParams = new URLSearchParams({
          desde: parametros.desde,
          hasta: parametros.hasta,
          estado: parametros.estado,
          centro: parametros.centro,
        }).toString();

        console.log(`params: ${queryParams}`)


        const url = `http://localhost:8000/public/estadisticas?${queryParams}&token=${localStorage.getItem('token')}`;
        console.log(`mandar: ${url}`)
        const response = await axios.get(url);

        if (response.data.Mensaje === 'No hay intercambios disponibles') {
          setError(`¡No has realizado intercambios todavía! \n Ve a explorar para poder intercambiar`);
          setIntercambios([]);
        } else {
          let intercambiosList = response.data;
          setIntercambios(intercambiosList);
          console.log(intercambiosList)
        }
      } catch (error) {
        setError(`¡No has realizado intercambios todavía! \n Ve a explorar para poder intercambiar`);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parametros, username, token]);

  const handleParametrosChange = async (newParametros) => {
      setParametros(newParametros);
  };

  return (
    <div className='content'>
      <div className='sidebar'>
        <FiltroEstadistica onFiltroSubmit={handleParametrosChange} />
      </div>
      <div className='publi-container'>
        {loading ? (
          <h1 className='cargando'>Cargando...</h1>
        ) : error ? (
          <>
            <br /><br /><br />
            <h1 className='sin-publi'>{error}</h1>
          </>
        ) : (intercambios.ausenciaAmbasPartes)
        }
      </div>
    </div>
  );
}

export default IntercambiosEstats;

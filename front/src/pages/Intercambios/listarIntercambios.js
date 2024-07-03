import axios from 'axios';
import Publicacion from '../../components/Publicacion';
import FiltroIntercambio from '../../components/FiltroIntercambio';
import '../../HarryStyles/Intercambios.css'
import '../../HarryStyles/Publicaciones.css';
import { useEffect, useState } from 'react';
import Intercambio from '../../components/Intercambio';

const ListarIntercambios = () => {
  const [intercambios, setIntercambios] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  const [centro, setCentro] = useState('')
  const [parametros, setParametros] = useState({
    publicacionOferta: "",
    publicacionOfertada: "",
    estado: "",
    centro: "",
    username: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        if (token === 'tokenVolunt') {
          obtenerCentroUsuario(username)
        }

        console.log(centro)
        const queryParams = new URLSearchParams({
          publicacionOferta: parametros.publicacionOferta,
          publicacionOfertada: parametros.publicacionOfertada,
          estado: (((token === 'tokenVolunt')||(token === 'tokenAdmin')) && (parametros.estado === "")) ? 'aceptado' : parametros.estado,
          centro: (token === 'tokenVolunt')? centro : (parametros.centro),
          username: token === 'tokenUser' ? username : parametros.username,
        }).toString();

        console.log(`params: ${queryParams}`)


        const url = `http://localhost:8000/public/listarIntercambios?${queryParams}&token=${localStorage.getItem('token')}`;
        console.log(`url: ${url}`)
        const response = await axios.get(url);

        if (response.data.Mensaje === 'No hay intercambios disponibles') {
          setError(`¡No has realizado intercambios todavía! \n Ve a explorar para poder intercambiar`);
          setIntercambios([]);
        } else {
          let intercambiosList = procesar(response.data);
          setIntercambios(intercambiosList);
        }
      } catch (error) {
        setError(`¡No has realizado intercambios todavía! \n Ve a explorar para poder intercambiar`);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parametros, username, token, centro]);

  const obtenerCentroUsuario = async (volun) => {
    try {
      const url = `http://localhost:8000/public/obtenerCentroVolun?voluntario=${volun}`;
      const response = await axios.get(url);
      console.log(`centro Respuesta: ${response.data[0]}`)
      const centroId = response.data[0];
      console.log(`centroID: ${centroId}`)
      setCentro(centroId)
    } catch (error) {
      setError(`No puedes ver los intercambios disponibles \n porque no estás asociado a ningún centro`);
      console.error(error);
    }
  };

  const handleParametrosChange = async (newParametros) => {
    if (token === 'tokenVolunt') {
      setCentro (await obtenerCentroUsuario(username));
      setParametros({ ...newParametros, centro });
    } else {
      setParametros(newParametros);
    }
  };

  function procesar(inter) {
    // Convertir la respuesta en una lista única de intercambios
    const intercambiosCopy = [];
    const seenIds = new Set();

    Object.keys(inter).forEach((clave) => {
      if (!isNaN(clave)) {
        const intercambio = inter[clave];
        if (!seenIds.has(intercambio.id)) {
          seenIds.add(intercambio.id);
          intercambiosCopy.push(intercambio);
        }
      }
    });

    return intercambiosCopy;
  }

  return (
    <div className='contentInter'>
      <div className='sidebar'>
        <FiltroIntercambio onFiltroSubmit={handleParametrosChange} />
      </div>
      <div className='publi-container'>
        {loading ? (
          <h1 className='cargando'>Cargando...</h1>
        ) : error ? (
          <>
            <br /><br /><br />
            <h1 className='sin-publi'>{error}</h1>
          </>
        ) : (
          intercambios.map((intercambio) => (
            <Intercambio
              key={intercambio.id}
              id={intercambio.id}
              voluntario={intercambio.voluntario}
              publicacionOferta={intercambio.publicacionOferta}
              publicacionOfertada={intercambio.publicacionOfertada}
              ofertaAcepta={intercambio.ofertaAcepta}
              ofertadaAcepta={intercambio.ofertadaAcepta}
              motiv={intercambio.motivo}
              horario={intercambio.horario}
              estado={intercambio.estado}
              descripcion={intercambio.descripcion}
              donacion={intercambio.donacion}
              centro={intercambio.centro}
              fecha_propuesta={intercambio.fecha_propuesta}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ListarIntercambios;

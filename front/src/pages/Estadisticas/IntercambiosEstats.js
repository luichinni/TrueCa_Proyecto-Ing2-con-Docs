import axios from 'axios';
import FiltroEstadistica from '../../components/FiltroEstadistica';
import '../../HarryStyles/Publicaciones.css';
import { useEffect, useState } from 'react';
import AnyChart from 'anychart-react';

const IntercambiosEstats = () => {
  const [intercambios, setIntercambios] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  const [parametros, setParametros] = useState({
    desde: "",
    hasta: "",
    estado: "",
    centro: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

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

  const datosGrafico = [
    { x: "Ausencia Ambas Partes", value: intercambios.ausenciaAmbasPartes },
    { x: "Ausencia Anunciante", value: intercambios.ausenciaAnunciante },
    { x: "Ausencia Ofertante", value: intercambios.ausenciaOfertante },
    { x: "Producto Anunciado No Es Lo Esperado", value: intercambios.productoAnunciadoNoEsLoEsperado },
    { x: "Producto Ofertado No Es Lo Esperado", value: intercambios.productoOfertadoNoEsLoEsperado },
    { x: "El Producto No Es De Interes", value: intercambios.elProductoNoEsDeInteres },
    { x: "Fecha Y Hora No Convenientes", value: intercambios.fechaYHoraNoConvenientes },
    { x: "Se Eligió Una Oferta Superadora", value: intercambios.seEligióUnaOfertaSuperadora },
    { x: "Concretado", value: intercambios.concretado },
    { x: "Concretado con Donación", value: intercambios.concretadoConDonacion }
  ];

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
        ) : (
          <>
          <br/><br/><br/><br/>
          <AnyChart
            id="pieChart"
            width={1100}
            height={550}
            type="pie"
            data={datosGrafico}
            title="Distribución de Intercambios"
          />
          </>
        )}
      </div>
    </div>
  );
}

export default IntercambiosEstats;


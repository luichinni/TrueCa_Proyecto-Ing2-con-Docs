import axios from 'axios';
import FiltroEstadistica from '../../components/FiltroEstadistica';
import '../../HarryStyles/estadisticas.css';
import { useEffect, useState } from 'react';

/*"ausenciaAmbasPartes": 0,
    "ausenciaAnunciante": 1,
    "ausenciaOfertante": 0,
    "productoAnunciadoNoEsLoEsperado": 0,
    "productoOfertadoNoEsLoEsperado": 0,
    "elProductoNoEsDeInteres": 0,
    "fechaYHoraNoConvenientes": 0,
    "seEligióUnaOfertaSuperadora": 0,
    "concretado": 3,
    "total": 4,
    "concretado con donacion": 3,
    "cancelado con donacion": 1,
    "rechazado con donacion": 0,*/

const IntercambiosEstats = () => {
  const [intercambios, setIntercambios] = useState({});
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
        const url = `http://localhost:8000/public/estadisticas?${queryParams}&token=${localStorage.getItem('token')}`;
        console.log(`url de estadisticas: ${url}`)
        const response = await axios.get(url);

        if (response.data.Mensaje === 'No hay intercambios disponibles') {
          setError(`¡No funcionan las estadisticas!`);
          setIntercambios({});
        } else {
          let intercambiosList = response.data;
          setIntercambios(intercambiosList);
          console.log(intercambiosList);
        }
      } catch (error) {
        setError(`¡No funcionan las estadisticas`);
        console.error(error);
      } finally {
        setLoading(false)
      }
    };

    fetchData();
  }, [parametros, username, token]);

  const handleParametrosChange = async (newParametros) => {
    setParametros(newParametros);
  };

  const totalIntercambios = intercambios.total || 0;
  const donaciones = [
    { label: "concretados", value: intercambios.concretadoConDonacion || 0 },
    { label: "cancelado", value: intercambios.canceladoConDonacion || 0 },
    { label: "rechazado", value: intercambios.rechazadoConDonacion || 0 },
    { label: "total", value: (intercambios.rechazadoConDonacion + intercambios.canceladoConDonacion + intercambios.concretadoConDonacion)}
  ]
  const cancelados = [
    { label: "Ausencia Ambas Partes", value: intercambios.ausenciaAmbasPartes || 0 },
    { label: "Ausencia Anunciante", value: intercambios.ausenciaAnunciante || 0 },
    { label: "Ausencia Ofertante", value: intercambios.ausenciaOfertante || 0 },
    { label: "total", value: (intercambios.rechazadoConDonacion + intercambios.canceladoConDonacion + intercambios.concretadoConDonacion)}
  ]
  const estadisticas = [
    { label: "Producto Anunciado No Es Lo Esperado", value: intercambios.productoAnunciadoNoEsLoEsperado || 0 },
    { label: "Producto Ofertado No Es Lo Esperado", value: intercambios.productoOfertadoNoEsLoEsperado || 0 },
    { label: "El Producto No Es De Interes", value: intercambios.elProductoNoEsDeInteres || 0 },
    { label: "Fecha Y Hora No Convenientes", value: intercambios.fechaYHoraNoConvenientes || 0 },
    { label: "Se Eligió Una Oferta Superadora", value: intercambios.seEligióUnaOfertaSuperadora || 0 },
    { label: "Concretado", value: intercambios.concretado || 0 },
    { label: "Concretado con Donación", value: intercambios["concretado con donacion"] || 0 }
  ];

  return (
    <div className='contentest'>
      <div className='sidebarest'>
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
            <br /><br /><br /><br />
            <div className='estadisticas-container'>
              <h2>Total de Intercambios <br/>{totalIntercambios}</h2>
              <ul>
              <div className='donaciones'>
                <h2>Donaciones</h2>
                {donaciones.map((item, index) => (
                  <li key={index}>
                    {item.label}: {item.value} ({((item.value / totalIntercambios) * 100).toFixed(2)}%)
                  </li>
                ))}
              </div>
              <div className='donaciones'>
                <h2>Cancelados</h2>
                {estadisticas.map((item, index) => (
                  <li key={index}>
                    {item.label}: {item.value} ({((item.value / totalIntercambios) * 100).toFixed(2)}%)
                  </li>
                ))}
              </div>
                {estadisticas.map((item, index) => (
                  <li key={index}>
                    {item.label}: {item.value} ({((item.value / totalIntercambios) * 100).toFixed(2)}%)
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default IntercambiosEstats;

/*import axios from 'axios';
import FiltroEstadistica from '../../components/FiltroEstadistica';
import '../../HarryStyles/Publicaciones.css';
import { useEffect, useState } from 'react';
import AnyChart from 'anychart-react';

const IntercambiosEstats = () => {
  const [intercambios, setIntercambios] = useState({});
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

        console.log(`params: ${queryParams}`);

        const url = `http://localhost:8000/public/estadisticas?${queryParams}&token=${localStorage.getItem('token')}`;
        console.log(`mandar: ${url}`);
        const response = await axios.get(url);

        if (response.data.Mensaje === 'No hay intercambios disponibles') {
          setError(`¡No has realizado intercambios todavía! \n Ve a explorar para poder intercambiar`);
          setIntercambios({});
        } else {
          let intercambiosList = response.data;
          setIntercambios(intercambiosList);
          console.log(intercambiosList);
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
    { x: "Concretado con Donación", value: intercambios["concretado con donacion"] }
  ];

  console.log(datosGrafico); // Verifica los datos del gráfico

  return (
    <>
    <br/><br/><br/><br/>
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
    </>
  );
}

export default IntercambiosEstats;*/

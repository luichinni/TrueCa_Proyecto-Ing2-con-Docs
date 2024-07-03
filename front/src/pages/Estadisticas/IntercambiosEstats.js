import axios from 'axios';
import FiltroEstadistica from '../../components/FiltroEstadistica';
import '../../HarryStyles/estadisticas.css';
import { useEffect, useState } from 'react';

const IntercambiosEstats = () => {
  const [intercambios, setIntercambios] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [MostrarFormulario, setMostrarFormulario] = useState(false);
  const username = localStorage.getItem('username');
  const detallesDiv = useState(false)
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
    { label: "Concretados con Donación", value: intercambios.concretadoConDonacion || 0 },
    { label: "Cancelado con Donación", value: intercambios.canceladoConDonacion || 0 },
    { label: "Rechazado con Donación", value: intercambios.rechazadoConDonacion || 0 },
  ];
  const cancelados = [
    { label: "Ausencia Ambas Partes", value: intercambios.ausenciaAmbasPartes || 0 },
    { label: "Ausencia Anunciante", value: intercambios.ausenciaAnunciante || 0 },
    { label: "Ausencia Ofertante", value: intercambios.ausenciaOfertante || 0 },
  ];
  const rechazados = [
    { label: "Producto Anunciado No Es Lo Esperado", value: intercambios.productoAnunciadoNoEsLoEsperado || 0 },
    { label: "Producto Ofertado No Es Lo Esperado", value: intercambios.productoOfertadoNoEsLoEsperado || 0 },
    { label: "El Producto No Es De Interés", value: intercambios.elProductoNoEsDeInteres || 0 },
    { label: "Fecha Y Hora No Convenientes", value: intercambios.fechaYHoraNoConvenientes || 0 },
    { label: "Se Eligió Una Oferta Superadora", value: intercambios.seEligióUnaOfertaSuperadora || 0 },
  ];
  const concretados = [
    { label: "Concretado", value: intercambios.concretado || 0 },
  ];

  const calcularPorcentajeTotal = (valor) => {
    return totalIntercambios > 0 ? ((valor / totalIntercambios) * 100).toFixed(2) : 0;
  };

  const calcularPorcentajeGrupo = (valor, grupoTotal) => {
    return grupoTotal > 0 ? ((valor / grupoTotal) * 100).toFixed(2) : 0;
  };

  const renderGrupo = (titulo, datos) => {
    const grupoTotal = datos.reduce((sum, item) => sum + item.value, 0);
    return (
      <div className='cuadro'>
        <h2>{titulo}</h2>
        <h3>Total</h3>
        <p className='numero'>{grupoTotal}</p>
        <div className='detalles'>
          {datos.map((item, index) => (
            <div key={index}>
              <h3>{item.label}</h3>
              <p className='numero'>{item.value}</p>
              <p className='porcentaje porcentaje-total'>Total de intercambios: {calcularPorcentajeTotal(item.value)}%</p>
              <p className='porcentaje porcentaje-grupo'>Total por Estado: {calcularPorcentajeGrupo(item.value, grupoTotal)}%</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
              <div className='cuadros-superiores'>
                <div className='cuadro'>
                  <h2>Total de Intercambios</h2>
                  <h3>Total</h3>
                  <p className='numero'>{totalIntercambios}</p>
                  <div className='grid-datos'>
                    <div  className='grid-datos-interior'>
                      <h4>Cancelados</h4>
                      <p className='numero'>{cancelados.reduce((sum, item) => sum + item.value, 0)}</p>
                    </div>
                    <div className='grid-datos-interior'>
                      <h4>Rechazados</h4>
                      <p className='numero'>{rechazados.reduce((sum, item) => sum + item.value, 0)}</p>
                    </div>
                    <div className='grid-datos-interior'>
                      <h4>Concretados</h4>
                      <p className='numero'>{concretados.reduce((sum, item) => sum + item.value, 0)}</p>
                    </div>
                  </div>
                </div>
                <div className='cuadro'>
                  <h2>Total de Donaciones</h2>
                  <h3>Total</h3>
                  <p className='numero'>{donaciones.reduce((sum, item) => sum + item.value, 0)}</p>
                  <div className='grid-datos'>
                    <div className='grid-datos-interior'>
                      <h4>Concretados con Donación</h4>
                      <p className='numero'>{donaciones[0].value}</p>
                    </div>
                    <div className='grid-datos-interior'>
                      <h4>Cancelado con Donación</h4>
                      <p className='numero'>{donaciones[1].value}</p>
                    </div>
                    <div className='grid-datos-interior'>
                      <h4>Rechazado con Donación</h4>
                      <p className='numero'>{donaciones[2].value}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='estadisticas-cuadros'>
                {renderGrupo('Cancelados', cancelados)}
                {renderGrupo('Rechazados', rechazados)}
                {renderGrupo('Concretados', concretados)}
              </div>
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

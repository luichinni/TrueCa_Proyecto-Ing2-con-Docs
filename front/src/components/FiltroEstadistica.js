import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from "react-calendar";
import { format } from 'date-fns';
import "../HarryStyles/estadisticas.css";  // Asegúrate de que la ruta sea correcta
import { Link } from 'react-router-dom';

const FiltroEstadistica = ({ onFiltroSubmit }) => {
  const [centros, setCentros] = useState([]);
  const [centrosSeleccionados, setCentrosSeleccionados] = useState([]);
  const [filtro, setFiltro] = useState({
    desde: "",
    hasta: "",
    estado: "",
    centro: ""
  });

  const handleDateChange = (dateRange) => {
    const formattedDesde = dateRange[0] ? format(dateRange[0], 'yyyy-MM-dd 00:00:00') : '';
    const formattedHasta = dateRange[1] ? format(dateRange[1], 'yyyy-MM-dd 23:59:59') : '';
    setFiltro({
      ...filtro,
      desde: formattedDesde,
      hasta: formattedHasta
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFiltro({
      ...filtro,
      [name]: value
    });
  };

  const handleCentrosChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
    setCentrosSeleccionados(selectedValues);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFiltroSubmit(filtro);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/public/listarCentros');
        setCentros(procesarcen(res.data));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  function procesarcen(centros) {
    let cenCopy = [];
    Object.keys(centros).forEach(function (clave) {
      if (!isNaN(clave)) {
        cenCopy[clave] = centros[clave];
      }
    });
    return cenCopy;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="filtro-formest">
        <label className="filtro-label"></label>
        <div>
          <Calendar
            className='calendario'
            maxDate={new Date()}
            selectRange={true}
            onChange={handleDateChange}
            value={[filtro.desde, filtro.hasta]}
          />
        </div>
        <br/><br/>
        <select
          name="estado"
          value={filtro.estado}
          onChange={handleInputChange}
          className="filtro-input"
        >
          <option value="">Seleccione un Estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="cancelado">Cancelado</option>
          <option value="rechazado">Rechazado</option>
          <option value="aceptado">Aceptado</option>
          <option value="concretado">Concretado</option>
        </select>
        <br/><br/>
        {localStorage.getItem('token') !== 'tokenVolunt' &&
          <select id="centro" className='filtro-input' onChange={handleCentrosChange}>
            <option value="">Seleccione un centro</option>
            {centros.map((centro) => (
              <option key={centro.id} value={centro.id}>
                {centro.nombre}
              </option>
            ))}
          </select>
        }
        <br/><br/>
        <Link to="/Intercambios">
          <button className="filtro-button" type="submit">Ver todos los intercambios</button>
        </Link>
        <br/><br/>
        <button className="filtro-button" type="submit">Filtrar</button>
      </form>
    </>
  );
};

export default FiltroEstadistica;

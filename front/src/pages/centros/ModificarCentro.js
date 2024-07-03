import { ButtonSubmit } from "../../components/ButtonSubmit";
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams} from "react-router-dom";
import axios from 'axios';
import "../../HarryStyles/Intercambios.css";
import "../../HarryStyles/estilos.css";

const ModificarCentro = (props) => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [hora_abre, setHora_abre] = useState('');
    const [hora_cierra, setHora_cierra] = useState('');
    const [myError, setMyError] = useState(false);
    const [msgError, setMsgError] = useState('No deberías estar viendo este mensaje');
    const [huboCambio, setHuboCambio] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const horarios = [
        "00:00","00:30","01:00","01:30","02:00","02:30","03:00","03:30","04:00","04:30","05:00","05:30","06:00","06:30",
        "07:00","07:30","08:00","08:30","09:00","09:30","10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
        "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
        "21:00", "21:30","22:00", "22:30","23:00", "23:30"
    ];

    const handleNombreChange = (e) => { setNombre(e.target.value); setHuboCambio(true); }
    const handleDireccionChange = (e) => { setDireccion(e.target.value); setHuboCambio(true); }
    const handleHora_AbreChange = (e) => { setHora_abre(e.target.value); setHuboCambio(true); }
    const handleHora_CierraChange = (e) => { setHora_cierra(e.target.value); setHuboCambio(true); }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('id', id);
        if (nombre) formData.append('setnombre', nombre);
        if (direccion) formData.append('setdireccion', direccion);
        if (hora_abre) formData.append('sethora_abre', hora_abre);
        if (hora_cierra) formData.append('sethora_cierra', hora_cierra);

        try {
            setMyError(false);
            if (huboCambio) {
                if (window.confirm('¿Seguro que deseas modificar los datos?')) {
                    const response = await axios.put("http://localhost:8000/public/updateCentros", formData, {
                        headers: { "Content-Type": "application/json" },
                    });
                    console.log('Success:', response);
                    navigate("/Centros");
                }
            } else {
                alert('No se realizo ningun cambio');
                navigate("/Centros");
            }
        } catch (error) {
            console.error('Error:', error.response?.data?.Mensaje || error.message);
            setMyError(true);
            setMsgError(error.response?.data?.Mensaje || 'Error al modificar el centro');
        }
    };

    const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const url = `http://localhost:8000/public/listarCentros?id=${id}`;
                const response = await axios.get(url);
                if (response.data.length === 0) {
                    setError('No hay centros disponibles');
                } else {
                    const centroData = procesar(response.data)[0];
                    setNombre(centroData.nombre);
                    setDireccion(centroData.direccion);
                    setHora_abre(formatTime(centroData.hora_abre));
                    setHora_cierra(formatTime(centroData.hora_cierra));
                }
            } catch (error) {
                setError('Ocurrió un error al obtener el centro.');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const procesar = (centros) => {
        let centroCopy = [];
        Object.keys(centros).forEach((clave) => {
            if (!isNaN(clave)) {
                centroCopy[clave] = centros[clave];
            }
        });
        return centroCopy;
    };

    return (
        <div>
            <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
            <form onSubmit={handleSubmit}>
                <label>Modificar Centro! No es necesario completar los datos no se necesitan modificar!</label>
                <label>
                    Ingrese el nuevo nombre del centro: <br />
                    <input type="text" value={nombre} onChange={handleNombreChange} required />
                </label>
                <br />
                <label>
                    Ingrese la nueva dirección del centro: <br />
                    <input type="text" value={direccion} onChange={handleDireccionChange} required />
                </label>
                <br />
                <label>
                    Ingrese el nuevo horario de apertura del centro: <br />
                    <select id="Horario" value={hora_abre} onChange={handleHora_AbreChange}>
                        {horarios.map((hora, index) => (
                            <option key={index} value={hora}>{hora}</option>
                        ))}
                    </select>
                </label>
                <br />
                <label>
                    Ingrese el nuevo horario de cierre del centro: <br />
                    <select id="Horario" value={hora_cierra} onChange={handleHora_CierraChange}>
                        {horarios.map((hora, index) => (
                            <option key={index} value={hora}>{hora}</option>
                        ))}
                    </select>
                </label>
                <br />
                <ButtonSubmit text="Modificar centro!" />
            </form>
            {myError && (
                <p style={{ backgroundColor: "red", color: "white", textAlign: "center" }}>{msgError}</p>
            )}
        </div>
    );
};

export default ModificarCentro;

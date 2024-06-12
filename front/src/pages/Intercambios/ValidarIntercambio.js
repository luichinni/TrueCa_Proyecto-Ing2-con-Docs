import { ButtonSubmit } from "../../components/ButtonSubmit";
import { Button } from "../../components/Button";
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import '../../HarryStyles/Intercambios.css';

const ValidarIntercambio = () => {
	const navigate = useNavigate(); 
	const [comentario, setComentario] =useState('');
	const [donacion, setDonacion] =useState('');
	const [montoDonacion, setMontoDonacion] = useState('');
	const [objetoDonado, setObjetoDonado] = useState('');
	const [myError, setMyError] = useState(false);
	const [estado, setEstado] = useState('')


	const handleComentarioChange = (e) => setComentario(e.target.value);
	const handleEstadoChange = (e) => setEstado(e.target.value);
	const handleDonacionChange = (e) => setDonacion(e.target.value);
	const handleObjetoDonadoChange = (e) => setObjetoDonado(e.target.value);
	const handleMontoDonacionChange = (e) => setMontoDonacion(e.target.value);

    const handleSubmit = async (e) => {
		
        e.preventDefault();
		console.log('Submit button clicked!');
			console.log('entro'); 
			try {
				const formData = new FormData();
				formData.append('id', localStorage.getItem('idValidar'))
				console.log( localStorage.getItem('idValidar'));
				formData.append('setvoluntario', localStorage.getItem('username'))
				console.log(localStorage.getItem('username'));
				formData.append('setestado', estado);
				console.log('estado');
				formData.append('setdonacion', donacion);
				console.log('donacion');
				formData.append('setdescripcion', comentario);
				console.log(comentario);
				console.log(`formData:${formData}`)
				setMyError(false);
				const response = await axios.put(`http://localhost:8000/public/updateIntercambio`, formData,
					{
					  headers: {
						  "Content-Type": "application/json",
					  },
					});
				console.log('Success:', response);
				alert('Intercambio validado con éxito');
				navigate("../Intercambios"); //No se donde tiene que ir 
			} catch (error) {
				console.error('Error:', error.response.data.Mensaje);
				setMyError(true);
			}
    };

    return (
	<>
	<div id="validarIntercambio">
		<br/> <br /> <br/> <br/> < br/>
		<form onSubmit={handleSubmit}>
			<h3> Valida el intercambio! </h3>  <br /> 			
            <label>
				<select id="estado" onChange={handleEstadoChange} required> 
                    <option value="">Seleccione el estado del intercambio</option>
					<option value="concretado">Confirmado</option>
					<option value="cancelado">Cancelado</option>
					<option value="rechazado">Rechazado</option>
				</ select>
				<br/><br/>
				<select id="donacion" onChange={handleDonacionChange} required >
                    <option value="">¿Se obtuvo alguna donación?</option>
					<option value="1">Si</option>
					<option value="0">No</option>
				</ select>
				<br /> <br/>
            </label>

			<textarea NameClass="textarea" value={comentario} onChange={handleComentarioChange} maxLength="255" placeholder="Comentario del intercambio (Máximo 255 caracteres)" ></textarea>
            <br /><br />

			<ButtonSubmit text="Subir la validación" />
		</form>
				{//myError &&
					//<p style={{ backgroundColor: "red", color: "white", textAlign: "center" }}>{msgError}</p>
				}
	</div>
	</>
	
	);
};

export default ValidarIntercambio;
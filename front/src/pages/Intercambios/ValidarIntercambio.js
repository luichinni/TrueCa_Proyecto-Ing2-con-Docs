import { ButtonSubmit } from "../../components/ButtonSubmit";
import { Button } from "../../components/Button";
import React, { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
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

	const [enableCancelado,setEnableCancelado] = useState(false);
	const [enableRechazado,setEnableRechazado] = useState(false);
	const [motivo,setMotivo] = useState('');

	const handleMotivo = (e) => setMotivo(e.target.value);

	const handleComentarioChange = (e) => setComentario(e.target.value);
	const handleEstadoChange = (e) =>{
		setEstado(e.target.value);
		if (e.target.value == 'cancelado'){
			setEnableCancelado(true);
			setEnableRechazado(false);
			setMotivo('');
		}else if (e.target.value == 'rechazado'){
			setEnableCancelado(false);
			setEnableRechazado(true);
			setMotivo('');
		}else{
			setEnableCancelado(false);
			setEnableRechazado(false);
			setMotivo('');
		}
	} 
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
				formData.append('setmotivo', motivo);
				console.log(`formData:${formData}`)
				setMyError(false);
				const response = await axios.put(`http://localhost:8000/public/validarIntercambio`, formData,
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
				{(enableCancelado)&&//'ausencia ambas partes','ausencia anunciante','ausencia ofertante','producto anunciado no es lo esperado','producto ofertado no es lo esperado'
					<>
					<br/><br/>
					<select id="motivo" onChange={handleMotivo} required> 
                    <option value="">Seleccione el motivo de cancelacion</option>
					<option value="ausencia ambas partes">Ausencia de ambas partes</option>
					<option value="ausencia anunciante">Ausencia del anunciante</option>
					<option value="ausencia ofertante">Ausencia del ofertante</option>
					</ select>
					</>
				}
				{(enableRechazado)&&
					<>
					<br/><br/>
					<select id="motivo" onChange={handleMotivo} required> 
                    <option value="">Seleccione el motivo de rechazo</option>
					<option value="producto anunciado no es lo esperado">El producto anunciado no es lo esperado o publicado</option>
					<option value="producto ofertado no es lo esperado">El producto ofertado no es lo esperado o publicado</option>
					</ select>
					</>
				}
				{(!(enableCancelado && motivo == 'ausencia ambas partes')) &&
				<>
					<br /><br />
					<select id="donacion" onChange={handleDonacionChange} required >
						<option value="">¿Se obtuvo alguna donación?</option>
						<option value="1">Si</option>
						<option value="0">No</option>
					</ select>
				</>
				}
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
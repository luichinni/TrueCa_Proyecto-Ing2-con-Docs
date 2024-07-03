import { ButtonSubmit } from "../../components/ButtonSubmit";
import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Link } from "react-router-dom";

const ModificarUsuario = () => {
	const navigate = useNavigate(); 
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [numeroDocumento, setNumeroDocumento] = useState('');
    const [mail, setEmail] = useState('');
    const [mailViejo, setEmailViejo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [clave, setClave] = useState('');
    const [huboCambio, setHuboCambio] = useState(false)
    const [myError, setMyError] = useState(false);
    const username = localStorage.getItem('username')
    const [usuarios, setUsuarios] = useState([])
    const [msgError, setMsgError] = useState('No deberías estar viendo este mensaje');

    const handleNombreChange = (e) => {setNombre(e.target.value); setHuboCambio(true);}
    const handleApellidoChange = (e) => {setApellido(e.target.value); setHuboCambio(true);}
    const handleNumeroDocumentoChange = (e) => {setNumeroDocumento(e.target.value); setHuboCambio(true);}
    const handleMailChange = (e) => {setEmail(e.target.value); setHuboCambio(true);}
    const handleTelefonoChange = (e) => {setTelefono(e.target.value); setHuboCambio(true);}
    const handleClaveChange = (e) => {setClave(e.target.value); setHuboCambio(true);}
    useEffect(() => {
      const fetchData = async () => {
        try {
          const url = `http://localhost:8000/public/listarUsuarios?username=${username}`;
          const response = await axios.get(url);
  
          if (response.data.length === 0) {
            setUsuarios([]); 
          } else {
            const usuarioData = procesar(response.data)[0]; // Solo toma el primer usuario
            setUsuarios([usuarioData]);
            setNombre(usuarioData.nombre);
            setApellido(usuarioData.apellido);
            setNumeroDocumento(usuarioData.dni);
            setEmailViejo(usuarioData.mail);
            setEmail(usuarioData.mail)
            setTelefono(usuarioData.telefono);
            setClave(usuarioData.clave);
          }
        } catch  (error) {
          console.error(error);
        }
      };
  
      fetchData();
    }, []);

    const handleSubmit = async (e) => {
      e.preventDefault();
		  console.log('Submit button clicked!');

		
			console.log('entro');
			const formData = new FormData();
			formData.append('username', username);
      (nombre)&&(formData.append('setnombre', nombre));
			(apellido)&&formData.append('setapellido', apellido);
			(numeroDocumento)&&formData.append('setdni', numeroDocumento);
			(mail)&&(mail!==mailViejo)&&formData.append('setmail', mail);
			(telefono)&&formData.append('settelefono', telefono);
      (clave)&&formData.append('setclave', clave);

			try {
				setMyError(false);
        console.log(`username: ${formData.get('username')}`);
        console.log(`newusername: ${formData.get('setusername')}`);
        console.log(`nombre: ${formData.get('setnombre')}`);
        console.log(`apellido: ${formData.get('setapellido')}`);
        console.log(`dni: ${formData.get('setdni')}`);
        console.log(`mail: ${formData.get('setmail')}`);
        console.log(`telefono: ${formData.get('settelefono')}`);
        if (huboCambio === true) {
          if (window.confirm('¿Seguro que deseas modificar los datos?')) {
          const response = await axios.put("http://localhost:8000/public/updateUsuario", formData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            });
          console.log('Success:', response);
          navigate("/");
          }
        } else {
          alert('No se realizo ningun cambio')
          navigate("/");
        }
			} catch (error) {
        console.log('entre por error')
				console.error('Error:', error.response.data.Mensaje);
				setMyError(true);
				setMsgError(error.response.data.Mensaje);
			}
    };
    function procesar(usuarios) {
      let usuarioCopy = [];
      Object.keys(usuarios).forEach(function (clave) {
        if (!isNaN(clave)) {
          usuarioCopy[clave] = usuarios[clave]
        }
      })
      console.log(usuarioCopy)
      return usuarioCopy
    }

    return (
	<>
	<h1>Trueca </h1>
	<div id="registrarse">
		<br/>
		<form onSubmit={handleSubmit}>
			<h3> Modifica tus datos de usuario! </h3>  <br /> <br />
      {usuarios.map(usuario => (
      <>
        <label> Nombre: </label>
        <input placeholder={"nombre"} type="text" value={nombre} onChange={handleNombreChange} required/> <br/><br/>  

        <label> Apellido: </label>
        <input placeholder={"apellido"} type="text" value={apellido} onChange={handleApellidoChange} required/>  <br/><br/>  

        <label> DNI: </label>
        <input placeholder={"documento"} type="text" value={numeroDocumento} onChange={handleNumeroDocumentoChange} required/>  <br/><br/>  

        <label> Mail: </label>
        <input placeholder={"mail"} type="text"  value={mail} onChange={handleMailChange} required/> <br/> <br/> 
        
        <label> Telefono: </label>
        <input placeholder={"telefono"} type="text" value={telefono} onChange={handleTelefonoChange} />  <br/><br/> 
        
        <label> Contraseña: </label>
        <input placeholder={"clave"} type="password" value={clave} onChange={handleClaveChange} required />  <br/><br/> 
      </>
      ))}
			<ButtonSubmit text="Modificar datos" />
		</form>
				{myError &&
					<p style={{ backgroundColor: "red", color: "white", textAlign: "center" }}>{msgError}</p>
				}
	</div>
	</>
	
	);
};

export default ModificarUsuario;
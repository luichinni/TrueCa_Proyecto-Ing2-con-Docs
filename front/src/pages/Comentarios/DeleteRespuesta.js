import { ButtonSubmit } from "../../components/ButtonSubmit";
import React, { useEffect, useState,useRef } from 'react';
import axios from 'axios';

const DeleteRespuesta = ({id}) => {
    const [huboCambio, setHuboCambio] = useState(false)
    const [myError, setMyError] = useState(false);
    const [msgError, setMsgError] = useState('No deberías estar viendo este mensaje');

    const hasMounted = useRef(false);

    useEffect(() => {
        const formData = new FormData();
            formData.append('id', id);
            formData.append('setrespuesta', null);
        const deleteRespuesta = async() =>{
            try {
                console.log(`texto: ${formData.get('setrespuesta')}`)
                setMyError(false);
                
                    if (window.confirm('¿Seguro que deseas eliminar su respuesta?')) {
                    const response = await axios.put("http://localhost:8000/public/updateComentario", formData,
                        {
                        headers: {
                            "Content-Type": "application/json",
                        },
                        });
                    console.log('Success:', response);
                    window.location.reload();
                    }else{
                        window.location.reload();
                    }
            } catch (error) {
                console.log('entre por error')
                console.error('Error:', error.response.data.Mensaje);
                setMyError(true);
                setMsgError(error.response.data.Mensaje);
            }
         if(!hasMounted.current){
            deleteRespuesta();
            hasMounted.current = true;
        }
    }
    },[]);
    return null;
};

export default DeleteRespuesta;
import { useState } from "react";
import axios from 'axios';
import { ButtonSubmit } from "./ButtonSubmit";


const ResponderComentario = (props) =>{
    const [Coment, setComent] = useState('');
    const user = localStorage.getItem('username')
    const [myError, setMyError] = useState(false);
    const [msgError, setMsgError] = useState('No deberías estar viendo este mensaje');

    const handleComentarioChange = (e) => setComent(e.target.value);

    const handleSubmit = async(e) =>{
        e.preventDefault()
        const formData = new FormData();
        formData.append('id', props.id);
        formData.append('setrespuesta', Coment);

        try {
            const response = await axios.put("http://localhost:8000/public/updateComentario", formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
            console.log('realizado:', response);
            window.location.reload();
        } catch (error) {
            setMyError(true);
            setMsgError(error.response.data.Mensaje);
        }
    }


    return(
        <fieldset>
            <form onSubmit={handleSubmit}>
            <h2>Responder pregunta</h2>
            <input type="text" value={Coment} onChange={handleComentarioChange} placeholder="Ingrese Respuesta" required />
            <ButtonSubmit text="Responder"/>
            </form>
            {myError &&
                <p style={{ backgroundColor: "red", color: "white", textAlign: "center" }}>{msgError}</p>
            }
        </fieldset>
    )
}
export default ResponderComentario;
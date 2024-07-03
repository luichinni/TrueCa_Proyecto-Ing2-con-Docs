<?php

require_once __DIR__ . '/../utilities/bdController.php';

class NotificacionesHandler extends BaseHandler{
    function __construct(bdController $db, protected UsuariosHandler $userHandler, protected mailSender $mailer)
    {
        parent::__construct($db);
    }

    public function enviarNotificacion(string $user,string $titulo,string $contenido,string $url = ""){
        if ($this->userHandler->notificacion($user)) $this->mailer->send($this->userHandler->mail($user), $titulo, $contenido, true);
        error_log('Nueva notificacion: '.json_encode(['user' => $user, 'texto' => $contenido, 'url' => $url]));
        return $this->crear(['user'=>$user,'texto'=>$contenido,'url'=>$url]);
    }

    public function verNotificacion(int $id){
        $this->actualizar(['id' => $id, 'setvisto' => true]);
    }

    public function listar(array $datos, bool $like = false)
    {
        $notificaciones = parent::listar($datos,$like);

        foreach($notificaciones as $pos=>$info){
            $this->verNotificacion($info['id']);
        }

        return $notificaciones;
    }

    protected function restriccionBorrado(array $datos){ // true -> restringido, false -> puede seguir
        // no tiene, no se borran nunca (por ahora)
        return false;
    }

    protected function eliminarDependencias(array $datos){
        // no tiene
    }

    public function validarDatos(array $data, bool $todos){
        $campos = ['user', 'texto', 'visto', 'url'];

        $valido = false;

        if ($todos && !$this->db->comprobarObligatorios($data)) {
            $this->mensaje = 'Faltan campos por completar';
            return false;
        }

        match (true) {
            (array_key_exists('user', $data)) && ((!isset($data['user']) || empty($data['user'])) || (strlen($data['user']) > 50) || (strlen($data['user']) < 3) || (!$this->userHandler->existe(['username' => $data['user']]))) => $this->mensaje = 'No pudo encontrarse el usuario a notificar',
            (array_key_exists('texto', $data)) && ((!isset($data['texto']) || empty($data['texto'])) || (strlen($data['user']) < 1)) => $this->mensaje = 'No es válido el texto de la notificacion',
            (array_key_exists('visto', $data)) && ((!isset($data['visto']) || empty($data['visto'])) || ($data['visto'] != 0 || $data['visto']!=1)) => $this->mensaje = 'No puede cambiarse el estado de lectura de la notificación',
            (array_key_exists('url', $data)) && (isset($data['url'])) => $this->mensaje = 'Debe especificarse una url aunque sea vacia',
            default => $valido = true
        };
        return $valido;
    }
}
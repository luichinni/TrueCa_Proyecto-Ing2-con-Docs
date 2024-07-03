<?php

require_once __DIR__ . '/../utilities/bdController.php';

class CentroHandler extends BaseHandler{
    // inyecto dependencias
    protected PublicacionesHandler $publiHandler;
    protected IntercambiosHandler $intercambHandler;

    public function setPublicacionesHandler(PublicacionesHandler $publicacionesHandler){
        $this->publiHandler = $publicacionesHandler;
    }
    public function setIntercambiosHandler(IntercambiosHandler $intercambiosHandler){
        $this->intercambHandler = $intercambiosHandler;
    }

    function __construct(bdController $db)
    {
        parent::__construct($db);
    }
    public function validarDatos(array $data, bool $todos){
        $campos = ['nombre', 'direccion', 'hora_abre', 'hora_cierra'];

        $valido = false;

        if ($todos && !$this->db->comprobarObligatorios($data)){
            $this->mensaje = 'Faltan campos por completar';
            return false;
        }

        match(true){
            (array_key_exists('nombre', $data)) && ((!isset($data['nombre']) || empty($data['nombre'])) || (strlen($data['nombre']) > 255) || (strlen($data['nombre']) < 3)) => $this->mensaje = 'El campo nombre es inválido',
            (array_key_exists('direccion', $data)) && ((!isset($data['direccion']) || empty($data['direccion'])) || (strlen($data['direccion']) > 255) || (strlen($data['direccion']) < 3)) => $this->mensaje = 'El campo direccion es inválido',
            (array_key_exists('hora_abre', $data)) && ((!isset($data['hora_abre']) || empty($data['hora_abre'])) || (!preg_match('/^(?:2[0-3]|[0-1][0-9]):[0-5][0-9]$/', $data['hora_abre']))) => $this->mensaje = 'El horario de apertura es inválido',
            (array_key_exists('hora_cierra', $data)) && ((!isset($data['hora_cierra']) || empty($data['hora_cierra'])) || (!preg_match('/^(?:2[0-3]|[0-1][0-9]):[0-5][0-9]$/', $data['hora_cierra']))) => $this->mensaje = 'El horario de cierre es inválido',
            (array_key_exists('hora_abre', $data) && array_key_exists('hora_cierra', $data)) && ($data['hora_abre']>=$data['hora_cierra']) => $this->mensaje = 'El horario de apertura debe ser menor al horario de cierre',
            default => $valido = true
        };
        return $valido;
    }

    public function comprobarVoluntariosEn(int|string $id){
        return !validarCentroVolun(['centro'=>$id]);
    }

    protected function restriccionBorrado(array $datos){ // true -> restringido, false -> puede seguir
        $restringido = false;
        if (!$this->comprobarVoluntariosEn($datos['id'])) {
            $this->mensaje = 'No se pudo eliminar, el centro tiene voluntarios asociados';
            $restringido = true;
        }
        return $restringido;
    }

    protected function eliminarDependencias(array $datos){
        $this->publiHandler->baja(['centro' => $datos['id']]);
        $this->intercambHandler->cancelar(['centro' => $datos['id']], 'centro dado de baja');
    }

    public function habilitado(int|string $id){
        if (!$this->existe(['id' => $id])) return false;

        $centro = (array)$this->listar(['id' => $id]);

        if (empty($centro)) return false;

        $centro = $centro[0];

        return validarCentroVolun(['centro'=>$centro['id']]);
    }

    public function listar(array $datos, bool $like = false,bool $habilitados = false){
        $listado = parent::listar($datos,$like);

        if (!empty($listado) && $habilitados){
            $newList = [];
            foreach ($listado as $pos => $centro){
                if ($this->habilitado($centro['id'])){
                    $newList[] = $centro;
                }
            }
            $listado = $newList;
        }

        return $listado;
    }

    public function obtenerCentroDeVoluntario(string $voluntario){
        $this->status = 404;
        if (!validarCentroVolun(['voluntario'=>$voluntario])){
            $this->mensaje = 'El voluntario no corresponde a un centro';
            return false;
        }

        $centroVol = (array) ((array) obtenerCentroVolun(['voluntario'=>$voluntario]))[0];
        $centro = $this->listar(['id'=>$centroVol['centro']])[0];

        if ($this->status == 500){
            $this->mensaje = 'Ocurrió un error al obtener el centro de '. $voluntario;
            return false;
        }

        $this->status = 200;
        $this->mensaje = 'Centro obtenido con éxito';
        return (array) $centro;
    }

    public function comprobarHorario(int | string $id,string $horario){
        $centro = (array) $this->listar(['id'=>$id]);
        if (empty($centro)) return false;

        $centro = (array) $centro[0];

        if ($centro['hora_abre']>$horario || $centro['hora_cierra']<$horario){
            $this->mensaje = 'Horario fuera de rango';
            return false;
        }

        return true;
    }

    public function nombre(int|string $id){
        if (!$this->existe(['id' => $id])) return false;

        $centro = (array)$this->listar(['id' => $id]);

        $centro = $centro[0];
        return $centro['nombre'];
    }
}


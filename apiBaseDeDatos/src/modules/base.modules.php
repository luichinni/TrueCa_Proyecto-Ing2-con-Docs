<?php

require_once __DIR__ . '/../utilities/bdController.php';

abstract class BaseHandler{
    public int $status;
    public string $mensaje;
    protected bdController $db;

    function __construct(bdController $db){
        $this->db = $db;
    }

    public function existe(array $datos, bool $porId = false){
        if (($porId) && ((array_key_exists('id', $datos) && $datos['id']=='' || !$this->db->exists(['id' => $datos['id']])) || !array_key_exists('id', $datos))) {
            $this->mensaje = 'La id no es válida';
            return false;
        }
        return $this->db->exists($datos);
    }

    public function crear(array $datos){
        $pudo = false;
        $this->status = 500;
        if (!$this->validarDatos($datos, true)) return false;
        try {
            $this->db->insert($datos);
            $this->status = 200;
            $this->mensaje = $this->db->getTableName() . ' cargada con éxito';
            $pudo = true;
        } catch (Exception $e) {
            $this->mensaje = 'Ocurrió un error al cargar ' . $this->db->getTableName();
        }
        return $pudo;
    }

    public function actualizar(array $datos){
        $this->status = 500;
        $pudo = false;
        if (!$this->existe($datos)) return $pudo;

        if (!$this->validarDatos($this->db->getSetParams($datos),false)) return $pudo;

        try{
            $this->db->update($datos);
            $this->mensaje = $this->db->getTableName() . ' actualizado con éxito';
            $this->status = 200;
            $pudo = true;
        }catch(Exception $e){
            $this->mensaje = 'Ocurrió un error al actualizar ' . $this->db->getTableName();
        }
        return $pudo;
    }

    public function borrar(array $datos){
        $this->status = 500;
        $pudo = false;

        if (empty($datos) || !$this->existe($datos,true)) return $pudo;

        if ($this->restriccionBorrado($datos)){ // true -> restringido, false -> puede seguir
            $this->status = 500;
            return $pudo;
        }

        $this->eliminarDependencias($datos);

        try{
            $this->db->delete($datos);
            $this->status = 200;
            $this->mensaje = $this->db->getTableName() . ' eliminado con éxito';
        }catch (Exception $e){
            $this->mensaje = 'Ocurrió un error al eliminar ' . $this->db->getTableName() . ', comprueba que no tenga dependencias';
        }
    }

    public function listar(array $datos, bool $like = false){
        $ret = [];
        try{
            $ret = $this->db->getAll($datos, $like);
            $this->status = (empty($ret)) ? 404 : 200;
            $this->mensaje = (empty($ret)) ? 'No se encontraron ' . $this->db->getTableName() : $this->db->getTableName() . ' listados con éxito';
        }catch (Exception $e){
            $this->status = 500;
            $this->mensaje = 'Ocurrió un error al listar ' . $this->db->getTableName();
        }
        //error_log('RETORNO: ' . json_encode($ret));
        return (array) $ret;
    }

    abstract protected function restriccionBorrado(array $datos);// true -> restringido, false -> puede seguir
    abstract protected function eliminarDependencias(array $datos);
    abstract public function validarDatos(array $data, bool $todos);
}
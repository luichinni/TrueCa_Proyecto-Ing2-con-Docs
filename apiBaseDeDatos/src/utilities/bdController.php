<?php

class bdController
{
    public string $lastId;
    /**
     * @param string $tableName - Nombre de la tabla que corresponde al controlador instanciado
     * @param PDO $pdo - Conexion a la base de datos
     * @param array $camposTabla - Se compone de los campos tal que:
     * ```php
     * ["campo" => [
     *     "pk" => true | false
     *     "tipo" => "tipo del campo",
     *     "autoincrement" => true | false,
     *     "comparador" => "=" | "like",
     *     "opcional" => true | false,
     *     "default" => "valor por defecto"
     *     "fk" => [
     *         "tabla"=>"nombre tabla", 
     *         "campo"=>"nombre campo"
     *      ]
     *   ],
     *   ...
     * ]
     * ```
     * Por defecto todos los campos son varchar(255) obligatorios, no automaticos, sin valor por defecto y utilizan el comparador like aunque es recomendable especificar
     * cada campo.
     * 
     * Si pk es true, se considera como clave primaria, si hay más de una pk, todas serán consideradas una unica pk compuesta.
     * 
     * Si fk existe y tiene el nombre de un campo y tabla válidos, se creara la fk.
     * @param bool $dropTable - Ignora si existe o no la tabla, si existe la elimina y la vuelve a crear con los campos pasados.
     */
    function __construct(private string $tableName, private PDO $pdo, private array $camposTabla, bool $dropTable = false)
    {
        $this->camposTabla['created_at'] = [
            "tipo" => "DATETIME DEFAULT CURRENT_TIMESTAMP",
            "comparador" => "like",
            "opcional" => true
        ];
        $this->camposTabla['updated_at'] = [
            "tipo" => "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
            "comparador" => "like",
            "opcional" => true
        ];
        //error_log($tableName);
        $this->initTable($dropTable);
    }

    public function getTableName(){return $this->tableName;}

    public function initTable($dropTable = false)
    {
        if ($dropTable) {
            $this->dropTable();
            $this->createIfNotExist($this->tableName, $this->pdo, $this->camposTabla);
        } else {
            if (!$this->tableExists($this->tableName)) {
                $this->createIfNotExist($this->tableName, $this->pdo, $this->camposTabla);
            }
        }
    }

    private function alterTable(array $nuevosCampos)
    {
        foreach ($nuevosCampos as $campo => $opciones) {
            $alterSql = "ALTER TABLE `$this->tableName` ADD IF NOT EXISTS " . $this->getLineaDeclaracion($campo, $opciones);
            $alterSql = substr($alterSql, 0, strlen($alterSql) - 2);
            //error_log($alterSql);
            $this->pdo->prepare($alterSql)->execute();
        }
    }

    public function dropTable()
    {
        $dropQuery = "DROP TABLE `$this->tableName`";
        //error_log($dropQuery);
        return $this->pdo->prepare($dropQuery)->execute();
    }

    private function getLineaDeclaracion(string $campo, array $opciones, array &$pk = [], array &$fk = [])
    {
        $createQuery = "";
        $tipo = "varchar(255)";
        $auto = false;
        $opcional = true;
        $default = "";

        foreach ($opciones as $opcion => $valor) {
            switch ($opcion) {
                case "autoincrement":
                    if ($default != "") throw new Exception("El campo $campo no puede ser autoincremental y tener valor por defecto");
                    if (!is_bool($valor)) throw new Exception("La opcion 'autoincrement' del campo $campo debe ser boolean");
                    $auto = true;
                    break;
                case "pk":
                    if (!is_bool($valor)) throw new Exception("La opcion del campo $campo 'pk' debe ser boolean");
                    $pk[$campo] = $valor;
                    $opcional = true;
                    break;
                case "tipo":
                    if (!is_string($valor)) throw new Exception("El tipo de $campo debe estar descrito en un string. \nEjemplo: INT, varchar(5), etc");
                    $tipo = $valor;
                    break;
                case "opcional":
                    if (!is_bool($valor)) throw new Exception("La opcion 'opcional' de $campo debe ser boolean");
                    $opcional = $valor;
                    break;
                case "default":
                    if ($auto) throw new Exception("El campo $campo no puede ser autoincremental y tener valor por defecto");
                    $default = $valor;
                    break;
                case "fk":
                    /* if ($this->tableExists($valor['tabla'])) { */
                    $fk[$campo] = $valor;
                    /* } else {
                        throw new Exception("No existe la tabla " . $valor['tabla'] . " con el campo " . $valor['campo']);
                    } */
                    break;
                default:
                    if (!($valor == "=" | $valor == "like")) {
                        throw new Exception("El comparador de $campo debe ser '=' o 'like', '$valor' no es un tipo de comparador soportado");
                    }
            }
        }
        // id INT AUTO_INCREMENT PRIMARY KEY,
        $createQuery .= $campo . ' ' . $tipo . ' ';
        if ($auto) $createQuery .= 'AUTO_INCREMENT ';
        if ($default != "") $createQuery .= "DEFAULT $default ";
        if (!$opcional) $createQuery .= "NOT NULL ";
        $createQuery .= ", ";
        //error_log($createQuery);
        return $createQuery;
    }

    private function createIfNotExist(string $tableName, PDO $pdo, array $camposTabla)
    {

        $createQuery = "CREATE TABLE IF NOT EXISTS `$tableName` (";
        $pk = [];
        $fk = [];
        foreach ($camposTabla as $campo => $opciones) {
            $createQuery .= $this->getLineaDeclaracion($campo, $opciones, $pk, $fk);
        }
        if (count($pk) == 0) {
            $createQuery .= 'id INT AUTO_INCREMENT, ';
            $pk['id'] = '';
        }

        $createQuery .= "PRIMARY KEY (";
        foreach ($pk as $campo => $opciones) {
            $createQuery .= "$campo, ";
        }
        $createQuery = substr($createQuery, 0, strlen($createQuery) - 2) . ")";
        if (count($fk) != 0) {
            $createQuery .= ", ";
            foreach ($fk as $campo => $datos) {
                $createQuery .= "FOREIGN KEY ($campo) REFERENCES " . $datos['tabla'] . "(" . $datos['campo'] . '),';
            }
            $createQuery = substr($createQuery, 0, strlen($createQuery) - 1);
        }
        $createQuery .= ")";
        //error_log($createQuery);
        $var = $pdo->prepare($createQuery)->execute();
        //error_log('TABLA CREADA');
        //error_log("Agregado? $var");
        return $var;
    }

    private function tableExists(string $tableCheck)
    {
        $existe = false;
        $queryCheck = "SELECT 1 FROM $tableCheck LIMIT 1";
        $preparado = $this->pdo->prepare($queryCheck);
        try {
            $preparado->execute();
            if ($preparado->fetch()) {
                $existe = true;
            }
        } catch (Exception $e) {
            $existe = false;
        }

        return $existe;
    }

    public function comprobarObligatorios(array $datos){
        $campos = [];
        $camposObligados = [];

        foreach($this->camposTabla as $campo => $info){
            if (array_key_exists($campo,$datos) && array_key_exists('opcional',$info) && !$info['opcional']) $campos[] = $campo;

            if (array_key_exists('opcional', $info) && !$info['opcional']) $camposObligados[] = $campo;
        }

        return (count($campos) == count($camposObligados));
    }

    /**
     * @param bool $like - Habilita la comparacion parcial cuando es true, si es false compara por coincidencia exacta
     * @param array $whereParams - Define los parametros que se usaran en el where, se compone de los campos tal que:
     * ```php
     * [
     *   "campo" => "valor para filtrar",
     *    ...
     * ]
     * ```
     * Si no se definen campos para buscar, la funcion devuelve true si existe aunque sea una unica fila en la tabla
     * @return bool
     */
    public function exists(array $whereParams, bool $like = false)
    {
        $querySelect = $this->generarSelect($whereParams, null, $like);
        //error_log($querySelect);
        $opSql = $this->pdo->query($querySelect);
        $existe = false;
        if ($opSql->rowCount() > 0) {
            $existe = true;
        }
        return $existe;
    }

    /**
     * @param array $params - Array donde se buscaran los parametros para actualizar, el nombre de la columna debe ser <set>columna, ej:setnombre.
     * 
     * Se compone de los campos tal que:
     * ```php
     * [
     *   "setcampo" => "valor nuevo",
     *    ...
     * ]
     * ```
     * En caso de no haber valores que actualizar, retorna un arreglo vacio.
     * @return array
     */
    public function getSetParams(array $params)
    {
        $arrReturn = [];
        foreach ($params as $key => $value) {
            if (str_starts_with($key, 'set') && array_key_exists(substr($key, 3), $this->camposTabla)) {
                $arrReturn[substr($key, 3)] = $value;
            }
        }
        return $arrReturn;
    }

    /**
     * @param array $params - Array donde se buscaran los parametros del where, el nombre del campo debe ser igual al respectivo de la tabla en la bd.
     * 
     * Se compone de los campos tal que:
     * ```php
     * [
     *   "campo" => "valor",
     *    ...
     * ]
     * ```
     * En caso de no haber valores que correspondan a los campos, retorna un arreglo vacio.
     * @return array
     */
    public function getWhereParams(array $params)
    {
        $arrReturn = [];
        foreach ($params as $key => $value) {
            if (array_key_exists($key, $this->camposTabla)) {
                $arrReturn[$key] = $value;
            }
        }
        return $arrReturn;
    }

    /**
     * @param array $whereParams - Define los parametros que se usaran en el where, se compone de los campos tal que:
     * ```php
     * [
     *   "campo" => "valor para filtrar",
     *    ...
     * ]
     * ```
     * En caso de no haber valores para filtrar, no elimina nada por defecto.
     * @param bool $deleteSinWhere - Por defecto está en false, si se pone en true no es necesario enviar $whereParams ya que permite eliminar toda la tabla.
     * @return bool
     */
    public function delete(array $whereParams, bool $deleteSinWhere = false)
    {
        $pudo = false;
        $where = $this->armarWhere($whereParams);

        if ($where != "" || $deleteSinWhere) {
            $whereQuery = $this->generarDelete($whereParams);
            $pudo = $this->pdo->query($whereQuery)->execute();
        }

        return $pudo;
    }

    /**
     * @param array $queryParams - Array asociativo donde están los campos para filtar y los que se deben actualizar
     * 
     * Se compone de los campos tal que:
     * ```php
     * [
     *   "campo" => "valor para filtrar",
     *   "setcampo" => "valor nuevo",
     *    ...
     * ]
     * ```
     * En caso de no haber valores para filtrar, actualiza todas las filas de la tabla
     * @return bool
     */
    public function update(array $queryParams)
    {
        $pudo = false;

        $queryUpdate = $this->generarUpdate($queryParams);
        $pudo = $this->pdo->query($queryUpdate)->execute();

        return $pudo;
    }

    /**
     * @param array $datosIn - Array asociativo donde están los campos a cargar con sus valores
     * 
     * Se compone de los campos tal que:
     * ```php
     * [
     *   "campo" => "valor a insertar",
     *    ...
     * ]
     * ```
     * Es necesario pasar todos los campos obligatorios, caso contrario no será posible cargar los datos a la bd.
     * @return bool
     */
    public function insert(array $datosIn)
    {
        $pudo = false;

        $queryInsert = $this->generarInsert($datosIn);

        $pudo = $this->pdo->prepare($queryInsert)->execute();

        $this->lastId = $this->pdo->lastInsertId();

        return $pudo;
    }

    /**
     * @param array $whereParams Array asociativo de los valores para el where
     * ``` $valuesWhere = [
     *      'nombre_campo' => 'valor',
     *      'username' => 'pepe'
     * ]```
     * @param bool $include define si se incluyen las relaciones que posee la entidad (por ahora solo funciona con entidades que tienen la fk explicita)
     * @param bool $like define si en el where se compara por exactos o coincidencias %valor%
     * @param ?int $limit define la cantidad de lineas a retornar
     * @param int $offset define el desplazamiento, es decir, con limite 1 y desplazamiento 20 devuelve el 20avo elemento.
     */
    public function getFirst(array $whereParams, bool $include = false, bool $like = false, int $limit = 1, int $offset = 0)
    {
        $querySelect = $this->generarSelect($whereParams, $limit, $like, $offset);
        //error_log($querySelect);
        $result = $this->pdo->query($querySelect)->fetchAll();

        if ($result == false) {
            $result = [];
        }

        return $result; // esto retorna un array de arrays asociativos, si está vacio retorna []
    }

    /**
     * @param array $whereParams Array asociativo de los valores para asignar a cada campo
     * ``` $whereParams = [
     *      'nombre_campo' => 'valor',
     *      'username' => 'pepe'
     * ]```
     * @param bool $like define si en el where se compara por exactos o coincidencias %valor%
     */
    public function getAll(array $whereParams, bool $like = false)
    {
        $querySelect = $this->generarSelect($whereParams, null, $like);
        //error_log($querySelect);
        $result = $this->pdo->query($querySelect)->fetchAll();
        if ($result == false) {
            $result = [];
        }
        return $result; // esto retorna un json con los objetos, si está vacio retorna {}
    }

    /**
     * @param array $valuesIn Array asociativo de los valores para asignar a cada campo
     * ``` $valuesIn = [
     *      'nombre_campo' => 'valor',
     *      'username' => 'pepe'
     * ]```
     * 
     * Se insertaran solo aquellos campos que aparezcan en $valuesIn, si un campo no aparece no será tomado en cuenta.
     */
    private function generarInsert(array $valuesIn)
    {
        // INSERT INTO `centro_volun` (`centro`, `voluntario`) VALUES ('', '')
        $querySql = "INSERT INTO `$this->tableName` (";
        // armar parte de los campos
        foreach ($valuesIn as $key => $value) {
            if (array_key_exists($key, $this->camposTabla)) {
                $querySql .= "`$key`,";
            }
        }
        $querySql = substr($querySql, 0, strlen($querySql) - 1) . ") VALUES (";
        // armar parte de los valores
        foreach ($valuesIn as $key => $value) {
            if (array_key_exists($key, $this->camposTabla)) {
                $querySql .= "'$value',";
            }
        }
        $querySql = substr($querySql, 0, strlen($querySql) - 1) . ")";
        //error_log($querySql);
        return $querySql;
    }

    /**
     * @param array $whereParams Array asociativo de los valores para asignar a cada campo
     * ``` $whereParams = [
     *      'nombre_campo' => 'valor',
     *      'username' => 'pepe'
     * ]```
     * @param bool $like define si en el where se compara por exactos o coincidencias %valor%
     */
    private function armarWhere(array $whereParams, bool $like = false)
    {
        $queryWhere = "WHERE ";
        $querySize = strlen($queryWhere);
        foreach ($whereParams as $key => $value) { // para cada param
            if (array_key_exists($key, $this->camposTabla) && $value != "") { // si existe en la lista de campos
                if ($value == "null") { // si es null en la query
                    $queryWhere .= "`$key` IS NULL ";
                } else {
                    $queryWhere .= "`$key` " . $this->camposTabla[$key]['comparador'];
                    if ($this->camposTabla[$key]['comparador'] == "like") ($like) ? $queryWhere .= " '%$value%' " : $queryWhere .= " '$value' ";
                    else $queryWhere .= " $value ";
                }
                $queryWhere .= "AND ";
            }
        }
        if ($querySize < strlen($queryWhere)) $queryWhere = substr($queryWhere, 0, strlen($queryWhere) - 4);

        if (strlen($queryWhere) <= $querySize) {
            $queryWhere = "";
        }

        return $queryWhere;
    }

    /**
     * @param array $whereParams Array asociativo de los valores para el where
     * ```php 
     * $valuesWhere = [
     *      'nombre_campo' => 'valor',
     *      'username' => 'pepe'
     * ]```
     * @param bool $like define si en el where se compara por exactos o coincidencias %valor%
     * @param ?int $limit define la cantidad de lineas a retornar
     * @param int $offset numero de pagina arrancando en 0
     */
    private function generarSelect(array $whereParams, ?int $limit = 1, bool $like = false, int $offset = 0)
    {
        // SELECT * FROM `usuarios` WHERE params LIMIT 1
        $querySql = "SELECT * FROM $this->tableName ";

        $querySql .= $this->armarWhere($whereParams, $like);

        if ($limit != null) {
            $querySql .= "LIMIT $limit OFFSET " . ($offset * $limit);
        }
        return $querySql;
    }

    /**
     * @param array $valuesIn Array asociativo de los valores para actualizar y para el filtrar con where
     * ``` $valuesIn = [
     *      'nombre_campo' => 'valor',
     *      'setnombre_campo' => 'valor',
     *      'username' => 'pepe',
     *      'setdni' => '1234'
     * ]```
     * 
     * Los campos normales son los que iran en el where, los campos son el prefijo set serán los actualizados por el valor
     * @param bool $like define si en el where se compara por exactos o coincidencias %valor%
     */
    private function generarUpdate(array $valuesIn, bool $like = false)
    {
        //UPDATE `usuarios` SET `dni` = '1234' WHERE `username` = 'claudio'
        $querySql = "UPDATE `$this->tableName` SET ";
        // ACA TIENEN QUE MANDAR setdni=1234 o setusername=nuevo_user
        $setParams = $this->getSetParams($valuesIn);
        foreach ($setParams as $key => $value) {
            if (array_key_exists($key, $this->camposTabla)) {
                $querySql .= "`$key` = '$value', ";
            }
        }
        $querySql = substr($querySql, 0, strlen($querySql) - 2); // quita ultimo espacio y coma
        $querySql .= $this->armarWhere($valuesIn, $like);

        return $querySql;
    }

    /**
     * @param array $valuesWhere Array asociativo de los valores para el where
     * ``` $valuesWhere = [
     *      'nombre_campo' => 'valor',
     *      'username' => 'pepe'
     * ]```
     * @param bool $like define si en el where se compara por exactos o coincidencias %valor%
     */
    private function generarDelete(array $whereParams, bool $like = false)
    {
        // DELETE FROM `usuarios` WHERE COSAS
        $querySql = "DELETE FROM `$this->tableName` " . $this->armarWhere($whereParams, $like);
        return $querySql;
    }
}

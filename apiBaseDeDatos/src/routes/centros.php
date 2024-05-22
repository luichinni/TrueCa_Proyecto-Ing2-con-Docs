<?php

use Slim\Routing\RouteCollectorProxy;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once __DIR__ . '/../utilities/bdController.php';

/*
CREATE TABLE Centros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    Nombre varchar(255),
    direccion varchar (255),
    hora_abre TIME,
    hora_cierra TIME
 )
*/

$camposCentro = [
    'id' => '?int',
    'nombre' => 'varchar',
    'direccion' => 'varchar',
    'hora_abre' => 'time',
    'hora_cierra' => 'time'
];

$centroDB = new bdController('centros',$pdo,$camposCentro);

function validaDatos($data, $response) {
    $columna = ['nombre', 'direccion', 'hora_abre', 'hora_cierra'];

    foreach ($columna as $colum) {
        if (!isset($data[$colum]) || empty($data[$colum])) {
/*             $errorResponse = ['error' => 'El campo: ' . $colum . ' es requerido'];
            $response->getBody()->write(json_encode($errorResponse)); */
            return false;
        }
    }

    $revisarCar = ['nombre', 'direccion'];
    foreach ($revisarCar as $revi) {
        if (isset($data[$revi]) && strlen($data[$revi]) > 255) {
/*             $errorResponse = ['error' => 'El campo ' . $revi . ' excede los 255 caracteres permitidos'];
            $response->getBody()->write(json_encode($errorResponse)); */
            return false;
        }
        if (isset($data[$revi]) && strlen($data[$revi]) < 3) {
/*             $errorResponse = ['error' => 'El campo ' . $revi . ' debe tener al menos 3 caracteres'];
            $response->getBody()->write(json_encode($errorResponse)); */
            return false;
        }
    }

    $hora_abre = $data['hora_abre'];
    $hora_cierra = $data['hora_cierra'];

    if (!preg_match('/^(?:2[0-3]|[0-1][0-9]):[0-5][0-9]$/', $hora_abre) || !preg_match('/^(?:2[0-3]|[0-1][0-9]):[0-5][0-9]$/', $hora_cierra)) {
/*         $errorResponse = ['error' => 'Los campos de apertura y cierre deben estar en formato HH:MM, y estar entre los valores 00:00 y 23:59'];
        $response->getBody()->write(json_encode($errorResponse)); */
        return false;
    }

    if ($hora_abre >= $hora_cierra) {
/*         $errorResponse = ['error' => 'El horario de apertura debe ser menor al horario de cierre'];
        $response->getBody()->write(json_encode($errorResponse)); */
        return false;
    }

    return true;
}

$app->group('/public', function (RouteCollectorProxy $group) use ($pdo) {
    $group->POST('/newCentro', function ($request, $response, $args){
        $msgReturn = ['Mensaje' => 'Error de formato'];
        $data = $request->getParsedBody();

        if (json_last_error() !== JSON_ERROR_NONE) {
            /*             $errorResponse = ['error' => 'JSON no válido'];
            $response->getBody()->write(json_encode($errorResponse)); */
            $response->getBody()->write(json_encode($msgReturn));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        if (!validaDatos($data, $response)) {
            $msgReturn['Mensaje'] = 'Los datos de centro son invalidos';
            $response->getBody()->write(json_encode($msgReturn));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        global $centroDB;

        $status = $centroDB->insert($data) ? 200 : 500;

        $msgReturn['Mensaje'] = ($status == 200) ? 'Centro cargado con éxito' : 'Ocurrió un error al cargar el centro';

        $response->getBody()->write(json_encode($msgReturn));

        return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
    });

    $group->PUT('/updateCentros', function ($request, Response $response, $args){
        global $centroDB;
        $queryParams = $request->getParsedBody();
        $status = 500;
        $msgReturn = ['Mensaje'=> 'Faltan datos para poder actualizar el centro'];

        if ($centroDB->exists($queryParams['id'])) {
            $response->getBody()->write(json_encode($msgReturn));
            return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
        }

        if (!validaDatos($queryParams, $response)) {
            $response->getBody()->write(json_encode($msgReturn));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $status = $centroDB->update($queryParams) ? 200 : $status;

        $msgReturn['Mensaje'] = ($status == 200) ? 'Centro actualizado con éxito' : 'Ocurrió un error al actualizar el centro';

        $response->getBody()->write(json_encode($msgReturn));

        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    });

    $group->DELETE('/deleteCentro', function (Request $request, Response $response, $args){
        global $centroDB;
        //
        //FALTA VERIFICAR SI NO TIENE VOLUNTARIOS
        //FALTA VERIFICAR SI NO TIENE ASIGNADO ALGUN INTERCAMBIO (MENSAJE PARA LA PROXIMA)
        //        
        $status = 500;
        $msgReturn = ['Mensaje'=>'No existe el centro a eliminar'];

        $queryParams = $request->getQueryParams();

        if (!$centroDB->exists($queryParams)) {
            $response->getBody()->write(json_encode($msgReturn));
            return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
        }

        if (validarCentroVolun(array('centro'=>$queryParams['id']))){
            $msgReturn['Mensaje'] = 'No se pudo eliminar, el centro tiene voluntarios asociados';
            $response->getBody()->write(json_encode($msgReturn));
            return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
        }

        $status = $centroDB->delete($queryParams) ? 200 : $status;

        $msgReturn['Mensaje'] = ($status == 200) ? 'Centro eliminado con éxito' : 'Ocurrió un error al eliminar el centro';

        $response->getBody()->write(json_encode($msgReturn));

        return $response->withStatus($status)->withHeader('Content-Type', 'application/json');
    });

    $group->GET('/listarCentros', function (Request $request, Response $response, $args) use ($pdo) {
        global $centroDB;
        $msgReturn = ['Mensaje'=>'No existen centros'];

        $queryParams = $request->getQueryParams();

        $centros = json_decode($centroDB->getAll($queryParams));

        if (empty($centros)){
            $response->getBody()->write(json_encode($msgReturn));
            return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
        }

        $centros['Mensaje'] = 'Centros listados con éxito';

        $response->getBody()->write(json_encode($centros));
        return $response->withStatus(200)->withHeader('Content-Type', 'application/json');
    });
});
?>

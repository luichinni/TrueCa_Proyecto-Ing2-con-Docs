<?php

use Slim\Routing\RouteCollectorProxy;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once __DIR__ . '/../utilities/bdController.php';

require_once __DIR__ . '/../models/centroDb.php';

$app->group('/public', function (RouteCollectorProxy $group) use ($pdo) {
    $group->POST('/newCentro', function ($request, $response, $args){
        $data = $request->getParsedBody();

        global $centrosHandler;

        $centrosHandler->crear($data);

        $response->getBody()->write(json_encode(['Mensaje'=>$centrosHandler->mensaje]));

        return $response->withStatus($centrosHandler->status)->withHeader('Content-Type', 'application/json');
    });

    $group->PUT('/updateCentros', function ($request, Response $response, $args){
        $queryParams = $request->getParsedBody();
        
        global $centrosHandler;

        $centrosHandler->actualizar($queryParams);

        $response->getBody()->write(json_encode(['Mensaje'=>$centrosHandler->mensaje]));

        return $response->withStatus($centrosHandler->status)->withHeader('Content-Type', 'application/json');
    });

    $group->DELETE('/deleteCentro', function (Request $request, Response $response, $args){
        $queryParams = $request->getQueryParams();

        global $centrosHandler;

        $centrosHandler->borrar($queryParams);
        error_log($centrosHandler->mensaje);
        $response->getBody()->write(json_encode(['Mensaje'=>$centrosHandler->mensaje]));

        return $response->withStatus($centrosHandler->status)->withHeader('Content-Type', 'application/json');
    });

    $group->GET('/listarCentros', function (Request $request, Response $response, $args) use ($pdo) {
        $queryParams = $request->getQueryParams();

        $like = (array_key_exists('like',$queryParams)) ? $queryParams['like'] : true;

        global $centrosHandler;

        $centros = (array)$centrosHandler->listar($queryParams,$like);

        $centros['Mensaje'] = $centrosHandler->mensaje;

        $response->getBody()->write(json_encode($centros));
        return $response->withStatus($centrosHandler->status)->withHeader('Content-Type', 'application/json');
    });

    $group->GET('/getCentroVolunt', function (Request $request, Response $response, $args) use ($pdo) {
        $queryParams = $request->getQueryParams();

        if (!array_key_exists('voluntario',$queryParams)){
            $response->getBody()->write(json_encode(['Mensaje'=>'Es necesario un voluntario para buscar']));
            return $response->withStatus(500)->withHeader('Content-Type', 'application/json');
        }

        global $centrosHandler;

        $centro = $centrosHandler->obtenerCentroDeVoluntario($queryParams['voluntario']);

        if ($centro === false) $centro = [];

        $centro['Mensaje'] = $centrosHandler->mensaje;

        $response->getBody()->write(json_encode($centro));
        return $response->withStatus($centrosHandler->status)->withHeader('Content-Type', 'application/json');
    });
});
?>

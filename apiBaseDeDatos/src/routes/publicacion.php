<?php

use Slim\Routing\RouteCollectorProxy;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once __DIR__ . '/../utilities/bdController.php';

require_once __DIR__ . '/../models/publiDb.php';

$app->group('/public', function (RouteCollectorProxy $group)  {
    $group->POST('/newPublicacion', function ($request, $response, $args){
        $bodyParams = (array) $request->getParsedBody();
        error_log('body' . json_encode($bodyParams));
        global $publicacionesHandler;

        $publicacionesHandler->crear($bodyParams);

        $response->getBody()->write(json_encode(['Mensaje'=>$publicacionesHandler->mensaje]));
        return $response->withStatus($publicacionesHandler->status)->withHeader('Content-Type', 'application/json');
    });

    $group->PUT('/updatePublicacion', function ($request, Response $response, $args){
        $bodyParams = (array) $request->getParsedBody();
        
        global $publicacionesHandler;

        if (array_key_exists('centrosActuales', $bodyParams) && $bodyParams['centrosActuales'] != '') $bodyParams['centrosActuales'] = (array)json_decode($bodyParams['centrosActuales']);
        if (array_key_exists('imagenesActuales', $bodyParams) && $bodyParams['imagenesActuales'] != '') $bodyParams['imagenesActuales'] = (array)json_decode($bodyParams['imagenesActuales']);

        $publicacionesHandler->actualizar($bodyParams);

        $response->getBody()->write(json_encode(['Mensaje'=>$publicacionesHandler->mensaje]));
        return $response->withStatus($publicacionesHandler->status)->withHeader('Content-Type', 'application/json');
    });

    $group->DELETE('/deletePublicacion', function (Request $request, Response $response, $args){
        $queryParams = $request->getQueryParams();
        
        global $publicacionesHandler;

        $publicacionesHandler->borrar($queryParams);

        $response->getBody()->write(json_encode(['Mensaje' => $publicacionesHandler->mensaje]));
        return $response->withStatus($publicacionesHandler->status)->withHeader('Content-Type', 'application/json');
    });

    $group->GET('/listarPublicaciones', function ($request, Response $response, $args) {
        $queryParams = $request->getQueryParams();

        $habilitado = true;
        if(array_key_exists('habilitado', $queryParams)){
            $habilitado = $queryParams['habilitado'];
        }

        $like = (array_key_exists('like', $queryParams)) ? $queryParams['like'] : true;

        global $publicacionesHandler, $categoriasHandler;

        if (array_key_exists('categoria_id',$queryParams) && !ctype_digit($queryParams['categoria_id']) && $categoriasHandler->idPorNombre($queryParams['categoria_id']) !== false) $queryParams['categoria_id'] = $categoriasHandler->idPorNombre($queryParams['categoria_id']);

        $publis = $publicacionesHandler->listar($queryParams,$like,false,true,true,$habilitado);

        $publis['Mensaje'] = $publicacionesHandler->mensaje;

        $response->getBody()->write(json_encode($publis));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($publicacionesHandler->status);
    });
});
?>
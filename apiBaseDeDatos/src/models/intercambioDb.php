<?php
$camposIntercambio = [
    'id' => [
        "pk" => true,
        "tipo" => "int",
        "autoincrement" => true,
        "comparador" => "="
    ],
    'voluntario' => [
        "tipo" => "varchar(50)",
        "comparador" => "like",
        "opcional"=>true,
        "fk" => [
            "tabla" => "usuarios",
            "campo" => "username"
        ]
    ],
    'publicacionOferta' => [
        "tipo" => "int",
        "comparador" => "=",
        "fk" => [
            "tabla" => "publicacion",
            "campo" => "id"
        ]
    ], // quien publicó
    'publicacionOfertada' => [
        "tipo" => "int",
        "comparador" => "=",
        "fk" => [
            "tabla" => "publicacion",
            "campo" => "id"
        ]
    ], // quien ofertó
    'ofertaAcepta' => [
        "tipo" => "boolean",
        "comparador" => "=",
        "opcional" => true
    ],
    'ofertadaAcepta' => [
        "tipo" => "boolean",
        "comparador" => "=",
        "default" => "true"
    ],
    'horario' => [
        "tipo" => "datetime ON UPDATE CURRENT_TIMESTAMP",
        "comparador" => "="
    ],
    'estado' => [
        "tipo" => "ENUM('pendiente','rechazado','aceptado','concretado','cancelado') DEFAULT 'pendiente'",
        "comparador" => "like"
    ],
    'motivo' => [
        "tipo" => "ENUM('una publicacion dada de baja','ausencia ambas partes','ausencia anunciante','ausencia ofertante','producto anunciado no es lo esperado','producto ofertado no es lo esperado','se eligió una oferta superadora','el producto no es de interes', 'fecha y hora no convenientes', 'centro dado de baja')",
        "comparador" => "like",
        "opcional" => true
    ],
    'descripcion' => [
        "tipo" => "text",
        "comparador" => "like",
        "opcional" => true
    ],
    'donacion' => [
        "tipo" => "boolean",
        "comparador" => "=",
        "opcional" => true,
    ],
    'centro' => [
        "tipo" => "int",
        "comparador" => "=",
        "fk" => [
            "tabla" => "centros",
            "campo" => "id"
        ]
    ],
    /* 'fecha_propuesta' => '?DATETIME', created_at
    'fecha_modificado' => '?DATETIME'   updated_at    */
];

$intercambioDB = new bdController('intercambio', $pdo, $camposIntercambio);
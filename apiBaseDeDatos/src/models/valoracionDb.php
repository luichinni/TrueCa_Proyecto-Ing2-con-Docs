<?php
$camposValoraciones = [
    'id' => [
        "pk" => true,
        "tipo" => "int",
        "autoincrement" => true,
        "comparador" => "="
    ],
    'userValorado' => [
        "tipo" => "varchar (50)",
        "comparador" => "like",
        "fk" => [
            "tabla" => "usuarios",
            "campo" => "username"
        ]
    ],
    'userValorador' => [
        "tipo" => "varchar (50)",
        "comparador" => "like",
        "fk" => [
            "tabla" => "usuarios",
            "campo" => "username"
        ]
    ],
    'puntos' => [
        "tipo" => "float",
        "comparador" => "="
    ],
    'intercambio' => [
        "tipo" => "int",
        "comparador" => "=",
        "fk" => [
            "tabla" => "intercambio",
            "campo" => "id"
        ]
    ],
    /* 'fecha' => '?datetime', created_at
    'fecha_modificado' => '?datetime'   updated_at      */
];

$valoracionesDB = new bdController('valoraciones', $pdo, $camposValoraciones);
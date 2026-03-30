<?php

namespace App\Http\Controllers;

/**
 * @OA\Info(
 *      version="1.0.0",
 *      title="EduFlow API Documentation",
 *      description="Swagger OpenApi implementation for EduFlow",
 *      @OA\Contact(
 *          email="support@eduflow.test"
 *      )
 * )
 *
 * @OA\Server(
 *      url="/api",
 *      description="Primary API Server"
 * )
 * 
 * @OA\SecurityScheme(
 *      securityScheme="bearerAuth",
 *      in="header",
 *      name="Authorization",
 *      type="http",
 *      scheme="bearer",
 *      bearerFormat="JWT",
 * )
 */
abstract class Controller
{
    //
}

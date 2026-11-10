using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace TransporteEscolarAPI.Middleware
{
    /// <summary>
    /// Hace que TODA respuesta de error de la API tenga la forma { mensaje: "...", errores?: {...} }
    /// con textos en español, para que el frontend siempre pueda mostrar un mensaje al usuario.
    /// </summary>
    public static class ManejoErrores
    {
        // Errores de validación de los DTO ([Required], [StringLength], JSON mal formado...)
        public static IMvcBuilder AddRespuestasDeValidacion(this IMvcBuilder builder)
        {
            return builder.ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var errores = context.ModelState
                        .Where(e => e.Value != null && e.Value.Errors.Count > 0)
                        .ToDictionary(
                            e => NombreCampo(e.Key),
                            e => e.Value!.Errors.Select(err => TraducirError(e.Key, err.ErrorMessage)).Distinct().ToArray());

                    var mensaje = string.Join(" ", errores.SelectMany(e => e.Value).Distinct());
                    if (string.IsNullOrWhiteSpace(mensaje)) mensaje = "Los datos enviados no son válidos.";

                    return new BadRequestObjectResult(new { mensaje, errores });
                };
            });
        }

        // Excepciones no controladas (incluidos errores de PostgreSQL) => JSON con mensaje legible
        public static IApplicationBuilder UseManejoErrores(this IApplicationBuilder app)
        {
            return app.Use(async (context, next) =>
            {
                try
                {
                    await next();
                }
                catch (Exception ex) when (!context.Response.HasStarted)
                {
                    var (status, mensaje) = Traducir(ex);
                    if (status >= 500)
                    {
                        var logger = context.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("ManejoErrores");
                        logger.LogError(ex, "Error no controlado en {Metodo} {Ruta}", context.Request.Method, context.Request.Path);
                    }

                    // No se limpian las cabeceras para conservar las de CORS (si no, el navegador oculta el mensaje)
                    context.Response.StatusCode = status;
                    context.Response.ContentType = "application/json; charset=utf-8";
                    await context.Response.WriteAsJsonAsync(new { mensaje });
                }
            });
        }

        private static (int status, string mensaje) Traducir(Exception ex)
        {
            if (ex is DbUpdateException { InnerException: PostgresException pg })
            {
                return pg.SqlState switch
                {
                    PostgresErrorCodes.UniqueViolation => (409, "Ya existe un registro con esos datos (valor duplicado)."),
                    PostgresErrorCodes.ForeignKeyViolation => (409, "No se puede completar la operación porque el registro está relacionado con otros datos."),
                    PostgresErrorCodes.NotNullViolation => (400, "Falta un dato obligatorio."),
                    PostgresErrorCodes.StringDataRightTruncation => (400, "Uno de los campos supera la longitud máxima permitida."),
                    _ => (500, "No se pudo guardar la información en la base de datos.")
                };
            }

            if (ex is DbUpdateException)
                return (500, "No se pudo guardar la información en la base de datos.");

            return (500, "Ocurrió un error inesperado en el servidor. Intenta de nuevo.");
        }

        // "$.idVehiculo" -> "idVehiculo"
        private static string NombreCampo(string clave)
        {
            if (string.IsNullOrEmpty(clave)) return "general";
            return clave.StartsWith("$.") ? clave[2..] : clave.TrimStart('$');
        }

        // Los errores de conversión JSON vienen en inglés y con detalles técnicos
        private static string TraducirError(string clave, string mensaje)
        {
            if (string.IsNullOrWhiteSpace(mensaje))
                return $"El campo '{NombreCampo(clave)}' tiene un valor inválido.";
            if (mensaje.StartsWith("The JSON value") || mensaje.Contains("could not be converted"))
                return $"El campo '{NombreCampo(clave)}' tiene un formato inválido.";
            if (mensaje.Contains("field is required") && (clave.EndsWith("DTO", StringComparison.OrdinalIgnoreCase) || string.IsNullOrEmpty(clave)))
                return "No se enviaron datos en la petición.";
            return mensaje;
        }
    }
}

using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TransporteEscolarAPI.Data;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Service
{
    public interface INotificacionService
    {
        Task EnviarAsync(IEnumerable<int> idsUsuario, string titulo, string cuerpo, string canal = "recorrido", object? datos = null);
        Task NotificarAcudientesDelViajeAsync(int idViaje, string titulo, string cuerpo);
        Task NotificarAcudienteDeEstudianteAsync(int idEstudiante, string titulo, string cuerpo);
        Task NotificarAdministradoresAsync(string titulo, string cuerpo, object? datos = null);
        Task NotificarAsistenciaAsync(int idEstudiante, string estadoAbordaje);
        // Avisa a cada acudiente cuando el bus se acerca a su parada y cuando llega al colegio
        Task RevisarProximidadAsync(int idViaje, decimal latitud, decimal longitud);
    }

    /// <summary>
    /// Push con el servicio de Expo (https://docs.expo.dev/push-notifications/sending-notifications/).
    /// Nunca lanza excepciones: una notificación fallida no debe romper el flujo del recorrido.
    /// </summary>
    public class NotificacionService : INotificacionService
    {
        private const string EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
        private const int ROL_ADMINISTRADOR = 1;
        private static readonly (double Km, string Texto)[] UMBRALES = { (1.0, "a 1 km"), (0.3, "a menos de 300 m") };

        // shortcut: avisos ya enviados en memoria; tras reiniciar la API puede repetirse un aviso. Pasar a tabla si molesta
        private static readonly ConcurrentDictionary<string, byte> _avisosEnviados = new();

        private readonly AppDbContext _db;
        private readonly HttpClient _http;
        private readonly ILogger<NotificacionService> _logger;

        public NotificacionService(AppDbContext db, IHttpClientFactory httpFactory, ILogger<NotificacionService> logger)
        {
            _db = db;
            _http = httpFactory.CreateClient();
            _logger = logger;
        }

        public async Task EnviarAsync(IEnumerable<int> idsUsuario, string titulo, string cuerpo, string canal = "recorrido", object? datos = null)
        {
            try
            {
                var ids = idsUsuario.Distinct().ToList();
                var tokens = await _db.DispositivosPush.Where(d => ids.Contains(d.IdUsuario)).Select(d => d.Token).ToListAsync();
                // Expo acepta hasta 100 mensajes por petición
                foreach (var lote in tokens.Chunk(100))
                {
                    var mensajes = lote.Select(t => new
                    {
                        to = t,
                        title = titulo,
                        body = cuerpo,
                        sound = "default",
                        priority = "high",
                        channelId = canal,
                        data = datos ?? new { },
                    }).ToList();

                    var resp = await _http.PostAsJsonAsync(EXPO_PUSH_URL, mensajes);
                    if (!resp.IsSuccessStatusCode)
                    {
                        _logger.LogWarning("Expo push respondió {Status}", resp.StatusCode);
                        continue;
                    }
                    await LimpiarTokensInvalidosAsync(lote, await resp.Content.ReadFromJsonAsync<JsonElement>());
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enviando notificaciones push");
            }
        }

        // Expo devuelve un ticket por mensaje, en el mismo orden; DeviceNotRegistered = app desinstalada
        private async Task LimpiarTokensInvalidosAsync(string[] lote, JsonElement respuesta)
        {
            if (!respuesta.TryGetProperty("data", out var tickets) || tickets.ValueKind != JsonValueKind.Array) return;
            var invalidos = new List<string>();
            var i = 0;
            foreach (var ticket in tickets.EnumerateArray())
            {
                if (i < lote.Length &&
                    ticket.TryGetProperty("details", out var det) &&
                    det.TryGetProperty("error", out var err) &&
                    err.GetString() == "DeviceNotRegistered")
                    invalidos.Add(lote[i]);
                i++;
            }
            if (invalidos.Count == 0) return;
            _db.DispositivosPush.RemoveRange(_db.DispositivosPush.Where(d => invalidos.Contains(d.Token)));
            await _db.SaveChangesAsync();
        }

        // La ruta no tiene FK al vehículo: se enlaza por la placa guardada en la descripción ("Vehículo: ABC123")
        private async Task<List<Estudiante>> EstudiantesDelViajeAsync(int idViaje)
        {
            var viaje = await _db.Historiales.FindAsync(idViaje);
            if (viaje == null) return new();
            var placa = await _db.Vehiculos.Where(v => v.IdVehiculo == viaje.IdVehiculo).Select(v => v.Placa).FirstOrDefaultAsync();
            if (string.IsNullOrEmpty(placa)) return new();

            var idsRuta = await _db.Rutas
                .Where(r => r.Descripcion != null && r.Descripcion.Contains($"Vehículo: {placa}"))
                .Select(r => r.IdRuta)
                .ToListAsync();
            return await _db.Estudiantes
                .Where(e => e.Estado && e.IdRuta != null && idsRuta.Contains(e.IdRuta.Value))
                .ToListAsync();
        }

        private Task<List<int>> UsuariosAcudientesAsync(IEnumerable<int> idsAcudiente)
        {
            var ids = idsAcudiente.Distinct().ToList();
            return _db.Acudientes.Where(a => ids.Contains(a.IdAcudiente)).Select(a => a.IdUsuario).ToListAsync();
        }

        public async Task NotificarAcudientesDelViajeAsync(int idViaje, string titulo, string cuerpo)
        {
            try
            {
                var estudiantes = await EstudiantesDelViajeAsync(idViaje);
                await EnviarAsync(await UsuariosAcudientesAsync(estudiantes.Select(e => e.IdAcudiente)), titulo, cuerpo, "recorrido", new { idViaje });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notificando acudientes del viaje {IdViaje}", idViaje);
            }
        }

        public async Task NotificarAcudienteDeEstudianteAsync(int idEstudiante, string titulo, string cuerpo)
        {
            try
            {
                var est = await _db.Estudiantes.FindAsync(idEstudiante);
                if (est == null) return;
                await EnviarAsync(await UsuariosAcudientesAsync(new[] { est.IdAcudiente }), titulo, cuerpo, "recorrido", new { idEstudiante });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notificando acudiente del estudiante {IdEstudiante}", idEstudiante);
            }
        }

        public async Task NotificarAsistenciaAsync(int idEstudiante, string estadoAbordaje)
        {
            try
            {
                var est = await _db.Estudiantes.FindAsync(idEstudiante);
                if (est == null) return;
                var hora = DateTime.Now.ToString("h:mm tt");
                var (titulo, cuerpo) = estadoAbordaje switch
                {
                    "Abordo" => ("✅ Abordó el bus", $"{est.Nombre} subió al bus a las {hora}."),
                    "Ausente" => ("⚠️ No abordó", $"{est.Nombre} fue marcado ausente en la parada a las {hora}."),
                    "Entregado" => ("🏫 Entregado", $"{est.Nombre} fue entregado a las {hora}."),
                    _ => (null, null),
                };
                if (titulo != null)
                    await EnviarAsync(await UsuariosAcudientesAsync(new[] { est.IdAcudiente }), titulo, cuerpo!, "recorrido", new { idEstudiante });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notificando asistencia del estudiante {IdEstudiante}", idEstudiante);
            }
        }

        public async Task NotificarAdministradoresAsync(string titulo, string cuerpo, object? datos = null)
        {
            try
            {
                var admins = await _db.Usuarios.Where(u => u.IdRol == ROL_ADMINISTRADOR).Select(u => u.IdUsuario).ToListAsync();
                await EnviarAsync(admins, titulo, cuerpo, "alertas", datos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notificando administradores");
            }
        }

        public async Task RevisarProximidadAsync(int idViaje, decimal latitud, decimal longitud)
        {
            try
            {
                var estudiantes = await EstudiantesDelViajeAsync(idViaje);
                if (estudiantes.Count == 0) return;

                var idsRuta = estudiantes.Select(e => e.IdRuta!.Value).Distinct().ToList();
                var paradas = await _db.Paradas.Where(p => idsRuta.Contains(p.IdRuta)).ToListAsync();
                var asistencias = await _db.AsistenciasViajes.Where(a => a.IdViaje == idViaje).ToListAsync();

                foreach (var est in estudiantes)
                {
                    var estado = asistencias.FirstOrDefault(a => a.IdEstudiante == est.IdEstudiante)?.EstadoAbordaje ?? "Pendiente";

                    // Antes de abordar: avisos de cercanía a la parada del estudiante
                    var parada = paradas.FirstOrDefault(p => p.IdParada == est.IdParada);
                    if (estado == "Pendiente" && parada != null)
                    {
                        var km = DistanciaKm(latitud, longitud, parada.Latitud, parada.Longitud);
                        foreach (var (umbral, texto) in UMBRALES)
                        {
                            if (km <= umbral && _avisosEnviados.TryAdd($"{idViaje}:{est.IdEstudiante}:{umbral}", 0))
                            {
                                await NotificarAcudienteDeEstudianteAsync(est.IdEstudiante,
                                    umbral < 1 ? "🚌 ¡El bus está llegando!" : "🚌 El bus está cerca",
                                    $"El bus de {est.Nombre} está {texto} de la parada {parada.NombreParada}. Prepárate.");
                                break; // solo el aviso más cercano que aplique
                            }
                        }
                    }

                    // Ya a bordo: aviso al llegar a la última parada de la ruta (el colegio)
                    var destino = paradas.Where(p => p.IdRuta == est.IdRuta).OrderByDescending(p => p.OrdenVisita).FirstOrDefault();
                    if (estado == "Abordo" && destino != null &&
                        DistanciaKm(latitud, longitud, destino.Latitud, destino.Longitud) <= 0.15 &&
                        _avisosEnviados.TryAdd($"{idViaje}:{est.IdEstudiante}:destino", 0))
                    {
                        await NotificarAcudienteDeEstudianteAsync(est.IdEstudiante, "🏫 Llegó al colegio",
                            $"{est.Nombre} llegó a {destino.NombreParada}.");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error revisando proximidad del viaje {IdViaje}", idViaje);
            }
        }

        private static double DistanciaKm(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
        {
            static double Rad(double g) => g * Math.PI / 180;
            double dLat = Rad((double)(lat2 - lat1)), dLon = Rad((double)(lon2 - lon1));
            var a = Math.Pow(Math.Sin(dLat / 2), 2) +
                    Math.Cos(Rad((double)lat1)) * Math.Cos(Rad((double)lat2)) * Math.Pow(Math.Sin(dLon / 2), 2);
            return 6371 * 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        }
    }
}

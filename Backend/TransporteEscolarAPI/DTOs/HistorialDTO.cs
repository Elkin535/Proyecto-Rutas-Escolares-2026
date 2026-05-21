using System;

namespace TransporteEscolarAPI.DTOs
{
    public class HistorialDTO
    {
        public int IdViaje { get; set; }
        public int IdVehiculo { get; set; }
        public int IdConductor { get; set; }
        public DateTime Fecha { get; set; }
        public TimeSpan HoraInicio { get; set; }
        public TimeSpan? HoraFin { get; set; }
        public string EstadoViaje { get; set; } = string.Empty;
        public decimal? LatitudActual { get; set; }
        public decimal? LongitudActual { get; set; }
    }
}
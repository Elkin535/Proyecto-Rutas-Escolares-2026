using System;

namespace TransporteEscolarAPI.DTOs
{
    public class AsistenciaViajeDTO
    {
        public int IdAsistencia { get; set; }
        public int IdViaje { get; set; }
        public int IdEstudiante { get; set; }
        public string EstadoAbordaje { get; set; } = string.Empty;
        public TimeSpan? HoraAbordaje { get; set; }
        public TimeSpan? HoraEntrega { get; set; }
    }
}

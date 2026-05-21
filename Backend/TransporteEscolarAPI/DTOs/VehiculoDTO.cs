using System;

namespace TransporteEscolarAPI.DTOs
{
    public class VehiculoDTO
    {
        public int IdVehiculo { get; set; }
        public string Placa { get; set; } = string.Empty;
        public string? Modelo { get; set; }
        public int CapacidadPasajeros { get; set; }
        public DateTime? SoatVencimiento { get; set; }
        public DateTime? TecnomecanicaVencimiento { get; set; }
    }
}
namespace TransporteEscolarAPI.DTOs
{
    public class ConductorDTO
    {
        public int IdConductor { get; set; }
        public int IdUsuario { get; set; }
        public int? IdVehiculo { get; set; }
        public string NumeroLicencia { get; set; } = string.Empty;
        public string? CategoriaLicencia { get; set; }
    }
}
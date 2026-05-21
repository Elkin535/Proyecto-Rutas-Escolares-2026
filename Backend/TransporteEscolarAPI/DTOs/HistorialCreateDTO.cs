using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class HistorialCreateDTO
    {
        [Required]
        public int IdVehiculo { get; set; }

        [Required]
        public int IdConductor { get; set; }
    }
}
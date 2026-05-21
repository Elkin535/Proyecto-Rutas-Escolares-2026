using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class UbicacionGPSDTO
    {
        [Required]
        public decimal LatitudActual { get; set; }
        
        [Required]
        public decimal LongitudActual { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class AlertaCreateDTO
    {
        [Required]
        [RegularExpression("Microsueño|Fatiga")]
        public string Tipo { get; set; } = string.Empty;

        public int? IdViaje { get; set; }
        public decimal? Latitud { get; set; }
        public decimal? Longitud { get; set; }
    }
}

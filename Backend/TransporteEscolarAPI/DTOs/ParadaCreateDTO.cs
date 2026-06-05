using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class ParadaCreateDTO
    {
        [Required]
        public int IdRuta { get; set; }

        [Required]
        [StringLength(150)]
        public string NombreParada { get; set; } = string.Empty;

        [Required]
        public decimal Latitud { get; set; }

        [Required]
        public decimal Longitud { get; set; }

        [Required]
        public int OrdenVisita { get; set; }
    }
}

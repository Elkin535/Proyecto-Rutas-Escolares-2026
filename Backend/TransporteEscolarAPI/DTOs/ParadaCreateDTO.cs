using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class ParadaCreateDTO
    {
        [Range(1, int.MaxValue, ErrorMessage = "Debes indicar la ruta de la parada.")]
        public int IdRuta { get; set; }

        [Required(ErrorMessage = "El nombre de la parada es obligatorio.")]
        [StringLength(150, ErrorMessage = "El nombre de la parada no puede superar los 150 caracteres.")]
        public string NombreParada { get; set; } = string.Empty;

        [Range(-90, 90, ErrorMessage = "La latitud debe estar entre -90 y 90.")]
        public decimal Latitud { get; set; }

        [Range(-180, 180, ErrorMessage = "La longitud debe estar entre -180 y 180.")]
        public decimal Longitud { get; set; }

        [Range(1, int.MaxValue, ErrorMessage = "El orden de visita debe ser mayor que 0.")]
        public int OrdenVisita { get; set; }
    }
}

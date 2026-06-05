using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class RutaCreateDTO
    {
        [Required]
        [StringLength(100)]
        public string NombreRuta { get; set; } = string.Empty;

        [StringLength(250)]
        public string? Descripcion { get; set; }
    }
}

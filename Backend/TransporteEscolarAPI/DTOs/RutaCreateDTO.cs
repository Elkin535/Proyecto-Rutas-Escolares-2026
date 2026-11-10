using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class RutaCreateDTO
    {
        [Required(ErrorMessage = "El nombre de la ruta es obligatorio.")]
        [StringLength(100, ErrorMessage = "El nombre de la ruta no puede superar los 100 caracteres.")]
        public string NombreRuta { get; set; } = string.Empty;

        [StringLength(250, ErrorMessage = "La descripción no puede superar los 250 caracteres.")]
        public string? Descripcion { get; set; }
    }
}

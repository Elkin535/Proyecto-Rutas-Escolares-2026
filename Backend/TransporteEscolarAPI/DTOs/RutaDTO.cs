using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    // Se usa como respuesta y también como cuerpo de Ruta/actualizar
    public class RutaDTO
    {
        public int IdRuta { get; set; }

        [Required(ErrorMessage = "El nombre de la ruta es obligatorio.")]
        [StringLength(100, ErrorMessage = "El nombre de la ruta no puede superar los 100 caracteres.")]
        public string NombreRuta { get; set; } = string.Empty;

        [StringLength(250, ErrorMessage = "La descripción no puede superar los 250 caracteres.")]
        public string? Descripcion { get; set; }

        public bool Estado { get; set; }
    }
}

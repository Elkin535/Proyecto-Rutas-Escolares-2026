using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class RolCreateDTO
    {
        [Required]
        [StringLength(50)]
        public string NombreRol { get; set; } = string.Empty;
    }
}
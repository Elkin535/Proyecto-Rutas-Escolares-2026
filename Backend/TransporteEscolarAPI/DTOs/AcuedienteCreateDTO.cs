using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class AcudienteCreateDTO
    {
        [Required]
        public int IdUsuario { get; set; }

        [StringLength(200)]
        public string? DireccionResidencia { get; set; }
    }
}
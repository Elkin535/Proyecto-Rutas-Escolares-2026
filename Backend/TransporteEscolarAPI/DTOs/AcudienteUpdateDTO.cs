using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class AcudienteUpdateDTO
    {
        [Required]
        public int IdUsuario { get; set; }

        [StringLength(255)]
        public string? DireccionResidencia { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class AsistenciaViajeCreateDTO
    {
        [Required]
        public int IdViaje { get; set; }

        [Required]
        public int IdEstudiante { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class AsistenciaViajeUpdateDTO
    {
        [Required]
        [StringLength(20)]
        public string EstadoAbordaje { get; set; } = string.Empty; // Pendiente, Abordo, Entregado, Ausente
    }
}

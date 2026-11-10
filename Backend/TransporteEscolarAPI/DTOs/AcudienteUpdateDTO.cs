using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class AcudienteUpdateDTO
    {
        [Range(1, int.MaxValue, ErrorMessage = "Debes indicar el usuario del acudiente.")]
        public int IdUsuario { get; set; }

        [StringLength(200, ErrorMessage = "La dirección no puede superar los 200 caracteres.")]
        public string? DireccionResidencia { get; set; }
    }
}

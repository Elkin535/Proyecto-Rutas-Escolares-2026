using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class ImagenRostroDTO
    {
        // JPEG en base64 (con o sin prefijo "data:image/jpeg;base64,")
        [Required]
        public string ImagenBase64 { get; set; } = string.Empty;

        // Datos biométricos de menores: requieren autorización del acudiente (Ley 1581 de 2012)
        public bool ConsentimientoAcudiente { get; set; }
    }
}

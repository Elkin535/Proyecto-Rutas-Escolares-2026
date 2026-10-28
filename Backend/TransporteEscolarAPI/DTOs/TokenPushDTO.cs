using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class TokenPushDTO
    {
        [Required]
        [StringLength(200)]
        public string Token { get; set; } = string.Empty;
    }
}

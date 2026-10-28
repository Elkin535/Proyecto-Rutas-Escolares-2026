using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransporteEscolarAPI.Models
{
    // Token de Expo Push de cada celular donde el usuario inició sesión
    [Table("dispositivo_push")]
    public class DispositivoPush
    {
        [Key]
        [Column("id_dispositivo")]
        public int IdDispositivo { get; set; }

        [Column("id_usuario")]
        [Required]
        public int IdUsuario { get; set; }

        [Column("token")]
        [Required]
        [StringLength(200)]
        public string Token { get; set; } = string.Empty;

        [Column("fecha_registro")]
        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    }
}

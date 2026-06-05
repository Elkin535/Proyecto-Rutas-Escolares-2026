using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransporteEscolarAPI.Models
{
    [Table("asistencia_viaje")]
    public class AsistenciaViaje
    {
        [Key]
        [Column("id_asistencia")]
        public int IdAsistencia { get; set; }

        [Column("id_viaje")]
        [Required]
        public int IdViaje { get; set; }

        [Column("id_estudiante")]
        [Required]
        public int IdEstudiante { get; set; }

        [Column("estado_abordaje")]
        [Required]
        [StringLength(20)]
        public string EstadoAbordaje { get; set; } = "Pendiente"; // Pendiente, Abordo, Entregado, Ausente

        [Column("hora_abordaje")]
        public TimeSpan? HoraAbordaje { get; set; }

        [Column("hora_entrega")]
        public TimeSpan? HoraEntrega { get; set; }
    }
}

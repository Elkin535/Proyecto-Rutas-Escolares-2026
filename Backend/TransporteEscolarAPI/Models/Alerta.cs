using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransporteEscolarAPI.Models
{
    [Table("alerta")]
    public class Alerta
    {
        [Key]
        [Column("id_alerta")]
        public int IdAlerta { get; set; }

        [Column("tipo")]
        [Required]
        [StringLength(30)]
        public string Tipo { get; set; } = string.Empty; // Microsueño, Fatiga

        [Column("id_conductor")]
        [Required]
        public int IdConductor { get; set; }

        [Column("id_viaje")]
        public int? IdViaje { get; set; }

        [Column("mensaje")]
        [StringLength(255)]
        public string Mensaje { get; set; } = string.Empty;

        [Column("latitud")]
        public decimal? Latitud { get; set; }

        [Column("longitud")]
        public decimal? Longitud { get; set; }

        [Column("fecha")]
        public DateTime Fecha { get; set; } = DateTime.UtcNow;

        [Column("atendida")]
        public bool Atendida { get; set; }
    }
}

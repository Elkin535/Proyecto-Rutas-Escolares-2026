using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TransporteEscolarAPI.Models
{
    [Table("historial")]
    public class Historial
    {
        [Key]
        [Column("id_viaje")]
        public int IdViaje { get; set; }

        [Column("id_vehiculo")]
        [Required]
        public int IdVehiculo { get; set; }

        [Column("id_conductor")]
        [Required]
        public int IdConductor { get; set; }

        [Column("fecha")]
        public DateTime Fecha { get; set; } = DateTime.Today;

        [Column("hora_inicio")]
        [Required]
        public TimeSpan HoraInicio { get; set; } // TIME de Postgres se mapea como TimeSpan

        [Column("hora_fin")]
        public TimeSpan? HoraFin { get; set; }

        [Column("estado_viaje")]
        [StringLength(20)]
        public string EstadoViaje { get; set; } = "En progreso";

        [Column("latitud_actual")]
        public decimal? LatitudActual { get; set; }

        [Column("longitud_actual")]
        public decimal? LongitudActual { get; set; }
    }
}
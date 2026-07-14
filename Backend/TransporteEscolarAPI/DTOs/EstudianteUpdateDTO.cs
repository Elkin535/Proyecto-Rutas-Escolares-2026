using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class EstudianteUpdateDTO
    {
        [Required]
        public int IdAcudiente { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Apellido { get; set; } = string.Empty;

        [StringLength(100)]
        public string? Colegio { get; set; }

        [StringLength(50)]
        public string? CursoGrado { get; set; }

        public bool Estado { get; set; } = true;

        public int? IdRuta { get; set; }
        public int? IdParada { get; set; }
    }
}

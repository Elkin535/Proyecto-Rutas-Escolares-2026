using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class EstudianteCreateDTO
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
    }
}
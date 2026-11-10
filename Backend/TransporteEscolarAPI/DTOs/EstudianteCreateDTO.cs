using System.ComponentModel.DataAnnotations;

namespace TransporteEscolarAPI.DTOs
{
    public class EstudianteCreateDTO
    {
        [Range(1, int.MaxValue, ErrorMessage = "Debes seleccionar un acudiente.")]
        public int IdAcudiente { get; set; }

        [Required(ErrorMessage = "El nombre es obligatorio.")]
        [StringLength(100, ErrorMessage = "El nombre no puede superar los 100 caracteres.")]
        public string Nombre { get; set; } = string.Empty;

        [Required(ErrorMessage = "El apellido es obligatorio.")]
        [StringLength(100, ErrorMessage = "El apellido no puede superar los 100 caracteres.")]
        public string Apellido { get; set; } = string.Empty;

        [StringLength(100, ErrorMessage = "El colegio no puede superar los 100 caracteres.")]
        public string? Colegio { get; set; }

        [StringLength(50, ErrorMessage = "El grado no puede superar los 50 caracteres.")]
        public string? CursoGrado { get; set; }

        public int? IdRuta { get; set; }

        public int? IdParada { get; set; }
    }
}

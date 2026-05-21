namespace TransporteEscolarAPI.DTOs
{
    public class EstudianteDTO
    {
        public int IdEstudiante { get; set; }
        public int IdAcudiente { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string? Colegio { get; set; }
        public string? CursoGrado { get; set; }
        public bool Estado { get; set; }
    }
}
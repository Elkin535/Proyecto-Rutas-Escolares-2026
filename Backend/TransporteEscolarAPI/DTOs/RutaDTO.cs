namespace TransporteEscolarAPI.DTOs
{
    public class RutaDTO
    {
        public int IdRuta { get; set; }
        public string NombreRuta { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public bool Estado { get; set; }
    }
}

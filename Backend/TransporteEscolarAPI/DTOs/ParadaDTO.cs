namespace TransporteEscolarAPI.DTOs
{
    public class ParadaDTO
    {
        public int IdParada { get; set; }
        public int IdRuta { get; set; }
        public string NombreParada { get; set; } = string.Empty;
        public decimal Latitud { get; set; }
        public decimal Longitud { get; set; }
        public int OrdenVisita { get; set; }
    }
}

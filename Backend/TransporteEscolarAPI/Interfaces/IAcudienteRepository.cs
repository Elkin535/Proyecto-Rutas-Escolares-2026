using System.Collections.Generic;
using System.Threading.Tasks;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Interfaces
{
    public interface IAcudienteRepository
    {
        Task<IEnumerable<Acudiente>> ObtenerTodosAsync();
        Task<(IEnumerable<Acudiente> Items, int TotalCount)> ObtenerPaginadoAsync(int pagina, int limite, string? busqueda);
        Task<Acudiente?> ObtenerPorIdAsync(int id);
        Task<Acudiente?> ObtenerPorIdUsuarioAsync(int idUsuario);
        Task<Acudiente> CrearAsync(Acudiente acudiente);
        Task<bool> ActualizarAsync(Acudiente acudiente);
        Task<bool> EliminarAsync(int id);
    }
}
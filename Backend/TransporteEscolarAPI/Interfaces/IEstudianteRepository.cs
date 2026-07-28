using System.Collections.Generic;
using System.Threading.Tasks;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Interfaces
{
    public interface IEstudianteRepository
    {
        Task<IEnumerable<Estudiante>> ObtenerTodosAsync();
        Task<(IEnumerable<Estudiante> Items, int TotalCount)> ObtenerPaginadoAsync(int pagina, int limite, string? busqueda);
        Task<Estudiante?> ObtenerPorIdAsync(int id);
        Task<IEnumerable<Estudiante>> ObtenerPorAcudienteAsync(int idAcudiente);
        Task<Estudiante> CrearAsync(Estudiante estudiante);
        Task<bool> ActualizarAsync(Estudiante estudiante);
        Task<bool> EliminarAsync(int id);
    }
}
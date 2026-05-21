using System.Collections.Generic;
using System.Threading.Tasks;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Interfaces
{
    public interface IHistorialRepository
    {
        Task<IEnumerable<Historial>> ObtenerTodosAsync();
        Task<Historial?> ObtenerPorIdAsync(int id);
        Task<Historial?> ObtenerViajeActivoPorConductorAsync(int idConductor);
        Task<Historial> CrearAsync(Historial historial);
        Task<bool> ActualizarAsync(Historial historial);
    }
}
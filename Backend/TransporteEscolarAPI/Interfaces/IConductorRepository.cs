using System.Collections.Generic;
using System.Threading.Tasks;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Interfaces
{
    public interface IConductorRepository
    {
        Task<IEnumerable<Conductor>> ObtenerTodosAsync();
        Task<Conductor?> ObtenerPorIdAsync(int id);
        Task<Conductor?> ObtenerPorIdUsuarioAsync(int idUsuario);
        Task<Conductor?> ObtenerPorIdVehiculoAsync(int idVehiculo);
        Task<Conductor> CrearAsync(Conductor conductor);
        Task<bool> ActualizarAsync(Conductor conductor);
        Task<bool> EliminarAsync(int id);
    }
}
using System.Collections.Generic;
using System.Threading.Tasks;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Interfaces
{
    public interface IVehiculoRepository
    {
        Task<IEnumerable<Vehiculo>> ObtenerTodosAsync();
        Task<(IEnumerable<Vehiculo> Items, int TotalCount)> ObtenerPaginadoAsync(int pagina, int limite, string? busqueda);
        Task<Vehiculo?> ObtenerPorIdAsync(int id);
        Task<Vehiculo?> ObtenerPorPlacaAsync(string placa);
        Task<Vehiculo> CrearAsync(Vehiculo vehiculo);
        Task<bool> ActualizarAsync(Vehiculo vehiculo);
        Task<bool> EliminarAsync(int id);
    }
}
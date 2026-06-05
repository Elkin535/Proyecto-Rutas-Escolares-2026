using System.Collections.Generic;
using System.Threading.Tasks;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Interfaces
{
    public interface IParadaRepository
    {
        Task<IEnumerable<Parada>> ObtenerTodasAsync();
        Task<Parada?> ObtenerPorIdAsync(int id);
        Task<IEnumerable<Parada>> ObtenerPorRutaAsync(int idRuta);
        Task<Parada> CrearAsync(Parada parada);
        Task<bool> ActualizarAsync(Parada parada);
        Task<bool> EliminarAsync(int id);
    }
}

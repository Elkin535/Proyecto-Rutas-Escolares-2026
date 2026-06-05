using System.Collections.Generic;
using System.Threading.Tasks;
using TransporteEscolarAPI.Models;

namespace TransporteEscolarAPI.Interfaces
{
    public interface IAsistenciaViajeRepository
    {
        Task<IEnumerable<AsistenciaViaje>> ObtenerPorViajeAsync(int idViaje);
        Task<AsistenciaViaje?> ObtenerPorIdAsync(int id);
        Task<AsistenciaViaje?> ObtenerPorEstudianteYViajeAsync(int idEstudiante, int idViaje);
        Task<AsistenciaViaje> CrearAsync(AsistenciaViaje asistencia);
        Task<bool> ActualizarAsync(AsistenciaViaje asistencia);
        Task<bool> EliminarAsync(int id);
    }
}

using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace TransporteEscolarAPI.Hubs
{
    public class TrackingHub : Hub
    {
        // Los acudientes y conductores se suscriben a las actualizaciones de un viaje específico
        public async Task SuscribirseAlViaje(int idViaje)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"viaje_{idViaje}");
        }

        // Desconectarse al salir o finalizar
        public async Task DesuscribirseDelViaje(int idViaje)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"viaje_{idViaje}");
        }
    }
}

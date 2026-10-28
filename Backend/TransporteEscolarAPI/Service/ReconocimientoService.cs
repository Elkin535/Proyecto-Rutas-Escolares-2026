using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Amazon.Rekognition;
using Amazon.Rekognition.Model;
using Microsoft.Extensions.Configuration;

namespace TransporteEscolarAPI.Service
{
    public interface IReconocimientoService
    {
        // false si la foto no tiene un rostro con calidad suficiente
        Task<bool> RegistrarRostroAsync(int idEstudiante, byte[] imagen);
        // null si no hay rostro en la foto o no coincide con ningún estudiante
        Task<(int IdEstudiante, float Similitud)?> IdentificarAsync(byte[] imagen);
        Task EliminarRostroAsync(int idEstudiante);
    }

    /// <summary>
    /// Reconocimiento facial con AWS Rekognition. Cada estudiante tiene un rostro en la colección,
    /// identificado por ExternalImageId = IdEstudiante. Las credenciales salen de la cadena estándar
    /// de AWS (rol IAM de la instancia EC2, variables de entorno o perfil local).
    /// </summary>
    public class ReconocimientoService : IReconocimientoService
    {
        private readonly IAmazonRekognition _rekognition;
        private readonly string _coleccion;
        private readonly float _umbral;
        private static bool _coleccionLista;
        private static readonly SemaphoreSlim _candado = new(1, 1);

        public ReconocimientoService(IAmazonRekognition rekognition, IConfiguration config)
        {
            _rekognition = rekognition;
            _coleccion = config["AWS:ColeccionRostros"] ?? "schooltrack-estudiantes";
            _umbral = float.TryParse(config["AWS:UmbralSimilitud"], out var u) ? u : 90f;
        }

        private async Task AsegurarColeccionAsync()
        {
            if (_coleccionLista) return;
            await _candado.WaitAsync();
            try
            {
                if (_coleccionLista) return;
                try
                {
                    await _rekognition.CreateCollectionAsync(new CreateCollectionRequest { CollectionId = _coleccion });
                }
                catch (ResourceAlreadyExistsException) { }
                _coleccionLista = true;
            }
            finally
            {
                _candado.Release();
            }
        }

        public async Task<bool> RegistrarRostroAsync(int idEstudiante, byte[] imagen)
        {
            await AsegurarColeccionAsync();
            // Un solo rostro por estudiante: al actualizar la foto se reemplaza el anterior
            await EliminarRostroAsync(idEstudiante);

            var resp = await _rekognition.IndexFacesAsync(new IndexFacesRequest
            {
                CollectionId = _coleccion,
                Image = new Image { Bytes = new MemoryStream(imagen) },
                ExternalImageId = idEstudiante.ToString(),
                MaxFaces = 1,
                QualityFilter = QualityFilter.AUTO,
            });
            return resp.FaceRecords?.Count > 0;
        }

        public async Task<(int IdEstudiante, float Similitud)?> IdentificarAsync(byte[] imagen)
        {
            await AsegurarColeccionAsync();
            try
            {
                var resp = await _rekognition.SearchFacesByImageAsync(new SearchFacesByImageRequest
                {
                    CollectionId = _coleccion,
                    Image = new Image { Bytes = new MemoryStream(imagen) },
                    FaceMatchThreshold = _umbral,
                    MaxFaces = 1,
                });
                var match = resp.FaceMatches?.FirstOrDefault();
                if (match == null || !int.TryParse(match.Face.ExternalImageId, out var id)) return null;
                return (id, match.Similarity ?? 0);
            }
            catch (InvalidParameterException)
            {
                // Rekognition lanza esto cuando la foto no contiene ningún rostro
                return null;
            }
        }

        public async Task EliminarRostroAsync(int idEstudiante)
        {
            await AsegurarColeccionAsync();
            var externo = idEstudiante.ToString();
            var ids = new List<string>();
            string? siguiente = null;
            do
            {
                var pagina = await _rekognition.ListFacesAsync(new ListFacesRequest
                {
                    CollectionId = _coleccion,
                    NextToken = siguiente,
                    MaxResults = 1000,
                });
                ids.AddRange((pagina.Faces ?? new List<Face>()).Where(f => f.ExternalImageId == externo).Select(f => f.FaceId));
                siguiente = pagina.NextToken;
            } while (!string.IsNullOrEmpty(siguiente));

            if (ids.Count > 0)
                await _rekognition.DeleteFacesAsync(new DeleteFacesRequest { CollectionId = _coleccion, FaceIds = ids });
        }
    }
}

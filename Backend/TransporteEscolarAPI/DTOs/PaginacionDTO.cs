using System;
using System.Collections.Generic;

namespace TransporteEscolarAPI.DTOs
{
    /// <summary>
    /// Contenedor genérico para respuestas paginadas y filtradas en la API.
    /// Optimiza el uso de memoria y ancho de banda al transferir únicamente la página solicitada.
    /// </summary>
    /// <typeparam name="T">Tipo de DTO o entidad contenida en la lista.</typeparam>
    public class ResultadoPaginadoDTO<T>
    {
        public IEnumerable<T> Datos { get; set; } = new List<T>();
        public int TotalRegistros { get; set; }
        public int PaginaActual { get; set; }
        public int LimitePorPagina { get; set; }
        public int TotalPaginas => (int)Math.Ceiling((double)TotalRegistros / (LimitePorPagina > 0 ? LimitePorPagina : 10));
    }
}

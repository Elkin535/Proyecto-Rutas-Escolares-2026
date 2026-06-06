using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TransporteEscolarAPI.Migrations
{
    /// <inheritdoc />
    public partial class AgregarRutasYAsistencia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "id_parada",
                table: "estudiante",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "id_ruta",
                table: "estudiante",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "asistencia_viaje",
                columns: table => new
                {
                    id_asistencia = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_viaje = table.Column<int>(type: "integer", nullable: false),
                    id_estudiante = table.Column<int>(type: "integer", nullable: false),
                    estado_abordaje = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    hora_abordaje = table.Column<TimeSpan>(type: "interval", nullable: true),
                    hora_entrega = table.Column<TimeSpan>(type: "interval", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_asistencia_viaje", x => x.id_asistencia);
                });

            migrationBuilder.CreateTable(
                name: "parada",
                columns: table => new
                {
                    id_parada = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_ruta = table.Column<int>(type: "integer", nullable: false),
                    nombre_parada = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    latitud = table.Column<decimal>(type: "numeric", nullable: false),
                    longitud = table.Column<decimal>(type: "numeric", nullable: false),
                    orden_visita = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_parada", x => x.id_parada);
                });

            migrationBuilder.CreateTable(
                name: "ruta",
                columns: table => new
                {
                    id_ruta = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nombre_ruta = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    descripcion = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    estado = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ruta", x => x.id_ruta);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "asistencia_viaje");

            migrationBuilder.DropTable(
                name: "parada");

            migrationBuilder.DropTable(
                name: "ruta");

            migrationBuilder.DropColumn(
                name: "id_parada",
                table: "estudiante");

            migrationBuilder.DropColumn(
                name: "id_ruta",
                table: "estudiante");
        }
    }
}

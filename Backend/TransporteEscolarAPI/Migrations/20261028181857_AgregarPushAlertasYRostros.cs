using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TransporteEscolarAPI.Migrations
{
    /// <inheritdoc />
    public partial class AgregarPushAlertasYRostros : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "rostro_registrado",
                table: "estudiante",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "alerta",
                columns: table => new
                {
                    id_alerta = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    tipo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    id_conductor = table.Column<int>(type: "integer", nullable: false),
                    id_viaje = table.Column<int>(type: "integer", nullable: true),
                    mensaje = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    latitud = table.Column<decimal>(type: "numeric", nullable: true),
                    longitud = table.Column<decimal>(type: "numeric", nullable: true),
                    fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    atendida = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_alerta", x => x.id_alerta);
                });

            migrationBuilder.CreateTable(
                name: "dispositivo_push",
                columns: table => new
                {
                    id_dispositivo = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_usuario = table.Column<int>(type: "integer", nullable: false),
                    token = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    fecha_registro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dispositivo_push", x => x.id_dispositivo);
                });

            migrationBuilder.CreateIndex(
                name: "IX_dispositivo_push_token",
                table: "dispositivo_push",
                column: "token",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "alerta");

            migrationBuilder.DropTable(
                name: "dispositivo_push");

            migrationBuilder.DropColumn(
                name: "rostro_registrado",
                table: "estudiante");
        }
    }
}

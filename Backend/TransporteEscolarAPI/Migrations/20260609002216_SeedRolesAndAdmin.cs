using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TransporteEscolarAPI.Migrations
{
    /// <inheritdoc />
    public partial class SeedRolesAndAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "rol",
                columns: new[] { "id_rol", "nombre_rol" },
                values: new object[,]
                {
                    { 1, "Administrador" },
                    { 2, "Conductor" },
                    { 3, "Acudiente" }
                });

            migrationBuilder.InsertData(
                table: "usuario",
                columns: new[] { "id_usuario", "apellido", "contrasena", "correo", "fecha_creacion", "id_rol", "nombre", "telefono" },
                values: new object[] { 1, "SchoolTrack", "admin123", "admin@schooltrack.com", new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Admin", "123456789" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "rol",
                keyColumn: "id_rol",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "rol",
                keyColumn: "id_rol",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "rol",
                keyColumn: "id_rol",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "usuario",
                keyColumn: "id_usuario",
                keyValue: 1);
        }
    }
}

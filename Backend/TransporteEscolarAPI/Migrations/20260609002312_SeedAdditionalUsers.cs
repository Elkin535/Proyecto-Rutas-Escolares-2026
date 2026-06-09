using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TransporteEscolarAPI.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdditionalUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "usuario",
                columns: new[] { "id_usuario", "apellido", "contrasena", "correo", "fecha_creacion", "id_rol", "nombre", "telefono" },
                values: new object[,]
                {
                    { 2, "Driver", "conductor123", "conductor.carlos@schooltrack.com", new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), 2, "Carlos", "987654321" },
                    { 3, "Parent", "acudiente123", "acudiente.maria@schooltrack.com", new DateTime(2026, 6, 8, 0, 0, 0, 0, DateTimeKind.Utc), 3, "Maria", "555123456" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "usuario",
                keyColumn: "id_usuario",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "usuario",
                keyColumn: "id_usuario",
                keyValue: 3);
        }
    }
}

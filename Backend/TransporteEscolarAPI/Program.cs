using Microsoft.EntityFrameworkCore;
using TransporteEscolarAPI.Data;        // Asegura que apunte a tu carpeta Data
using TransporteEscolarAPI.Interfaces;  // Asegura que apunte a tus Interfaces
using TransporteEscolarAPI.Repositories;// Asegura que apunte a tus Repositorios

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// =========================================================================
// 1. CONEXIÓN A POSTGRESQL (Añadido aquí)
// =========================================================================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQLConnection")));

// =========================================================================
// 2. REGISTRO DE REPOSITORIOS (Añadido aquí)
// =========================================================================
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IRolRepository, RolRepository>();
builder.Services.AddScoped<IAcudienteRepository, AcudienteRepository>();
builder.Services.AddScoped<IConductorRepository, ConductorRepository>();
builder.Services.AddScoped<IEstudianteRepository, EstudianteRepository>();
builder.Services.AddScoped<IVehiculoRepository, VehiculoRepository>(); 
builder.Services.AddScoped<IHistorialRepository, HistorialRepository>();
builder.Services.AddScoped<IRutaRepository, RutaRepository>();
builder.Services.AddScoped<IParadaRepository, ParadaRepository>();
builder.Services.AddScoped<IAsistenciaViajeRepository, AsistenciaViajeRepository>();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

if (args.Contains("--ef-database-update"))
{
    Console.WriteLine("Executing database migrations (--ef-database-update)...");
    try
    {
        using (var scope = app.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.Migrate();
        }
        Console.WriteLine("Database migrations applied successfully.");
        return 0;
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"Error applying database migrations: {ex.Message}");
        return 1;
    }
}

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
    app.MapOpenApi();
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "v1")); // <-- AÑADE ESTA LÍNEA
//}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();
return 0;

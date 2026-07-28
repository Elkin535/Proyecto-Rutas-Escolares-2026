using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TransporteEscolarAPI.Data;
using TransporteEscolarAPI.Interfaces;
using TransporteEscolarAPI.Repositories;
using TransporteEscolarAPI.Service;

var builder = WebApplication.CreateBuilder(args);

// =========================================================================
// 1. CONEXIÓN A POSTGRESQL
// =========================================================================
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("PostgreSQLConnection")));

// =========================================================================
// 2. REGISTRO DE REPOSITORIOS Y SERVICIOS
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

builder.Services.AddScoped<IAuthService, AuthService>();

// =========================================================================
// 3. AUTENTICACIÓN JWT
// =========================================================================
var jwtKey = builder.Configuration["JwtSettings:Key"] 
    ?? throw new InvalidOperationException("JwtSettings:Key no está configurada en appsettings.json");
var jwtIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "SchoolTrackAPI";
var jwtAudience = builder.Configuration["JwtSettings:Audience"] ?? "SchoolTrackWeb";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.FromMinutes(5)
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/trackingHub"))
            {
                context.Token = accessToken;
            }
            return System.Threading.Tasks.Task.CompletedTask;
        }
    };
});

builder.Services.AddSignalR();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000", "https://schooltrack.seminario1.eleueleo.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
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

app.MapOpenApi();
app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "v1"));

app.UseHttpsRedirection();

app.UseCors("AllowAll");

// ⚠️ Usar Autenticación ANTES de Autorización
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<TransporteEscolarAPI.Hubs.TrackingHub>("/trackingHub");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();
return 0;

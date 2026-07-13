using System.Text.Json;
using System.Text.Json.Serialization;
using Api.Auth;
using Api.Data;
using Api.Endpoints;
using Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

var connectionString = DatabaseConnection.Resolve(builder.Configuration);

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddGoogleIdTokenAuth(builder.Configuration);

builder.Services.AddScoped<TaskService>();
builder.Services.AddScoped<PomodoroSessionService>();
builder.Services.AddScoped<ProgressService>();

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(
        new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));

const string webCorsPolicy = "web";
var allowedOrigins = new List<string> { "http://localhost:3000" };
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
if (!string.IsNullOrWhiteSpace(frontendUrl))
{
    allowedOrigins.AddRange(
        frontendUrl.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
}
builder.Services.AddCors(options =>
    options.AddPolicy(webCorsPolicy, policy =>
        policy
            .WithOrigins([.. allowedOrigins])
            .AllowAnyHeader()
            .AllowAnyMethod()));

var app = builder.Build();

app.UseCors(webCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "Pomodoro Otaku API");
app.MapTaskEndpoints();
app.MapPomodoroSessionEndpoints();
app.MapProgressEndpoints();

app.Run();

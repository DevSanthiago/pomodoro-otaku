using System.Text.Json;
using System.Text.Json.Serialization;
using Api.Data;
using Api.Endpoints;
using Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = DatabaseConnection.Resolve(builder.Configuration);

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddScoped<TaskService>();
builder.Services.AddScoped<PomodoroSessionService>();
builder.Services.AddScoped<ProgressService>();

builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(
        new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)));

const string webCorsPolicy = "web";
builder.Services.AddCors(options =>
    options.AddPolicy(webCorsPolicy, policy =>
        policy
            .WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()));

var app = builder.Build();

app.UseCors(webCorsPolicy);

app.MapGet("/", () => "Pomodoro Otaku API");
app.MapTaskEndpoints();
app.MapPomodoroSessionEndpoints();
app.MapProgressEndpoints();

app.Run();

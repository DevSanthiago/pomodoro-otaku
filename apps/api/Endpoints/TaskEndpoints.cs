using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints;

public static class TaskEndpoints
{
    public static RouteGroupBuilder MapTaskEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/tasks");

        group.MapGet("/", async (AppDbContext db) =>
            await db.Tasks.OrderByDescending(task => task.CriadaEm).ToListAsync());

        group.MapGet("/{id:guid}", async Task<Results<Ok<TaskItem>, NotFound>> (Guid id, AppDbContext db) =>
        {
            var task = await db.Tasks.FindAsync(id);
            return task is null ? TypedResults.NotFound() : TypedResults.Ok(task);
        });

        group.MapPost("/", async Task<Results<Created<TaskItem>, ValidationProblem>> (
            CreateTaskDto dto,
            AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(dto.Titulo))
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["titulo"] = ["Título é obrigatório"],
                });
            }

            var task = new TaskItem
            {
                Id = Guid.NewGuid(),
                Titulo = dto.Titulo.Trim(),
                Descricao = string.IsNullOrWhiteSpace(dto.Descricao) ? null : dto.Descricao.Trim(),
                Status = TaskItemStatus.Pendente,
                PomodorosEstimados = Math.Max(0, dto.PomodorosEstimados),
                PomodorosCompletados = 0,
                CriadaEm = DateTime.UtcNow,
            };

            db.Tasks.Add(task);
            await db.SaveChangesAsync();
            return TypedResults.Created($"/tasks/{task.Id}", task);
        });

        group.MapPut("/{id:guid}", async Task<Results<Ok<TaskItem>, NotFound>> (
            Guid id,
            UpdateTaskDto dto,
            AppDbContext db) =>
        {
            var task = await db.Tasks.FindAsync(id);
            if (task is null) return TypedResults.NotFound();

            task.Titulo = dto.Titulo.Trim();
            task.Descricao = string.IsNullOrWhiteSpace(dto.Descricao) ? null : dto.Descricao.Trim();
            task.Status = dto.Status;
            task.PomodorosEstimados = Math.Max(0, dto.PomodorosEstimados);
            task.PomodorosCompletados = Math.Max(0, dto.PomodorosCompletados);

            await db.SaveChangesAsync();
            return TypedResults.Ok(task);
        });

        group.MapDelete("/{id:guid}", async Task<Results<NoContent, NotFound>> (Guid id, AppDbContext db) =>
        {
            var task = await db.Tasks.FindAsync(id);
            if (task is null) return TypedResults.NotFound();

            db.Tasks.Remove(task);
            await db.SaveChangesAsync();
            return TypedResults.NoContent();
        });

        return group;
    }
}

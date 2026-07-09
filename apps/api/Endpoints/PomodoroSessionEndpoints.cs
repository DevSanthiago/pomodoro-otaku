using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints;

public static class PomodoroSessionEndpoints
{
    public static RouteGroupBuilder MapPomodoroSessionEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/pomodoro-sessions");

        group.MapGet("/", async (Guid? taskId, AppDbContext db) =>
        {
            var query = db.PomodoroSessions.AsQueryable();
            if (taskId is not null)
            {
                query = query.Where(session => session.TaskId == taskId);
            }

            return await query.OrderByDescending(session => session.IniciadoEm).ToListAsync();
        });

        group.MapPost("/", async Task<Results<Created<PomodoroSession>, ValidationProblem>> (
            CreateSessionDto dto,
            AppDbContext db) =>
        {
            if (dto.DuracaoSegundos <= 0)
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["duracaoSegundos"] = ["Duração deve ser maior que zero"],
                });
            }

            if (dto.TaskId is not null && !await db.Tasks.AnyAsync(task => task.Id == dto.TaskId))
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["taskId"] = ["Tarefa não encontrada"],
                });
            }

            var session = new PomodoroSession
            {
                Id = Guid.NewGuid(),
                TaskId = dto.TaskId,
                Tipo = dto.Tipo,
                DuracaoSegundos = dto.DuracaoSegundos,
                IniciadoEm = dto.IniciadoEm,
                CompletadoEm = dto.CompletadoEm,
                FoiInterrompido = dto.FoiInterrompido,
            };

            db.PomodoroSessions.Add(session);
            await db.SaveChangesAsync();
            return TypedResults.Created($"/pomodoro-sessions/{session.Id}", session);
        });

        return group;
    }
}

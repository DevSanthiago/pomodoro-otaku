using Api.Domain;
using Api.Models;
using Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Api.Endpoints;

public static class PomodoroSessionEndpoints
{
    public static RouteGroupBuilder MapPomodoroSessionEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/pomodoro-sessions");

        group.MapGet("/", (Guid? taskId, PomodoroSessionService sessions) =>
            sessions.GetAsync(taskId));

        group.MapPost("/", async Task<Results<Created<PomodoroSession>, ValidationProblem>> (
            CreateSessionDto dto,
            PomodoroSessionService sessions) =>
        {
            var result = await sessions.CreateAsync(dto);
            return result.Status switch
            {
                ResultStatus.Success =>
                    TypedResults.Created($"/pomodoro-sessions/{result.Value!.Id}", result.Value),
                _ => ValidationResults.From(result),
            };
        });

        return group;
    }
}

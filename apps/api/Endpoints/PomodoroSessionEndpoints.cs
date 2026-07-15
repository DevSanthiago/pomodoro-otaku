using System.Security.Claims;
using Api.Auth;
using Api.Domain;
using Api.Models;
using Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Api.Endpoints;

public static class PomodoroSessionEndpoints
{
    public static RouteGroupBuilder MapPomodoroSessionEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes
            .MapGroup("/pomodoro-sessions")
            .RequireAuthorization(ApiAuth.UsuarioPolicy);

        group.MapGet("/", (Guid? taskId, ClaimsPrincipal user, PomodoroSessionService sessions) =>
            sessions.GetAsync(user.UserId(), taskId));

        group.MapPost("/", async Task<Results<Created<PomodoroSession>, ValidationProblem>> (
            CreateSessionDto dto,
            ClaimsPrincipal user,
            PomodoroSessionService sessions) =>
        {
            var result = await sessions.CreateAsync(user.UserId(), dto);
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

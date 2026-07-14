using System.Security.Claims;
using Api.Auth;
using Api.Domain;
using Api.Models;
using Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Api.Endpoints;

public static class TaskEndpoints
{
    public static RouteGroupBuilder MapTaskEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/tasks").RequireAuthorization(GoogleAuth.UsuarioPolicy);

        group.MapGet("/", (ClaimsPrincipal user, TaskService tasks) =>
            tasks.GetAllAsync(user.UserId()));

        group.MapGet("/{id:guid}", async Task<Results<Ok<TaskItem>, NotFound>> (
            Guid id,
            ClaimsPrincipal user,
            TaskService tasks) =>
        {
            var task = await tasks.GetAsync(user.UserId(), id);
            return task is null ? TypedResults.NotFound() : TypedResults.Ok(task);
        });

        group.MapPost("/", async Task<Results<Created<TaskItem>, ValidationProblem>> (
            CreateTaskDto dto,
            ClaimsPrincipal user,
            TaskService tasks) =>
        {
            var result = await tasks.CreateAsync(user.UserId(), dto);
            return result.Status switch
            {
                ResultStatus.Success => TypedResults.Created($"/tasks/{result.Value!.Id}", result.Value),
                _ => ValidationResults.From(result),
            };
        });

        group.MapPut("/{id:guid}", async Task<Results<Ok<TaskItem>, ValidationProblem>> (
            Guid id,
            PutTaskDto dto,
            ClaimsPrincipal user,
            TaskService tasks) =>
        {
            var result = await tasks.UpsertAsync(user.UserId(), id, dto);
            return result.Status switch
            {
                ResultStatus.Success => TypedResults.Ok(result.Value),
                _ => ValidationResults.From(result),
            };
        });

        group.MapDelete("/{id:guid}", async Task<Results<NoContent, NotFound>> (
            Guid id,
            ClaimsPrincipal user,
            TaskService tasks) =>
        {
            var deleted = await tasks.DeleteAsync(user.UserId(), id);
            return deleted ? TypedResults.NoContent() : TypedResults.NotFound();
        });

        return group;
    }
}

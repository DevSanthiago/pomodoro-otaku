using Api.Domain;
using Api.Models;
using Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Api.Endpoints;

public static class TaskEndpoints
{
    public static RouteGroupBuilder MapTaskEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/tasks");

        group.MapGet("/", (TaskService tasks) => tasks.GetAllAsync());

        group.MapGet("/{id:guid}", async Task<Results<Ok<TaskItem>, NotFound>> (
            Guid id,
            TaskService tasks) =>
        {
            var task = await tasks.GetAsync(id);
            return task is null ? TypedResults.NotFound() : TypedResults.Ok(task);
        });

        group.MapPost("/", async Task<Results<Created<TaskItem>, ValidationProblem>> (
            CreateTaskDto dto,
            TaskService tasks) =>
        {
            var result = await tasks.CreateAsync(dto);
            return result.Status switch
            {
                ResultStatus.Success => TypedResults.Created($"/tasks/{result.Value!.Id}", result.Value),
                _ => ValidationResults.From(result),
            };
        });

        group.MapPut("/{id:guid}", async Task<Results<Ok<TaskItem>, ValidationProblem>> (
            Guid id,
            PutTaskDto dto,
            TaskService tasks) =>
        {
            var result = await tasks.UpsertAsync(id, dto);
            return result.Status switch
            {
                ResultStatus.Success => TypedResults.Ok(result.Value),
                _ => ValidationResults.From(result),
            };
        });

        group.MapDelete("/{id:guid}", async Task<Results<NoContent, NotFound>> (
            Guid id,
            TaskService tasks) =>
        {
            var deleted = await tasks.DeleteAsync(id);
            return deleted ? TypedResults.NoContent() : TypedResults.NotFound();
        });

        return group;
    }
}

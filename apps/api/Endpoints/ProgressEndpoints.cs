using Api.Services;

namespace Api.Endpoints;

public static class ProgressEndpoints
{
    public static RouteGroupBuilder MapProgressEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/progress");

        group.MapGet("/", (ProgressService progress) => progress.GetOrCreateAsync());

        group.MapPost("/xp", (AddXpDto dto, ProgressService progress) =>
            progress.AddXpAsync(dto.Xp));

        return group;
    }
}

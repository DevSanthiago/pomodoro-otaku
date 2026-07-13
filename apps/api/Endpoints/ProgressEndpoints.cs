using System.Security.Claims;
using Api.Auth;
using Api.Services;

namespace Api.Endpoints;

public static class ProgressEndpoints
{
    public static RouteGroupBuilder MapProgressEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/progress").RequireAuthorization(GoogleAuth.AllowlistPolicy);

        group.MapGet("/", (ClaimsPrincipal user, ProgressService progress) =>
            progress.GetOrCreateAsync(user.UserId()));

        group.MapPut("/", (PutProgressDto dto, ClaimsPrincipal user, ProgressService progress) =>
            progress.UpsertAsync(user.UserId(), dto));

        return group;
    }
}

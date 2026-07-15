using Api.Domain;
using Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Api.Endpoints;

public static class AuthEndpoints
{
    public const string RateLimitPolicy = "auth";

    public static RouteGroupBuilder MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/auth").RequireRateLimiting(RateLimitPolicy);

        group.MapPost("/register", async Task<Results<Ok<AuthResponseDto>, ValidationProblem>> (
            RegisterDto dto,
            AuthService auth) => Responder(await auth.RegisterAsync(dto)));

        group.MapPost("/login", async Task<Results<Ok<AuthResponseDto>, ValidationProblem>> (
            LoginDto dto,
            AuthService auth) => Responder(await auth.LoginAsync(dto)));

        group.MapPost("/google", async Task<Results<Ok<AuthResponseDto>, ValidationProblem>> (
            GoogleSignInDto dto,
            AuthService auth) => Responder(await auth.GoogleAsync(dto)));

        return group;
    }

    private static Results<Ok<AuthResponseDto>, ValidationProblem> Responder(
        OperationResult<AuthResult> result)
    {
        if (result.Status is not ResultStatus.Success || result.Value is null)
        {
            return ValidationResults.From(result);
        }

        var (user, token, expiraEm) = result.Value;
        return TypedResults.Ok(
            new AuthResponseDto(token, expiraEm, user.Id, user.Email, user.NomeExibicao));
    }
}

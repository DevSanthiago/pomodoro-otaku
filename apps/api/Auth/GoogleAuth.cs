using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace Api.Auth;

public static class GoogleAuth
{
    public const string UsuarioPolicy = "usuario";

    public const string SubClaim = "sub";
    public const string EmailClaim = "email";
    public const string EmailVerifiedClaim = "email_verified";

    private const string GoogleIssuer = "https://accounts.google.com";
    private const string LegacyGoogleIssuer = "accounts.google.com";

    public static IServiceCollection AddGoogleIdTokenAuth(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var clientId = configuration["GOOGLE_CLIENT_ID"]
            ?? throw new InvalidOperationException("GOOGLE_CLIENT_ID não configurado");

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = GoogleIssuer;
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuers = [GoogleIssuer, LegacyGoogleIssuer],
                    ValidateAudience = true,
                    ValidAudience = clientId,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    NameClaimType = SubClaim,
                };
            });

        services.AddAuthorizationBuilder().AddPolicy(UsuarioPolicy, policy =>
            policy.RequireAssertion(context =>
            {
                var sub = context.User.FindFirstValue(SubClaim);
                var emailVerificado = context.User.FindFirstValue(EmailVerifiedClaim);
                return !string.IsNullOrWhiteSpace(sub)
                    && string.Equals(emailVerificado, "true", StringComparison.OrdinalIgnoreCase);
            }));

        return services;
    }

    public static string UserId(this ClaimsPrincipal user) =>
        user.FindFirstValue(SubClaim)
            ?? throw new InvalidOperationException("Token sem claim sub");
}

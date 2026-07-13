using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace Api.Auth;

public static class GoogleAuth
{
    public const string AllowlistPolicy = "allowlist";

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

        var allowedEmails = (configuration["ALLOWED_EMAILS"] ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Select(email => email.ToLowerInvariant())
            .ToHashSet();

        if (allowedEmails.Count == 0)
        {
            throw new InvalidOperationException("ALLOWED_EMAILS não configurado");
        }

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

        services.AddAuthorizationBuilder().AddPolicy(AllowlistPolicy, policy =>
            policy.RequireAssertion(context =>
            {
                var email = context.User.FindFirstValue(EmailClaim)?.ToLowerInvariant();
                var verificado = context.User.FindFirstValue(EmailVerifiedClaim);
                return email is not null
                    && string.Equals(verificado, "true", StringComparison.OrdinalIgnoreCase)
                    && allowedEmails.Contains(email);
            }));

        return services;
    }

    public static string UserId(this ClaimsPrincipal user) =>
        user.FindFirstValue(SubClaim)
            ?? throw new InvalidOperationException("Token sem claim sub");
}

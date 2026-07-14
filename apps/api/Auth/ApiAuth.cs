using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace Api.Auth;

public static class ApiAuth
{
    public const string UsuarioPolicy = "usuario";

    public static IServiceCollection AddApiAuth(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var secret = configuration["JWT_SECRET"]
            ?? throw new InvalidOperationException("JWT_SECRET não configurado");

        services.AddSingleton<TokenIssuer>();

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.MapInboundClaims = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = TokenIssuer.Issuer,
                    ValidateAudience = true,
                    ValidAudience = TokenIssuer.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    NameClaimType = JwtRegisteredClaimNames.Sub,
                };
            });

        services.AddAuthorizationBuilder().AddPolicy(UsuarioPolicy, policy =>
            policy.RequireAssertion(context =>
                Guid.TryParse(context.User.FindFirstValue(JwtRegisteredClaimNames.Sub), out _)));

        return services;
    }

    public static string UserId(this ClaimsPrincipal user) =>
        user.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? throw new InvalidOperationException("Token sem claim sub");
}

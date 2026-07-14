using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace Api.Auth;

public class TokenIssuer(IConfiguration configuration)
{
    public const string Issuer = "pomodoro-otaku-api";
    public const string Audience = "pomodoro-otaku-web";

    private static readonly TimeSpan Validade = TimeSpan.FromDays(7);

    private readonly SymmetricSecurityKey key = new(
        Encoding.UTF8.GetBytes(
            configuration["JWT_SECRET"]
                ?? throw new InvalidOperationException("JWT_SECRET não configurado")));

    public (string Token, DateTime ExpiraEm) Emitir(User user)
    {
        var expiraEm = DateTime.UtcNow.Add(Validade);
        var token = new JwtSecurityToken(
            issuer: Issuer,
            audience: Audience,
            claims:
            [
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            ],
            expires: expiraEm,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return (new JwtSecurityTokenHandler().WriteToken(token), expiraEm);
    }
}

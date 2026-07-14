using Api.Auth;
using Api.Data;
using Api.Domain;
using Api.Endpoints;
using Api.Models;
using Google.Apis.Auth;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public record AuthResult(User User, string Token, DateTime ExpiraEm);

public class AuthService(AppDbContext db, TokenIssuer tokens, IConfiguration configuration)
{
    private const string CredenciaisInvalidas = "E-mail ou senha inválidos";

    private static readonly string HashFalso = PasswordHasher.Hash(Guid.NewGuid().ToString());

    public async Task<OperationResult<AuthResult>> RegisterAsync(RegisterDto dto)
    {
        var erroEmail = ContaRules.ValidateEmail(dto.Email);
        if (erroEmail is not null) return OperationResult<AuthResult>.Invalid("email", erroEmail);

        var erroSenha = ContaRules.ValidateSenha(dto.Senha);
        if (erroSenha is not null) return OperationResult<AuthResult>.Invalid("senha", erroSenha);

        var email = ContaRules.NormalizeEmail(dto.Email);
        if (await db.Users.AnyAsync(user => user.Email == email))
        {
            return OperationResult<AuthResult>.Invalid("email", "E-mail já cadastrado");
        }

        var nome = string.IsNullOrWhiteSpace(dto.Nome)
            ? ContaRules.NomeFromEmail(email)
            : ContaRules.NormalizeNome(dto.Nome);

        var novo = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            NomeExibicao = nome,
            SenhaHash = PasswordHasher.Hash(dto.Senha),
            EmailVerificado = false,
            CriadoEm = DateTime.UtcNow,
        };

        db.Users.Add(novo);
        await db.SaveChangesAsync();

        return Emitir(novo);
    }

    public async Task<OperationResult<AuthResult>> LoginAsync(LoginDto dto)
    {
        var email = ContaRules.NormalizeEmail(dto.Email);
        var user = await db.Users.FirstOrDefaultAsync(item => item.Email == email);

        if (user?.SenhaHash is null)
        {
            PasswordHasher.Verify(dto.Senha, HashFalso);
            return OperationResult<AuthResult>.Invalid("credenciais", CredenciaisInvalidas);
        }

        if (!PasswordHasher.Verify(dto.Senha, user.SenhaHash))
        {
            return OperationResult<AuthResult>.Invalid("credenciais", CredenciaisInvalidas);
        }

        return Emitir(user);
    }

    public async Task<OperationResult<AuthResult>> GoogleAsync(GoogleSignInDto dto)
    {
        var clientId = configuration["GOOGLE_CLIENT_ID"]
            ?? throw new InvalidOperationException("GOOGLE_CLIENT_ID não configurado");

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(
                dto.IdToken,
                new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = [clientId],
                });
        }
        catch (InvalidJwtException)
        {
            return OperationResult<AuthResult>.Invalid("idToken", "Token do Google inválido");
        }

        if (!payload.EmailVerified)
        {
            return OperationResult<AuthResult>.Invalid("idToken", "E-mail do Google não verificado");
        }

        var email = ContaRules.NormalizeEmail(payload.Email);
        var user = await db.Users.FirstOrDefaultAsync(item => item.GoogleSub == payload.Subject)
            ?? await db.Users.FirstOrDefaultAsync(item => item.Email == email);

        if (user is null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                NomeExibicao = string.IsNullOrWhiteSpace(payload.Name)
                    ? ContaRules.NomeFromEmail(email)
                    : payload.Name,
                GoogleSub = payload.Subject,
                EmailVerificado = true,
                CriadoEm = DateTime.UtcNow,
            };
            db.Users.Add(user);
        }
        else
        {
            user.GoogleSub ??= payload.Subject;
            user.EmailVerificado = true;
        }

        await db.SaveChangesAsync();
        return Emitir(user);
    }

    private OperationResult<AuthResult> Emitir(User user)
    {
        var (token, expiraEm) = tokens.Emitir(user);
        return OperationResult<AuthResult>.Success(new AuthResult(user, token, expiraEm));
    }
}

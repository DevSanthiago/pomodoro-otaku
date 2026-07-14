using System.Net.Mail;

namespace Api.Domain;

public static class ContaRules
{
    public const int MinSenha = 8;
    public const int MaxSenha = 128;

    public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    public static string NormalizeNome(string nome) => nome.Trim();

    public static string? ValidateEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return "E-mail é obrigatório";
        return MailAddress.TryCreate(email.Trim(), out _) ? null : "E-mail inválido";
    }

    public static string? ValidateSenha(string senha)
    {
        if (string.IsNullOrWhiteSpace(senha)) return "Senha é obrigatória";
        if (senha.Length < MinSenha) return $"Senha precisa de pelo menos {MinSenha} caracteres";
        if (senha.Length > MaxSenha) return $"Senha pode ter no máximo {MaxSenha} caracteres";
        return null;
    }

    public static string? ValidateNome(string nome) =>
        string.IsNullOrWhiteSpace(nome) ? "Nome é obrigatório" : null;

    public static string NomeFromEmail(string email) => email.Split('@')[0];
}

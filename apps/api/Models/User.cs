using System.Text.Json.Serialization;

namespace Api.Models;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string NomeExibicao { get; set; } = string.Empty;

    [JsonIgnore]
    public string? SenhaHash { get; set; }

    [JsonIgnore]
    public string? GoogleSub { get; set; }
    public bool EmailVerificado { get; set; }
    public DateTime CriadoEm { get; set; }
}

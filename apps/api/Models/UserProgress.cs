using System.Text.Json.Serialization;

namespace Api.Models;

public class UserProgress
{
    public Guid Id { get; set; }

    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
    public int XpTotal { get; set; }
    public int FocosConcluidos { get; set; }
    public int TarefasConcluidas { get; set; }
    public int Nivel { get; set; } = 1;
    public int StreakAtual { get; set; }
    public int StreakRecorde { get; set; }
    public DateOnly? UltimoDiaFoco { get; set; }
    public string PersonagemAtual { get; set; } = string.Empty;
    public List<string> ConquistasDesbloqueadas { get; set; } = [];
    public DateTime AtualizadaEm { get; set; }
}

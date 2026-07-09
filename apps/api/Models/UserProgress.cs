namespace Api.Models;

public class UserProgress
{
    public Guid Id { get; set; }
    public int XpTotal { get; set; }
    public int Nivel { get; set; } = 1;
    public int StreakAtual { get; set; }
    public int StreakRecorde { get; set; }
    public string PersonagemAtual { get; set; } = string.Empty;
    public List<string> ConquistasDesbloqueadas { get; set; } = [];
}

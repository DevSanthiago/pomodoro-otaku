using System.Text.Json.Serialization;

namespace Api.Models;

public enum SessionType
{
    Foco,
    PausaCurta,
    PausaLonga,
}

public class PomodoroSession
{
    public Guid Id { get; set; }

    [JsonIgnore]
    public string UserId { get; set; } = string.Empty;
    public Guid? TaskId { get; set; }

    [JsonIgnore]
    public TaskItem? Task { get; set; }
    public SessionType Tipo { get; set; }
    public int DuracaoSegundos { get; set; }
    public DateTime IniciadoEm { get; set; }
    public DateTime? CompletadoEm { get; set; }
    public bool FoiInterrompido { get; set; }
}

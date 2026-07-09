namespace Api.Models;

public enum TaskItemStatus
{
    Pendente,
    EmAndamento,
    Concluida,
}

public class TaskItem
{
    public Guid Id { get; set; }
    public string Titulo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public TaskItemStatus Status { get; set; } = TaskItemStatus.Pendente;
    public int PomodorosEstimados { get; set; }
    public int PomodorosCompletados { get; set; }
    public DateTime CriadaEm { get; set; }
}

using Api.Models;

namespace Api.Endpoints;

public record CreateTaskDto(string Titulo, string? Descricao, int PomodorosEstimados);

public record UpdateTaskDto(
    string Titulo,
    string? Descricao,
    TaskItemStatus Status,
    int PomodorosEstimados,
    int PomodorosCompletados
);

public record CreateSessionDto(
    Guid? TaskId,
    SessionType Tipo,
    int DuracaoSegundos,
    DateTime IniciadoEm,
    DateTime? CompletadoEm,
    bool FoiInterrompido
);

public record AddXpDto(int Xp);

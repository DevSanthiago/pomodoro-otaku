namespace Api.Domain;

public static class TaskRules
{
    public const int MaxPomodorosEstimados = 99;

    public static string NormalizeTitulo(string titulo) => titulo.Trim();

    public static string? NormalizeDescricao(string? descricao) =>
        string.IsNullOrWhiteSpace(descricao) ? null : descricao.Trim();

    public static int ClampEstimados(int value) => Math.Clamp(value, 0, MaxPomodorosEstimados);

    public static int ClampCompletados(int value) => Math.Max(0, value);

    public static string? ValidateTitulo(string titulo) =>
        string.IsNullOrWhiteSpace(titulo) ? "Título é obrigatório" : null;
}

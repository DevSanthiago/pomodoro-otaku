namespace Api.Models;

public static class Leveling
{
    public const int XpPorNivel = 100;

    public static int NivelParaXp(int xpTotal)
    {
        if (xpTotal < 0) return 1;
        return 1 + xpTotal / XpPorNivel;
    }
}

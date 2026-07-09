namespace Api.Domain;

public readonly record struct OfaTier(int Nivel, string Nome, int XpMinimo);

public static class OneForAll
{
    public static readonly OfaTier[] Tiers =
    [
        new(1, "Herdeiro de One For All", 0),
        new(2, "Faísca", 100),
        new(3, "Full Cowl 5%", 300),
        new(4, "Full Cowl 8% — Shoot Style", 600),
        new(5, "Full Cowl 20%", 1200),
        new(6, "Full Cowl 30%", 2200),
        new(7, "Full Cowl 45%", 3800),
        new(8, "Full Cowl 100%", 6500),
        new(9, "United States of Smash", 11000),
    ];

    public static OfaTier TierParaXp(int xpTotal)
    {
        var atual = Tiers[0];
        foreach (var tier in Tiers)
        {
            if (xpTotal >= tier.XpMinimo) atual = tier;
            else break;
        }
        return atual;
    }

    public static int NivelParaXp(int xpTotal) => TierParaXp(xpTotal).Nivel;

    public static string PersonagemParaXp(int xpTotal) => TierParaXp(xpTotal).Nome;
}
